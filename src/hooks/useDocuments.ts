import { useCallback, useEffect, useState } from 'react';

import { getErrorMessage } from '../services/api';
import { documentService } from '../services/documentService';
import type { DocumentScope, DocumentSummary } from '../types';

interface UseDocumentsResult {
  documents: DocumentSummary[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

/**
 * Loads a list of documents for a given scope ("mine", "shared", "recent",
 * "trash" …) and keeps it in sync with the current search query.
 */
export function useDocuments(scope: DocumentScope, query = ''): UseDocumentsResult {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);
      try {
        const results = await documentService.list({ scope, search: query, signal });
        setDocuments(results);
      } catch (loadError) {
        if (signal?.aborted) return;
        setError(getErrorMessage(loadError, 'Could not load the documents.'));
      } finally {
        if (!signal?.aborted) setIsLoading(false);
      }
    },
    [scope, query],
  );

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const reload = useCallback(() => load(), [load]);

  return { documents, isLoading, error, reload };
}

export default useDocuments;
