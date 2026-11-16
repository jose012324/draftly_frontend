/**
 * Document service — listing, CRUD and file importing.
 */

import { documentsApi, http, type DownloadFormat } from './api';
import type {
  CreateDocumentPayload,
  DocumentDetail,
  DocumentListParams,
  DocumentSummary,
  UpdateDocumentPayload,
} from '../types';

/** The answer of `GET /api/documents/<id>/version/`. */
export interface DocumentVersion {
  id: string;
  version: number;
  updated_at: string;
}

export const documentService = {
  list(params: DocumentListParams = {}): Promise<DocumentSummary[]> {
    return documentsApi.list(params);
  },
  create(payload: CreateDocumentPayload = {}): Promise<DocumentDetail> {
    return documentsApi.create(payload);
  },

  get(id: string, signal?: AbortSignal): Promise<DocumentDetail> {
    return documentsApi.get(id, signal);
  },

  update(id: string, payload: UpdateDocumentPayload): Promise<DocumentDetail> {
    return documentsApi.update(id, payload);
  },

  /** Move a document to the trash. */
  remove(id: string): Promise<void> {
    return documentsApi.remove(id);
  },

  restore(id: string): Promise<DocumentDetail> {
    return documentsApi.restore(id);
  },

  /** Delete a document permanently. */
  purge(id: string): Promise<void> {
    return documentsApi.purge(id);
  },

  /** Import a .txt, .md or .docx file as an editable document. */
  importFile(file: File): Promise<DocumentDetail> {
    return documentsApi.importFile(file);
  },

  /** The current version of a document — cheap, used to detect outside changes. */
  async getVersion(documentId: string): Promise<DocumentVersion> {
    const { data } = await http.get<DocumentVersion>(`/documents/${documentId}/version/`);
    return data;
  },

  /** Download the document as a file (docx, original, md, html, txt, json). */
  download(documentId: string, format: DownloadFormat = 'docx'): Promise<void> {
    return documentsApi.download(documentId, format);
  },
};

export default documentService;
