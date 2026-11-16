/**
 * Sharing service — permissions of a document.
 */

import { sharingApi, usersApi } from './api';
import type { Share, ShareRole, User } from '../types';

export const sharingService = {
  /** Everyone that has access to the document. */
  listPermissions(documentId: string, signal?: AbortSignal): Promise<Share[]> {
    return sharingApi.listPermissions(documentId, signal);
  },

  /** People that a document can be shared with. */
  searchUsers(search: string, signal?: AbortSignal): Promise<User[]> {
    return usersApi.list(search, signal);
  },

  /** Grant access to a user (owner only). */
  share(documentId: string, email: string, role: ShareRole): Promise<Share> {
    return sharingApi.share(documentId, email, role);
  },

  /** Change the role of an existing permission (owner only). */
  updatePermission(
    documentId: string,
    permissionId: number,
    role: ShareRole,
  ): Promise<Share> {
    return sharingApi.updatePermission(documentId, permissionId, role);
  },

  /** Revoke the access of a user (owner only). */
  revoke(documentId: string, userId: number): Promise<void> {
    return sharingApi.revoke(documentId, userId);
  },
};

export default sharingService;
