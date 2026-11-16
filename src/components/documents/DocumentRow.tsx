import type { ReactNode } from 'react';

import type { DocumentSummary } from '../../types';
import { formatRelativeTime } from '../../utils/format';
import { Avatar } from '../ui/Avatar';
import { Icon } from '../ui/Icon';

interface DocumentRowProps {
  /** Named `doc` so it can never be confused with the DOM `document`. */
  doc: DocumentSummary;
  onOpen?: (document: DocumentSummary) => void;
  actions?: ReactNode;
}

/** Compact row used by the trash view. */
export function DocumentRow({ doc, onOpen, actions }: DocumentRowProps) {
  return (
    <div className="doc-row doc-row--compact">
      <div className="doc-row__main">
        <button
          type="button"
          className="doc-row__title"
          onClick={() => onOpen?.(doc)}
          title={doc.title}
        >
          {doc.title}
        </button>
        <p className="doc-row__snippet">
          Deleted {formatRelativeTime(doc.updated_at)} · owned by {doc.owner.full_name}
        </p>
      </div>

      <span className="doc-row__actions">
        <Avatar user={doc.owner} size="sm" tone="slate" />
        {actions}
      </span>
    </div>
  );
}

export default DocumentRow;
