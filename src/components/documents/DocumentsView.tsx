import { useState, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useToast } from '../../context/ToastContext';
import { useDocuments } from '../../hooks/useDocuments';
import { getErrorMessage } from '../../services/api';
import { documentService } from '../../services/documentService';
import type { DocumentScope, DocumentSummary } from '../../types';
import { Icon, type IconName } from '../ui/Icon';
import { CreateDocumentModal } from './CreateDocumentModal';
import { DocumentDialogs } from './DocumentDialogs';
import { DocumentList } from './DocumentList';
import { EmptyState } from './EmptyState';
import { ImportDocumentModal } from './ImportDocumentModal';
import { SkeletonSheet } from './LoadingBlock';
import { PageHead } from './PageHead';

interface DocumentsViewProps {
  scope: DocumentScope;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  emptyIcon?: IconName;
  emptyTitle: string;
  emptyText: string;
  /** Extra buttons rendered next to "New document". */
  extraActions?: ReactNode;
}

/**
 * Reusable listing page used by "My Documents", "Shared with Me" and "Recent".
 * It owns the create / rename / share / delete interactions.
 */
export function DocumentsView({
  scope,
  eyebrow,
  title,
  subtitle,
  emptyIcon = 'file',
  emptyTitle,
  emptyText,
  extraActions,
}: DocumentsViewProps) {
  const navigate = useNavigate();
  const { push } = useToast();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';

  const { documents, isLoading, error, reload } = useDocuments(scope, query);

  const [isImporterOpen, setImporterOpen] = useState(false);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<DocumentSummary | null>(null);
  const [shareTarget, setShareTarget] = useState<DocumentSummary | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DocumentSummary | null>(null);

  async function handleDownload(doc: DocumentSummary) {
    try {
      // The stored Word file.
      await documentService.download(doc.id);
      push(`Downloading “${doc.title}”`, 'success');
    } catch (downloadError) {
      push(getErrorMessage(downloadError, 'Could not download the document.'), 'error');
    }
  }

  return (
    <>
      <PageHead
        eyebrow={eyebrow}
        title={title}
        text={subtitle}
        actions={
          <>
            {extraActions}
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setImporterOpen(true)}
            >
              <Icon name="upload" size={15} />
              Import
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => setCreateOpen(true)}
            >
              <Icon name="plus" size={15} strokeWidth={2.2} />
              New document
            </button>
          </>
        }
      />

      {error ? (
        <div className="auth__error" style={{ marginBottom: '1rem' }}>
          <Icon name="alert" size={16} />
          <span>{error}</span>
        </div>
      ) : null}

      {isLoading ? (
        <SkeletonSheet />
      ) : documents.length === 0 ? (
        <EmptyState
          icon={emptyIcon}
          title={query ? 'No documents match your search' : emptyTitle}
          text={query ? `Nothing found for “${query}”.` : emptyText}
        >
          {!query ? (
            <>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setImporterOpen(true)}
              >
                <Icon name="upload" size={15} />
                Import file
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => setCreateOpen(true)}
              >
                <Icon name="plus" size={15} strokeWidth={2.2} />
                New document
              </button>
            </>
          ) : null}
        </EmptyState>
      ) : (
        <DocumentList
          documents={documents}
          onOpen={(doc) => navigate(`/documents/${doc.id}`)}
          onDownload={(doc) => void handleDownload(doc)}
          onRename={setRenameTarget}
          onShare={setShareTarget}
          onDelete={setDeleteTarget}
        />
      )}

      <CreateDocumentModal
        isOpen={isCreateOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(doc) => navigate(`/documents/${doc.id}`)}
      />

      <ImportDocumentModal
        isOpen={isImporterOpen}
        onClose={() => setImporterOpen(false)}
        onImported={(doc) => {
          void reload();
          navigate(`/documents/${doc.id}`);
        }}
      />

      <DocumentDialogs
        renameTarget={renameTarget}
        shareTarget={shareTarget}
        deleteTarget={deleteTarget}
        onCloseRename={() => setRenameTarget(null)}
        onCloseShare={() => setShareTarget(null)}
        onCloseDelete={() => setDeleteTarget(null)}
        onChanged={reload}
      />
    </>
  );
}

export default DocumentsView;
