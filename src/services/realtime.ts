/**
 * Realtime client — the WebSocket that carries live document updates.
 *
 * The socket only *receives* changes; every write still goes through the REST
 * API, which keeps the permission checks in one place. The socket tells the
 * editor that somebody else changed the document.
 */

import type { RealtimePeer, SocketStatus, TiptapDocument } from '../types';

export interface RealtimeMessage {
  type: 'hello' | 'update' | 'presence' | 'pong' | 'collab';
  document_id?: string;
  version?: number;
  role?: string;
  user_id?: number;
  user_name?: string;
  content?: TiptapDocument | null;
  title?: string;
  author_id?: number;
  author_name?: string;
  users?: RealtimePeer[];
  /** Only for the "collab" messages. */
  kind?: 'content' | 'selection';
  anchor?: number;
  head?: number;
}

export interface DocumentSocketOptions {
  documentId: string;
  token: string;
  onMessage: (message: RealtimeMessage) => void;
  onStatusChange?: (status: SocketStatus) => void;
}

const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 15000];

/**
 * After this many failed attempts the client stops reconnecting — the editor
 * then falls back to polling the version endpoint. This keeps the console
 * quiet when the backend does not serve WebSockets at all.
 */
const MAX_ATTEMPTS = 6;

/**
 * Builds the WebSocket URL of a document.
 *
 * The URL is derived from the API URL: the protocol becomes ws/wss and the
 * `/api` suffix becomes `/ws` — `https://api.example.com/api` therefore
 * becomes `wss://api.example.com/ws`. There is no separate setting for it.
 */
export function buildSocketUrl(documentId: string, token: string): string {
  const api = import.meta.env.VITE_API_BASE_URL || '/api';
  const url = new URL(api, window.location.origin);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';

  const base = url.pathname.replace(/\/api\/?$/, '').replace(/\/$/, '');
  url.pathname = `${base}/ws/documents/${documentId}/`;
  url.search = `?token=${encodeURIComponent(token)}`;

  return url.toString();
}

/** A small WebSocket wrapper with an automatic reconnect. */
export class DocumentSocket {
  private socket: WebSocket | null = null;
  private reconnectTimer: number | null = null;
  private throttleTimer: number | null = null;
  private throttledPayload: Record<string, unknown> | null = null;
  private attempts = 0;
  private closedByUser = false;

  constructor(private readonly options: DocumentSocketOptions) {}

  connect(): void {
    if (!this.options.token) return;

    this.closedByUser = false;
    this.setStatus('connecting');

    try {
      this.socket = new WebSocket(buildSocketUrl(this.options.documentId, this.options.token));
    } catch {
      this.setStatus('closed');
      this.scheduleReconnect();
      return;
    }

    this.socket.onopen = () => {
      this.attempts = 0;
      this.setStatus('open');
    };

    this.socket.onmessage = (event) => {
      try {
        this.options.onMessage(JSON.parse(event.data) as RealtimeMessage);
      } catch {
        /* ignore malformed frames */
      }
    };

    this.socket.onerror = () => {
      this.setStatus('closed');
    };

    this.socket.onclose = () => {
      this.setStatus('closed');
      if (!this.closedByUser) this.scheduleReconnect();
    };
  }

  close(): void {
    this.closedByUser = true;
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.throttleTimer !== null) {
      window.clearTimeout(this.throttleTimer);
      this.throttleTimer = null;
    }
    this.socket?.close();
    this.socket = null;
  }

  /** Send a message (currently only used for the keep-alive ping). */
  send(message: Record<string, unknown>): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  /**
   * Send a message at most every `delay` milliseconds — the newest message
   * always wins. Used for the live content and the live selection, which
   * change on every keystroke.
   */
  sendThrottled(message: Record<string, unknown>, delay = 80): void {
    this.throttledPayload = message;

    if (this.throttleTimer !== null) return;

    this.throttleTimer = window.setTimeout(() => {
      this.throttleTimer = null;
      const payload = this.throttledPayload;
      this.throttledPayload = null;
      if (payload) this.send(payload);
    }, delay);
  }

  private scheduleReconnect(): void {
    if (this.closedByUser || this.reconnectTimer !== null) return;
    if (this.attempts >= MAX_ATTEMPTS) return;

    const delay = RECONNECT_DELAYS[Math.min(this.attempts, RECONNECT_DELAYS.length - 1)];
    this.attempts += 1;

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private setStatus(status: SocketStatus): void {
    this.options.onStatusChange?.(status);
  }
}

export default DocumentSocket;
