import type { SaveStatus } from '../../hooks/useAutosave';
import { formatRelativeTime } from '../../utils/format';
import { Icon } from '../ui/Icon';

interface SaveIndicatorProps {
  status: SaveStatus;
  error?: string | null;
  savedAt?: Date | null;
  /** Sends the pending changes again. */
  onRetry: () => void;
}

const STATUS_LABEL: Record<SaveStatus, string> = {
  saved: 'Saved',
  saving: 'Saving…',
  dirty: 'Unsaved changes',
  error: 'Save failed',
};

/** The save status of the editor — including the retry action. */
export function SaveIndicator({ status, error, savedAt, onRetry }: SaveIndicatorProps) {
  return (
    <span className="save-status-group">
      <span className={`save-status save-status--${status}`} title={error ?? undefined}>
        <span className="save-status__dot" />
        {STATUS_LABEL[status]}
      </span>

      {status === 'saved' && savedAt ? (
        <span className="save-status__time">{formatRelativeTime(savedAt.toISOString())}</span>
      ) : null}

      {status === 'error' ? (
        <button type="button" className="btn btn--sm btn--secondary" onClick={onRetry}>
          <Icon name="restore" size={13} />
          Retry
        </button>
      ) : null}
    </span>
  );
}

export default SaveIndicator;
