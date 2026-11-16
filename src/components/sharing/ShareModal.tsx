import { useCallback, useEffect, useState, type FormEvent } from 'react';

import { useToast } from '../../context/ToastContext';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { getErrorMessage } from '../../services/api';
import { sharingService } from '../../services/sharingService';
import type { DocumentDetail, DocumentSummary, Share, ShareRole, User } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Icon } from '../ui/Icon';
import { Modal } from '../ui/Modal';
import { CollaboratorList } from './CollaboratorList';
import { PermissionSelector } from './PermissionSelector';

interface ShareModalProps {
  isOpen: boolean;
  /** The document that is shared — everything else is derived from it. */
  document: DocumentSummary | DocumentDetail | null;
  onClose: () => void;
  onChanged?: () => void;
}

/** The sharing dialog: invite people and manage the collaborators. */
export function ShareModal({
  isOpen,
  document,
  onClose,
  onChanged,
}: ShareModalProps) {
  const { push } = useToast();

  const documentId = document?.id ?? '';
  const documentTitle = document?.title ?? '';
  /** Only the owner may add or remove people. */
  const canManage = document?.role === 'owner';

  const [shares, setShares] = useState<Share[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<ShareRole>('viewer');
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedEmail = useDebouncedValue(email, 300);

  const loadShares = useCallback(async () => {
    if (!documentId) return;
    setIsLoading(true);
    try {
      setShares(await sharingService.listPermissions(documentId));
    } catch (loadError) {
      push(getErrorMessage(loadError, 'Could not load the sharing list.'), 'error');
    } finally {
      setIsLoading(false);
    }
  }, [documentId, push]);

  useEffect(() => {
    if (!isOpen) return;
    setEmail('');
    setRole('viewer');
    setError(null);
    void loadShares();
  }, [isOpen, loadShares]);

  /* User lookup used by the e-mail field. */
  useEffect(() => {
    if (!isOpen || !canManage) return;
    const term = debouncedEmail.trim();
    if (term.length < 2) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    sharingService
      .searchUsers(term, controller.signal)
      .then((users) => setSuggestions(users.slice(0, 5)))
      .catch(() => setSuggestions([]));

    return () => controller.abort();
  }, [debouncedEmail, isOpen, canManage]);

  async function handleShare(event: FormEvent) {
    event.preventDefault();
    const targetEmail = email.trim();
    if (!targetEmail) {
      setError('Enter the e-mail address of the person you want to invite.');
      return;
    }

    setIsSharing(true);
    setError(null);
    try {
      await sharingService.share(documentId, targetEmail, role);
      setEmail('');
      setSuggestions([]);
      await loadShares();
      onChanged?.();
      push(`Shared "${documentTitle}" with ${targetEmail}`, 'success');
    } catch (shareError) {
      setError(getErrorMessage(shareError, 'Could not share the document.'));
    } finally {
      setIsSharing(false);
    }
  }

  async function handleRoleChange(share: Share, nextRole: ShareRole) {
    try {
      await sharingService.updatePermission(documentId, share.id, nextRole);
      setShares((current) =>
        current.map((item) => (item.id === share.id ? { ...item, role: nextRole } : item)),
      );
      onChanged?.();
      push(
        `${share.user.full_name} can now ${nextRole === 'editor' ? 'edit' : 'view'} the document`,
        'success',
      );
    } catch (roleError) {
      push(getErrorMessage(roleError, 'Could not update the permission.'), 'error');
    }
  }

  async function handleRevoke(share: Share) {
    try {
      await sharingService.revoke(documentId, share.user.id);
      setShares((current) => current.filter((item) => item.id !== share.id));
      onChanged?.();
      push(`Removed ${share.user.full_name}`, 'info');
    } catch (revokeError) {
      push(getErrorMessage(revokeError, 'Could not remove the access.'), 'error');
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      title={`Share "${documentTitle}"`}
      subtitle="Invite people to read or edit this document."
      onClose={onClose}
      wide
      footer={
        <button type="button" className="btn btn--secondary" onClick={onClose}>
          Done
        </button>
      }
    >
      {canManage ? (
        <form className="share-form" onSubmit={handleShare}>
          <div className="share-form__email">
            <label className="sr-only" htmlFor="share-email">
              E-mail address
            </label>
            <input
              id="share-email"
              className="input"
              type="email"
              placeholder="name@company.com"
              value={email}
              autoComplete="off"
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <PermissionSelector
            value={role}
            label="Permission for the new collaborator"
            className="share-form__role"
            onChange={setRole}
          />

          <button type="submit" className="btn btn--primary" disabled={isSharing}>
            {isSharing ? <span className="spinner spinner--light" /> : null}
            Share
          </button>
        </form>
      ) : (
        <div className="permission-note">
          <Icon name="info" size={16} />
          <span>Only the owner of this document can add or remove people.</span>
        </div>
      )}

      {error ? (
        <p className="field__error" style={{ marginTop: '0.6rem' }}>
          {error}
        </p>
      ) : null}

      {suggestions.length > 0 && canManage ? (
        <div className="user-suggestions">
          {suggestions.map((user) => (
            <button
              key={user.id}
              type="button"
              className="user-suggestion"
              onClick={() => {
                setEmail(user.email);
                setSuggestions([]);
              }}
            >
              <Avatar user={user} size="sm" />
              <span className="share-item__meta">
                <span className="share-item__name">{user.full_name}</span>
                <span className="share-item__email">{user.email}</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}

      <CollaboratorList
        shares={shares}
        isLoading={isLoading}
        canManage={canManage}
        onRoleChange={handleRoleChange}
        onRevoke={handleRevoke}
      />
    </Modal>
  );
}

export default ShareModal;
