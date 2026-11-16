import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { DocumentEditor } from '../components/editor/DocumentEditor';
import { LoadingBlock } from '../components/documents/LoadingBlock';
import { Icon } from '../components/ui/Icon';
import { getErrorMessage } from '../services/api';
import { documentService } from '../services/documentService';
import type { DocumentDetail } from '../types';

export function EditorPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();

  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);

    documentService
      .get(id)
      .then((loaded) => {
        if (!cancelled) setDoc(loaded);
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadError(getErrorMessage(error, 'This document could not be opened.'));
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="editor-page" style={{ display: 'grid', placeItems: 'center' }}>
        <LoadingBlock label="Opening document…" />
      </div>
    );
  }

  if (loadError || !doc) {
    return (
      <div className="editor-page" style={{ display: 'grid', placeItems: 'center', padding: '2rem' }}>
        <div className="empty-state" style={{ maxWidth: 460 }}>
          <span className="empty-state__icon">
            <Icon name="alert" size={24} />
          </span>
          <span className="empty-state__title">Document unavailable</span>
          <span className="empty-state__text">{loadError}</span>
          <div className="empty-state__actions">
            <button type="button" className="btn btn--primary" onClick={() => navigate('/app')}>
              Back to the workspace
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DocumentEditor
      key={doc.id}
      document={doc}
      onDocumentChange={setDoc}
      onBack={() => navigate('/app')}
    />
  );
}

export default EditorPage;
