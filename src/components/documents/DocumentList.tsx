import type { DocumentSummary } from '../../types';
import { DocumentCard } from './DocumentCard';

interface DocumentListProps {
  documents: DocumentSummary[];
  onOpen: (doc: DocumentSummary) => void;
  onDownload: (doc: DocumentSummary) => void;
  onRename?: (doc: DocumentSummary) => void;
  onShare?: (doc: DocumentSummary) => void;
  onDelete?: (doc: DocumentSummary) => void;
}

/** The document list — a single sheet of rows. */
export function DocumentList({
  documents,
  onOpen,
  onDownload,
  onRename,
  onShare,
  onDelete,
}: DocumentListProps) {
  return (
    <div className="doc-sheet">
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          doc={doc}
          onOpen={onOpen}
          onDownload={onDownload}
          onRename={onRename}
          onShare={onShare}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default DocumentList;
