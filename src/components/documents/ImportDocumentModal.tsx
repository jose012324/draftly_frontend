import { useRef, useState, type DragEvent } from 'react';

import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../services/api';
import { documentService } from '../../services/documentService';
import type { DocumentDetail } from '../../types';
import { formatFileSize, humanizeFileName } from '../../utils/format';
import { Icon } from '../ui/Icon';
import { Modal } from '../ui/Modal';

interface ImportDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: (doc: DocumentDetail) => void;
}

const ALLOWED_EXTENSIONS = ['txt', 'md', 'docx'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Drag & drop import of .txt, .md and .docx files. The file is converted
 * server side into an editable document.
 */
export function ImportDocumentModal({ isOpen, onClose, onImported }: ImportDocumentModalProps) {
  const { push } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setFile(null);
    setError(null);
    setIsUploading(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function selectFile(nextFile: File | null | undefined) {
    if (!nextFile) return;

    const extension = nextFile.name.split('.').pop()?.toLowerCase() ?? '';
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setError(`"${nextFile.name}" is not supported. Use a .txt, .md or .docx file.`);
      return;
    }
    if (nextFile.size > MAX_SIZE_BYTES) {
      setError('That file is larger than 5 MB. Please upload a smaller file.');
      return;
    }

    setError(null);
    setFile(nextFile);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    selectFile(event.dataTransfer.files?.[0]);
  }

  async function handleImport() {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const document = await documentService.importFile(file);
      push(`Imported "${document.title}"`, 'success');
      reset();
      onClose();
      onImported(document);
    } catch (importError) {
      setError(getErrorMessage(importError, 'Could not import the file.'));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      title="Import a document"
      subtitle="Upload a file and Draftly turns it into an editable document."
      onClose={handleClose}
      footer={
        <>
          <button type="button" className="btn btn--secondary" onClick={handleClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => void handleImport()}
            disabled={!file || isUploading}
          >
            {isUploading ? <span className="spinner spinner--light" /> : null}
            {isUploading ? 'Importing…' : 'Import file'}
          </button>
        </>
      }
    >
      <div
        className={`dropzone ${isDragging ? 'is-dragging' : ''}`.trim()}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click();
        }}
      >
        <span className="dropzone__icon">
          <Icon name="upload" size={22} />
        </span>
        <div className="dropzone__title">Drop a file here or click to browse</div>
        <div className="dropzone__hint">
          Maximum size 5 MB — the content is converted into an editable document.
        </div>
        <div className="format-chips">
          {ALLOWED_EXTENSIONS.map((extension) => (
            <span key={extension} className="format-chip">
              .{extension.toUpperCase()}
            </span>
          ))}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".txt,.md,.docx"
          hidden
          onChange={(event) => selectFile(event.target.files?.[0])}
        />
      </div>

      {file ? (
        <div className="file-preview" style={{ marginTop: '1rem' }}>
          <span className="dropzone__icon" style={{ margin: 0, width: 38, height: 38 }}>
            <Icon name="file" size={18} />
          </span>
          <span className="share-item__meta">
            <span className="file-preview__name">{file.name}</span>
            <span className="file-preview__size">
              {formatFileSize(file.size)} · will be titled “{humanizeFileName(file.name)}”
            </span>
          </span>
          <button
            type="button"
            className="icon-btn"
            aria-label="Remove file"
            onClick={() => setFile(null)}
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      ) : null}

      {error ? (
        <p className="field__error" style={{ marginTop: '0.75rem' }}>
          {error}
        </p>
      ) : null}
    </Modal>
  );
}

export default ImportDocumentModal;
