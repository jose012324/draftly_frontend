import type { DocumentSummary } from '../../types';
import { formatRelativeTime } from '../../utils/format';
import { Avatar } from '../ui/Avatar';
import { DocumentMenu } from './DocumentMenu';

interface DocumentCardProps {
  /** Named `doc` so it can never be confused with the DOM `document`. */
  doc: DocumentSummary;
  onOpen: (document: DocumentSummary) => void;
  onDownload: (document: DocumentSummary) => void;
  onRename?: (document: DocumentSummary) => void;
  onShare?: (document: DocumentSummary) => void;
  onDelete?: (document: DocumentSummary) => void;
}

const ROLE_LABEL: Record<DocumentSummary['role'], string> = {
  owner: 'Owner',
  editor: 'Editor',
  viewer: 'Viewer',
};

/** One line in the document list. */
export function DocumentCard({
  doc,
  onOpen,
  onDownload,
  onRename,
  onShare,
  onDelete,
}: DocumentCardProps) {
  const isShared = doc.role !== 'owner';
  const isOwner = doc.role === 'owner';

  return (
    <div className="doc-row">
      <div className="doc-row__main">
        <button
          type="button"
          className="doc-row__title"
          onClick={() => onOpen(doc)}
          title={doc.title}
        >
          {doc.title}
        </button>
        <p className="doc-row__snippet">{doc.snippet}</p>
      </div>

      <span className="doc-row__owner">
        <Avatar user={doc.owner} size="sm" tone={isShared ? 'emerald' : 'slate'} />
        <span className="doc-row__owner-name">{doc.owner.full_name}</span>
      </span>

      <span className="doc-row__meta">{formatRelativeTime(doc.updated_at)}</span>

      <span>
        <span className={`badge badge--${doc.role}`}>{ROLE_LABEL[doc.role]}</span>
      </span>

      <span className="doc-row__actions">
        <DocumentMenu
          doc={doc}
          onOpen={onOpen}
          onDownload={onDownload}
          onRename={isOwner ? onRename : undefined}
          onShare={isOwner ? onShare : undefined}
          onDelete={isOwner ? onDelete : undefined}
        />
      </span>
    </div>
  );
}

export default DocumentCard;
