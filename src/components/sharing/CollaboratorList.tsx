import type { Share, ShareRole } from '../../types';
import { formatRelativeTime } from '../../utils/format';
import { Avatar } from '../ui/Avatar';
import { Icon } from '../ui/Icon';
import { PermissionSelector } from './PermissionSelector';

interface CollaboratorListProps {
  shares: Share[];
  isLoading: boolean;
  /** The owner may change roles and revoke access. */
  canManage: boolean;
  onRoleChange: (share: Share, role: ShareRole) => void;
  onRevoke: (share: Share) => void;
}

/** Everyone that has access to the document. */
export function CollaboratorList({
  shares,
  isLoading,
  canManage,
  onRoleChange,
  onRevoke,
}: CollaboratorListProps) {
  return (
    <div className="share-list">
      <p className="share-list__title">People with access</p>

      {isLoading ? (
        <div className="loading-block" style={{ padding: '1.25rem 0' }}>
          <span className="spinner" />
        </div>
      ) : shares.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.86rem' }}>
          Nobody else has access to this document yet.
        </p>
      ) : (
        shares.map((share) => (
          <div key={share.id} className="share-item">
            <Avatar user={share.user} size="md" tone="emerald" />
            <div className="share-item__meta">
              <div className="share-item__name">{share.user.full_name}</div>
              <div className="share-item__email">
                {share.user.email} · added {formatRelativeTime(share.created_at)}
              </div>
            </div>

            <div className="share-item__controls">
              {canManage ? (
                <>
                  <PermissionSelector
                    value={share.role}
                    label={`Permission for ${share.user.full_name}`}
                    onChange={(role) => onRoleChange(share, role)}
                  />
                  <button
                    type="button"
                    className="icon-btn icon-btn--danger"
                    title="Remove access"
                    aria-label={`Remove ${share.user.full_name}`}
                    onClick={() => onRevoke(share)}
                  >
                    <Icon name="trash" size={15} />
                  </button>
                </>
              ) : (
                <span className={`badge badge--${share.role}`}>
                  {share.role === 'editor' ? 'Can edit' : 'Can view'}
                </span>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default CollaboratorList;
