/**
 * Shared TypeScript types for the Draftly frontend.
 * They mirror the JSON payloads returned by the Django REST API.
 */

/* ------------------------------------------------------------------ */
/* TipTap document structure                                          */
/* ------------------------------------------------------------------ */

export interface TiptapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export interface TiptapNode {
  type?: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  marks?: TiptapMark[];
  text?: string;
}

/** The root TipTap document ("doc" node). */
export type TiptapDocument = TiptapNode;

/* ------------------------------------------------------------------ */
/* Users                                                               */
/* ------------------------------------------------------------------ */

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  initials: string;
}

/* ------------------------------------------------------------------ */
/* Documents                                                           */
/* ------------------------------------------------------------------ */

export type ShareRole = 'viewer' | 'editor';

/** The role the *current* user has on a document. */
export type DocumentRole = 'owner' | ShareRole;

export interface DocumentSummary {
  id: string;
  title: string;
  snippet: string;
  word_count: number;
  owner: User;
  role: DocumentRole;
  /** Incremented on every save — used to detect changes made by someone else. */
  version: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  source_filename: string;
}

export interface Share {
  id: number;
  user: User;
  role: ShareRole;
  created_at: string;
}

export interface DocumentDetail extends DocumentSummary {
  content: TiptapDocument;
  shares: Share[];
}

/** Query parameters accepted by `GET /api/documents/`. */
export type DocumentScope = 'all' | 'mine' | 'shared' | 'recent' | 'trash';

export interface DocumentListParams {
  scope?: DocumentScope;
  search?: string;
  signal?: AbortSignal;
}

export interface CreateDocumentPayload {
  title?: string;
  content?: TiptapDocument;
}

export interface UpdateDocumentPayload {
  title?: string;
  content?: TiptapDocument;
}

/* ------------------------------------------------------------------ */
/* Authentication                                                      */
/* ------------------------------------------------------------------ */

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiErrorPayload {
  detail?: string;
  [field: string]: string | string[] | undefined;
}

/* ------------------------------------------------------------------ */
/* Realtime (WebSocket)                                                */
/* ------------------------------------------------------------------ */

/** Somebody who currently has the document open. */
export interface RealtimePeer {
  id: number;
  name: string;
}

/** A change of a document that was made by somebody else. */
export interface RealtimeUpdate {
  document_id: string;
  content: TiptapDocument | null;
  title: string;
  version: number;
  author_id: number;
  author_name: string;
}

export type SocketStatus = 'idle' | 'connecting' | 'open' | 'closed';
