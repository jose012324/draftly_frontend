/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Public URL of the Draftly API — the WebSocket URL is derived from it. */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
