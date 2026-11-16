import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../services/api';
import { documentService } from '../../services/documentService';
import type { DocumentSummary } from '../../types';
import { ShareModal } from '../sharing/ShareModal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { RenameDialog } from '../ui/RenameDialog';

interface DocumentDialogsProps {
  renameTarget: DocumentSummary | null;
  shareTarget: DocumentSummary | null;
  deleteTarget: DocumentSummary | null;
  onCloseRename: () => void;
  onCloseShare: () => void;
  onCloseDelete: () => void;
  /** Called after a successful change so the list can be refreshed. */
  onChanged: () => void | Promise<void>;
}

/**
 * The three document dialogs (rename, share, delete) in one place so every
 * listing page behaves the same way.
 */
export function DocumentDialogs({
  renameTarget,
  shareTarget,
  deleteTarget,
  onCloseRename,
  onCloseShare,
  onCloseDelete,
  onChanged,
}: DocumentDialogsProps) {
  const { push } = useToast();

  async function handleRename(title: string) {
    if (!renameTarget) return;
    try {
      await documentService.update(renameTarget.id, { title });
      onCloseRename();
      await onChanged();
      push('Document renamed', 'success');
    } catch (renameError) {
      throw new Error(getErrorMessage(renameError, 'Could not rename the document.'));
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await documentService.remove(deleteTarget.id);
      onCloseDelete();
      await onChanged();
      push('Document moved to trash', 'info');
    } catch (deleteError) {
      push(getErrorMessage(deleteError, 'Could not delete the document.'), 'error');
    }
  }

  return (
    <>
      <RenameDialog
        isOpen={Boolean(renameTarget)}
        initialValue={renameTarget?.title ?? ''}
        onClose={onCloseRename}
        onSubmit={handleRename}
      />

      <ShareModal
        isOpen={Boolean(shareTarget)}
        document={shareTarget}
        onClose={onCloseShare}
        onChanged={() => void onChanged()}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Move to trash?"
        message={`"${deleteTarget?.title ?? ''}" will be moved to the trash. You can restore it later.`}
        confirmLabel="Move to trash"
        destructive
        onCancel={onCloseDelete}
        onConfirm={handleDelete}
      />
    </>
  );
}

export default DocumentDialogs;
