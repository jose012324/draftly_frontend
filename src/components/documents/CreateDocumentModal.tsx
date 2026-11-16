import { useEffect, useState, type FormEvent } from 'react';

import { useToast } from '../../context/ToastContext';
import { documentService } from '../../services/documentService';
import { getErrorMessage } from '../../services/api';
import type { DocumentDetail } from '../../types';
import { Modal } from '../ui/Modal';

interface CreateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (doc: DocumentDetail) => void;
}

/** Asks for a title and creates the document. */
export function CreateDocumentModal({ isOpen, onClose, onCreated }: CreateDocumentModalProps) {
  const { push } = useToast();
  const [title, setTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setError(null);
    }
  }, [isOpen]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const nextTitle = title.trim();
    if (!nextTitle) {
      setError('Please enter a title.');
      return;
    }

    setIsCreating(true);
    setError(null);
    try {
      const document = await documentService.create({ title: nextTitle });
      push('New document created', 'success');
      onClose();
      onCreated(document);
    } catch (createError) {
      setError(getErrorMessage(createError, 'Could not create the document.'));
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      title="New document"
      subtitle="Give your document a title — you can always change it later."
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="create-document-form" className="btn btn--primary" disabled={isCreating}>
            {isCreating ? <span className="spinner spinner--light" /> : null}
            Create document
          </button>
        </>
      }
    >
      <form id="create-document-form" className="field" onSubmit={handleSubmit}>
        <label className="field__label" htmlFor="create-document-title">
          Title
        </label>
        <div className="share-form__email">
          <input
            id="create-document-title"
            className="input"
            value={title}
            maxLength={255}
            autoFocus
            placeholder="Untitled document"
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
        {error ? <span className="field__error">{error}</span> : null}
        <p className="field__hint">The document opens in the editor right away.</p>
      </form>
    </Modal>
  );
}

export default CreateDocumentModal;
