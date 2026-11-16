import { useEffect, useState } from 'react';

import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  isBusy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  isBusy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [isBusyState, setIsBusyState] = useState(isBusy);
  useEffect(() => setIsBusyState(isBusy), [isBusy]);

  async function handleConfirm() {
    setIsBusyState(true);
    try {
      await onConfirm();
    } finally {
      setIsBusyState(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="btn btn--secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn ${destructive ? 'btn--danger' : 'btn--primary'}`}
            onClick={handleConfirm}
            disabled={isBusyState}
          >
            {isBusyState ? <span className="spinner spinner--light" /> : null}
            {confirmLabel}
          </button>
        </>
      }
    >
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem' }}>{message}</p>
    </Modal>
  );
}

export default ConfirmDialog;
