import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { DocumentRow } from '../components/documents/DocumentRow';
import { EmptyState } from '../components/documents/EmptyState';
import { LoadingBlock } from '../components/documents/LoadingBlock';
import { PageHead } from '../components/documents/PageHead';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Icon } from '../components/ui/Icon';
import { useToast } from '../context/ToastContext';
import { useDocuments } from '../hooks/useDocuments';
import { getErrorMessage } from '../services/api';
import { documentService } from '../services/documentService';
import type { DocumentSummary } from '../types';

export function TrashPage() {
  const { push } = useToast();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';

  const { documents, isLoading, error, reload } = useDocuments('trash', query);
  const [purgeTarget, setPurgeTarget] = useState<DocumentSummary | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleRestore(doc: DocumentSummary) {
    setBusyId(doc.id);
    try {
      await documentService.restore(doc.id);
      await reload();
      push(`“${doc.title}” restored`, 'success');
    } catch (restoreError) {
      push(getErrorMessage(restoreError, 'Could not restore the document.'), 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function handlePurge() {
    if (!purgeTarget) return;
    try {
      await documentService.purge(purgeTarget.id);
      setPurgeTarget(null);
      await reload();
      push('Document permanently deleted', 'info');
    } catch (purgeError) {
      push(getErrorMessage(purgeError, 'Could not delete the document.'), 'error');
    }
  }

  return (
    <>
      <PageHead
        eyebrow="Workspace"
        title="Trash"
        text="Deleted documents stay here until you restore them or remove them for good."
      />

      {error ? (
        <div className="auth__error" style={{ marginBottom: '1rem' }}>
          <Icon name="alert" size={16} />
          <span>{error}</span>
        </div>
      ) : null}

      {isLoading ? (
        <LoadingBlock label="Loading trash…" />
      ) : documents.length === 0 ? (
        <EmptyState
          icon="trash"
          title="The trash is empty"
          text="Documents you delete are moved here so you can restore them later."
        />
      ) : (
        <div className="doc-sheet">
          {documents.map((doc) => (
            <DocumentRow
              key={doc.id}
              doc={doc}
              actions={
                <>
                  <button
                    type="button"
                    className="btn btn--secondary btn--sm"
                    onClick={() => void handleRestore(doc)}
                    disabled={busyId === doc.id}
                  >
                    <Icon name="restore" size={13} />
                    Restore
                  </button>
                  <button
                    type="button"
                    className="btn btn--danger-soft btn--sm"
                    onClick={() => setPurgeTarget(doc)}
                    disabled={busyId === doc.id}
                  >
                    <Icon name="trash" size={13} />
                    Delete forever
                  </button>
                </>
              }
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(purgeTarget)}
        title="Delete permanently?"
        message={`“${purgeTarget?.title ?? ''}” will be removed for good. This cannot be undone.`}
        confirmLabel="Delete forever"
        destructive
        onCancel={() => setPurgeTarget(null)}
        onConfirm={handlePurge}
      />
    </>
  );
}

export default TrashPage;
