import type { ReactNode } from 'react';

import type { SaveStatus } from '../../hooks/useAutosave';
import type { DocumentRole, User } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Icon } from '../ui/Icon';
import { SaveIndicator } from './SaveIndicator';

interface EditorHeaderProps {
  title: string;
  role: DocumentRole;
  owner: User;
  isReadOnly: boolean;
  status: SaveStatus;
  error?: string | null;
  savedAt?: Date | null;
  /** Live presence indicator. */
  presence?: ReactNode;
  /** The export dropdown. */
  exportMenu?: ReactNode;
  /** A notice that is shown above the bar (read-only, conflicts …). */
  banner?: ReactNode;
  onTitleChange: (title: string) => void;
  onBack: () => void;
  onShare: () => void;
  onRetry: () => void;
}

const ROLE_LABEL: Record<DocumentRole, string> = {
  owner: 'Owner',
  editor: 'Can edit',
  viewer: 'Can view',
};

/** The top bar of the editor: back, title, save status, share and profile. */
export function EditorHeader({
  title,
  role,
  owner,
  isReadOnly,
  status,
  error,
  savedAt,
  presence,
  exportMenu,
  banner,
  onTitleChange,
  onBack,
  onShare,
  onRetry,
}: EditorHeaderProps) {
  return (
    <header className="editor-bar">
      <div className="editor-bar__inner">
        <button
          type="button"
          className="editor-bar__back"
          onClick={onBack}
          aria-label="Back to dashboard"
        >
          <Icon name="back" size={18} />
        </button>

        <div className="editor-bar__titles">
          <input
            className="editor-title"
            value={title}
            placeholder="Untitled document"
            maxLength={255}
            readOnly={isReadOnly}
            aria-label="Document title"
            onChange={(event) => onTitleChange(event.target.value)}
          />
          <div className="editor-bar__meta">
            <SaveIndicator status={status} error={error} savedAt={savedAt} onRetry={onRetry} />
            {presence}
          </div>
        </div>

        <div className="editor-bar__meta">
          <span className={`badge badge--${role}`}>{ROLE_LABEL[role]}</span>

          {exportMenu}

          <button type="button" className="btn btn--secondary" onClick={onShare}>
            <Icon name="share" size={16} />
            Share
          </button>

          <Avatar user={owner} size="md" title={`Owner: ${owner.full_name}`} />
        </div>
      </div>

      {banner ? <div className="editor-bar__banner">{banner}</div> : null}
    </header>
  );
}

export default EditorHeader;
