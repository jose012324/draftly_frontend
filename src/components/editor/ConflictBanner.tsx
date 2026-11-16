import { Icon } from '../ui/Icon';

interface ConflictBannerProps {
  authorName: string;
  onReload: () => void;
  onKeepMine: () => void;
  isBusy?: boolean;
}

/**
 * Shown when somebody else changed the document while there were unsaved
 * local edits — the user decides which version wins.
 */
export function ConflictBanner({
  authorName,
  onReload,
  onKeepMine,
  isBusy = false,
}: ConflictBannerProps) {
  return (
    <div className="conflict" role="alert">
      <span className="conflict__icon">
        <Icon name="alert" size={15} />
      </span>

      <span className="conflict__text">
        <strong>{authorName}</strong> changed this document while you were editing.
      </span>

      <span className="conflict__actions">
        <button type="button" className="btn btn--sm btn--secondary" onClick={onReload} disabled={isBusy}>
          Reload theirs
        </button>
        <button type="button" className="btn btn--sm btn--primary" onClick={onKeepMine} disabled={isBusy}>
          Keep mine
        </button>
      </span>
    </div>
  );
}

export default ConflictBanner;
