import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { CreateDocumentModal } from '../components/documents/CreateDocumentModal';
import { DocumentDialogs } from '../components/documents/DocumentDialogs';
import { DocumentList } from '../components/documents/DocumentList';
import { EmptyState } from '../components/documents/EmptyState';
import { ImportDocumentModal } from '../components/documents/ImportDocumentModal';
import { SkeletonSheet } from '../components/documents/LoadingBlock';
import { PageHead } from '../components/documents/PageHead';
import { Icon } from '../components/ui/Icon';
import { useAuth } from '../hooks/useAuth';
import { useDocuments } from '../hooks/useDocuments';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../services/api';
import { documentService } from '../services/documentService';
import type { DocumentSummary } from '../types';
import { formatNumber, greetingForNow } from '../utils/format';

export function DashboardPage() {
  const { user } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';

  const { documents, isLoading, error, reload } = useDocuments('all', query);

  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isImporterOpen, setImporterOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<DocumentSummary | null>(null);
  const [shareTarget, setShareTarget] = useState<DocumentSummary | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DocumentSummary | null>(null);

  const ownedDocuments = documents.filter((doc) => doc.role === 'owner');
  const sharedDocuments = documents.filter((doc) => doc.role !== 'owner');
  const totalWords = documents.reduce((total, doc) => total + (doc.word_count || 0), 0);
  const recentDocuments = documents.slice(0, 8);

  const firstName = user?.full_name?.split(' ')[0] ?? 'there';

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
        eyebrow="Workspace"
        title={`${greetingForNow()}, ${firstName}`}
        text="Everything you own and everything shared with you — in one place."
        actions={
          <>
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

      <section className="stats">
        <div className="stat">
          <span className="stat__value">{formatNumber(ownedDocuments.length)}</span>
          <span className="stat__label">Your documents</span>
        </div>
        <div className="stat">
          <span className="stat__value">{formatNumber(sharedDocuments.length)}</span>
          <span className="stat__label">Shared with you</span>
        </div>
        <div className="stat">
          <span className="stat__value">{formatNumber(totalWords)}</span>
          <span className="stat__label">Words written</span>
        </div>
      </section>

      {error ? (
        <div className="auth__error" style={{ marginBottom: '1rem' }}>
          <Icon name="alert" size={16} />
          <span>{error}</span>
        </div>
      ) : null}

      <section className="section">
        <div className="section__head">
          <h2 className="section__title">
            {query ? 'Search results' : 'Recent'}
            <span className="section__title-count">{documents.length}</span>
          </h2>
          {!query ? (
            <Link to="/app/my-documents" className="btn btn--ghost btn--sm">
              All documents
              <Icon name="arrowRight" size={14} />
            </Link>
          ) : null}
        </div>

        {isLoading ? (
          <SkeletonSheet count={4} />
        ) : recentDocuments.length === 0 ? (
          <EmptyState
            icon={query ? 'search' : 'file'}
            title={query ? 'No documents match your search' : 'Your workspace is empty'}
            text={
              query
                ? `Nothing found for “${query}”. Try a different keyword.`
                : 'Create your first document or import an existing .txt, .md or .docx file.'
            }
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
            documents={recentDocuments}
            onOpen={(doc) => navigate(`/documents/${doc.id}`)}
            onDownload={(doc) => void handleDownload(doc)}
            onRename={setRenameTarget}
            onShare={setShareTarget}
            onDelete={setDeleteTarget}
          />
        )}
      </section>

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

export default DashboardPage;
