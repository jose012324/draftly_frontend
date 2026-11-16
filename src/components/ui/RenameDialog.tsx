import { useEffect, useState, type FormEvent } from 'react';

import { Modal } from './Modal';

interface RenameDialogProps {
  isOpen: boolean;
  initialValue: string;
  onClose: () => void;
  onSubmit: (value: string) => Promise<void> | void;
}

export function RenameDialog({ isOpen, initialValue, onClose, onSubmit }: RenameDialogProps) {
  const [value, setValue] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
      setError(null);
    }
  }, [isOpen, initialValue]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextTitle = value.trim();
    if (!nextTitle) {
      setError('Please enter a title.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await onSubmit(nextTitle);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Could not rename the document.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      title="Rename document"
      subtitle="Give the document a clear, recognisable name."
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="rename-form" className="btn btn--primary" disabled={isSaving}>
            {isSaving ? <span className="spinner spinner--light" /> : null}
            Save
          </button>
        </>
      }
    >
      <form id="rename-form" className="field" onSubmit={handleSubmit}>
        <label className="field__label" htmlFor="rename-input">
          Document title
        </label>
        <input
          id="rename-input"
          className="input"
          value={value}
          maxLength={255}
          autoFocus
          onChange={(event) => setValue(event.target.value)}
        />
        {error ? <span className="field__error">{error}</span> : null}
      </form>
    </Modal>
  );
}

export default RenameDialog;
