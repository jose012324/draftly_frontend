/**
 * Draftly API client.
 *
 * Every HTTP call the frontend makes to the Django backend lives in this
 * file. Components and pages never talk to axios directly — they import the
 * grouped helpers (`authApi`, `usersApi`, `documentsApi`, `sharingApi`) from
 * here, which keeps the API surface in a single, easy to audit place.
 *
 * Backend endpoints (Django REST Framework, mounted under /api/):
 *
 *   POST   /api/auth/register/                -> { token, user }
 *   POST   /api/auth/login/                   -> { token, user }
 *   POST   /api/auth/logout/                  -> 204
 *   GET    /api/auth/me/                      -> user
 *   GET    /api/users/?search=                -> [user]
 *   GET    /api/documents/?scope=&search=     -> [document]
 *   POST   /api/documents/                    -> document
 *   GET    /api/documents/<id>/               -> document
 *   PATCH  /api/documents/<id>/               -> document
 *   DELETE /api/documents/<id>/               -> 204 (moves to trash)
 *   POST   /api/documents/<id>/restore/       -> document
 *   DELETE /api/documents/<id>/purge/         -> 204 (permanent delete)
 *   POST   /api/documents/import/             -> document (multipart upload)
 *   GET    /api/documents/<id>/permissions/   -> [permission]
 *   POST   /api/documents/<id>/share/         -> permission
 *   PATCH  /api/documents/<id>/permissions/<pid>/ -> permission
 *   DELETE /api/documents/<id>/share/<user_id>/   -> 204
 */

import axios, { type AxiosError, type AxiosInstance } from 'axios';

import type {
  AuthResponse,
  CreateDocumentPayload,
  DocumentDetail,
  DocumentListParams,
  DocumentSummary,
  Share,
  ShareRole,
  TiptapDocument,
  UpdateDocumentPayload,
  User,
} from '../types';

/* ------------------------------------------------------------------ */
/* Configuration                                                       */
/* ------------------------------------------------------------------ */

/**
 * Base URL of the REST API.
 *
 * - Development: empty -> the app calls "/api/..." and the Vite dev server
 *   proxies those requests to the Django server (no CORS involved).
 * - Production: set VITE_API_BASE_URL to the public URL.
 *
 * The WebSocket URL is derived from this one (see services/realtime.ts).
 */
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || '/api';

const TOKEN_STORAGE_KEY = 'draftly.auth.token';

/** Fired when the API answers with 401 so the app can drop the session. */
export const UNAUTHORIZED_EVENT = 'draftly:unauthorized';

/* ------------------------------------------------------------------ */
/* Token storage                                                       */
/* ------------------------------------------------------------------ */

export const tokenStorage = {
  get(): string | null {
    try {
      return window.localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  },
  set(token: string): void {
    try {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch {
      /* storage unavailable (private mode) — the session stays in memory */
    }
  },
  clear(): void {
    try {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  },
};

/* ------------------------------------------------------------------ */
/* HTTP client                                                         */
/* ------------------------------------------------------------------ */

export const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  // No default Content-Type: axios sets "application/json" for JSON payloads
  // and lets the browser set the multipart boundary for FormData uploads.
  timeout: 30_000,
});

http.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.set('Authorization', `Token ${token}`);
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      tokenStorage.clear();
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    return Promise.reject(error);
  },
);

/* ------------------------------------------------------------------ */
/* Error helpers                                                       */
/* ------------------------------------------------------------------ */

/**
 * Turns any thrown value into a human readable message.
 * DRF validation errors look like `{ "title": ["This field is required."] }`.
 */
export function getErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as Record<string, unknown> | undefined;

    if (data) {
      if (typeof data.detail === 'string') {
        return data.detail;
      }
      const firstKey = Object.keys(data)[0];
      if (firstKey) {
        const value = data[firstKey];
        if (Array.isArray(value) && value.length > 0) {
          return value.map((item) => String(item)).join(' ');
        }
        if (typeof value === 'string') {
          return value;
        }
      }
    }

    if (error.code === 'ERR_NETWORK') {
      return 'Cannot reach the Draftly server. Make sure the Django API is running on port 8000.';
    }
    if (error.response?.status === 403) {
      return 'You do not have permission to perform this action.';
    }
    if (error.response?.status === 404) {
      return 'The requested item could not be found.';
    }
    if (error.response?.status === 413) {
      return 'That file is too large to import.';
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

/* ------------------------------------------------------------------ */
/* Authentication                                                      */
/* ------------------------------------------------------------------ */

export interface RegisterPayload {
  email: string;
  password: string;
  full_name?: string;
}

export const authApi = {
  /** POST /api/auth/register/ */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await http.post<AuthResponse>('/auth/register/', {
      email: payload.email.trim(),
      password: payload.password,
      ...(payload.full_name?.trim() ? { full_name: payload.full_name.trim() } : {}),
    });
    tokenStorage.set(data.token);
    return data;
  },

  /** POST /api/auth/login/ */
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await http.post<AuthResponse>('/auth/login/', {
      email: email.trim(),
      password,
    });
    tokenStorage.set(data.token);
    return data;
  },

  /** POST /api/auth/logout/ */
  async logout(): Promise<void> {
    try {
      await http.post('/auth/logout/');
    } finally {
      tokenStorage.clear();
    }
  },

  /** GET /api/auth/me/ */
  async me(signal?: AbortSignal): Promise<User> {
    const { data } = await http.get<User>('/auth/me/', { signal });
    return data;
  },
};

/* ------------------------------------------------------------------ */
/* Users (used by the share dialog)                                    */
/* ------------------------------------------------------------------ */

export const usersApi = {
  /** GET /api/users/?search= */
  async list(search = '', signal?: AbortSignal): Promise<User[]> {
    const { data } = await http.get<User[]>('/users/', {
      params: search ? { search } : undefined,
      signal,
    });
    return Array.isArray(data) ? data : [];
  },
};

/* ------------------------------------------------------------------ */
/* Documents                                                           */
/* ------------------------------------------------------------------ */

export type DownloadFormat = 'docx' | 'original' | 'md' | 'html' | 'txt' | 'json';

/** Reads the file name out of a Content-Disposition header. */
function filenameFromDisposition(header: string | undefined): string | null {
  if (!header) return null;

  // Django uses RFC 5987 for non-ASCII file names: filename*=UTF-8''name.docx
  const encoded = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(header);
  if (encoded) {
    try {
      return decodeURIComponent(encoded[1].trim());
    } catch {
      return encoded[1].trim();
    }
  }

  const match = /filename="?([^";]+)"?/i.exec(header);
  return match ? match[1] : null;
}

export const documentsApi = {
  /** GET /api/documents/ */
  async list(params: DocumentListParams = {}): Promise<DocumentSummary[]> {
    const { scope, search, signal } = params;
    const { data } = await http.get<DocumentSummary[]>('/documents/', {
      params: {
        ...(scope && scope !== 'all' ? { scope } : {}),
        ...(search ? { search } : {}),
      },
      signal,
    });
    return Array.isArray(data) ? data : [];
  },

  /** POST /api/documents/ */
  async create(payload: CreateDocumentPayload = {}): Promise<DocumentDetail> {
    const { data } = await http.post<DocumentDetail>('/documents/', payload);
    return data;
  },

  /** GET /api/documents/<id>/ */
  async get(id: string, signal?: AbortSignal): Promise<DocumentDetail> {
    const { data } = await http.get<DocumentDetail>(`/documents/${id}/`, { signal });
    return data;
  },

  /** PATCH /api/documents/<id>/ */
  async update(id: string, payload: UpdateDocumentPayload): Promise<DocumentDetail> {
    const { data } = await http.patch<DocumentDetail>(`/documents/${id}/`, payload);
    return data;
  },

  /** DELETE /api/documents/<id>/ — soft delete, the document moves to trash. */
  async remove(id: string): Promise<void> {
    await http.delete(`/documents/${id}/`);
  },

  /** POST /api/documents/<id>/restore/ */
  async restore(id: string): Promise<DocumentDetail> {
    const { data } = await http.post<DocumentDetail>(`/documents/${id}/restore/`);
    return data;
  },

  /** DELETE /api/documents/<id>/purge/ — permanent delete. */
  async purge(id: string): Promise<void> {
    await http.delete(`/documents/${id}/purge/`);
  },

  /** POST /api/documents/import/ — uploads a .txt / .md / .docx file. */
  async importFile(file: File): Promise<DocumentDetail> {
    const form = new FormData();
    form.append('file', file);

    // No Content-Type is set on purpose — the browser adds the multipart
    // boundary itself.
    const { data } = await http.post<DocumentDetail>('/documents/import/', form);
    return data;
  },

  /**
   * GET /api/documents/<id>/download/ — the document as a file.
   *
   * The default is the stored Word file ("docx"); "original" returns the
   * upload of an imported document. The browser saves it with the name the
   * API suggests.
   */
  async download(id: string, format: DownloadFormat = 'docx'): Promise<void> {
    let response;

    try {
      response = await http.get(`/documents/${id}/download/`, {
        params: { format },
        responseType: 'blob',
      });
    } catch (error) {
      // An error response is a blob as well — read the real message out of it.
      if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
        const text = await error.response.data.text();
        let detail =
          error.response.status === 404
            ? 'That file is not available for this document.'
            : 'Could not download the document.';
        try {
          const payload = JSON.parse(text) as { detail?: string };
          if (payload?.detail) detail = payload.detail;
        } catch {
          /* keep the default message */
        }
        throw new Error(detail);
      }
      throw error;
    }

    const filename =
      filenameFromDisposition(response.headers['content-disposition'] as string | undefined) ??
      `document.${format}`;

    const blob = new Blob([response.data], {
      type: (response.headers['content-type'] as string | undefined) ?? 'text/plain',
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();

    // Revoking the URL right after the click can cancel the download in some
    // browsers — give it a moment.
    window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
  },
};

/* ------------------------------------------------------------------ */
/* Sharing                                                             */
/* ------------------------------------------------------------------ */

export const sharingApi = {
  /** GET /api/documents/<id>/permissions/ */
  async listPermissions(id: string, signal?: AbortSignal): Promise<Share[]> {
    const { data } = await http.get<Share[]>(`/documents/${id}/permissions/`, { signal });
    return Array.isArray(data) ? data : [];
  },

  /** POST /api/documents/<id>/share/ */
  async share(id: string, email: string, role: ShareRole): Promise<Share> {
    const { data } = await http.post<Share>(`/documents/${id}/share/`, {
      email: email.trim(),
      role,
    });
    return data;
  },

  /** PATCH /api/documents/<id>/permissions/<permissionId>/ */
  async updatePermission(
    id: string,
    permissionId: number,
    role: ShareRole,
  ): Promise<Share> {
    const { data } = await http.patch<Share>(
      `/documents/${id}/permissions/${permissionId}/`,
      { role },
    );
    return data;
  },

  /** DELETE /api/documents/<id>/share/<userId>/ */
  async revoke(id: string, userId: number): Promise<void> {
    await http.delete(`/documents/${id}/share/${userId}/`);
  },
};

/* ------------------------------------------------------------------ */
/* Convenience helpers                                                 */
/* ------------------------------------------------------------------ */

/** An empty TipTap document — the starting point of every new document. */
export function createEmptyDocument(): TiptapDocument {
  return {
    type: 'doc',
    content: [{ type: 'paragraph' }],
  };
}

export default http;
