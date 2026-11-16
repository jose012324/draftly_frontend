import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extensions';

import { useAutosave } from '../../hooks/useAutosave';
import { useDocumentRealtime, type RemoteSelectionMessage } from '../../hooks/useDocumentRealtime';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../services/api';
import { documentService } from '../../services/documentService';
import type { DocumentDetail, RealtimeUpdate, TiptapDocument } from '../../types';
import { countWords } from '../../utils/document';
import { formatDateTime } from '../../utils/format';
import { ShareModal } from '../sharing/ShareModal';
import { Icon } from '../ui/Icon';
import { ConflictBanner } from './ConflictBanner';
import { EditorHeader } from './EditorHeader';
import { EditorToolbar } from './EditorToolbar';
import { ExportMenu } from './ExportMenu';
import { PresenceBar } from './PresenceBar';
import {
  REMOTE_SELECTIONS_KEY,
  RemoteSelections,
  colorForUser,
  type RemoteSelection,
} from './RemoteSelections';

interface DocumentEditorProps {
  document: DocumentDetail;
  /** Keeps the page in sync with the saved document (e.g. the timestamp). */
  onDocumentChange: (document: DocumentDetail) => void;
  onBack: () => void;
}

interface DocumentDraft {
  title: string;
  content: TiptapDocument | null;
}

/** How often the version endpoint is checked when the live socket is down. */
const POLL_INTERVAL = 10_000;

/**
 * The editor: TipTap canvas, formatting toolbar, editable title, the debounced
 * autosave and the live collaboration with the other editors.
 */
export function DocumentEditor({ document: doc, onDocumentChange, onBack }: DocumentEditorProps) {
  const { user } = useAuth();
  const { push } = useToast();

  const [draft, setDraft] = useState<DocumentDraft>({
    title: doc.title,
    content: doc.content,
  });
  const [conflict, setConflict] = useState<RealtimeUpdate | null>(null);
  const [remoteSelections, setRemoteSelections] = useState<RemoteSelection[]>([]);
  const [isShareOpen, setShareOpen] = useState(false);

  const isReadOnly = doc.role === 'viewer';
  const versionRef = useRef(doc.version ?? 1);

  const draftRef = useRef(draft);
  draftRef.current = draft;

  /* The broadcasting functions live in the realtime hook, which is created
     after the editor — a ref bridges the two. */
  const sendContentRef = useRef<(content: TiptapDocument) => void>(() => {});
  const sendSelectionRef = useRef<(anchor: number, head: number) => void>(() => {});

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' },
        },
      }),
      Placeholder.configure({ placeholder: 'Start writing your document…' }),
      RemoteSelections,
    ],
    content: doc.content,
    editable: !isReadOnly,
    editorProps: {
      attributes: { class: 'tiptap', spellcheck: 'true' },
    },
    onUpdate: ({ editor: currentEditor }) => {
      const json = currentEditor.getJSON();
      setDraft((current) => ({ ...current, content: json }));
      // Send the change to the other editors right away.
      sendContentRef.current(json);
    },
    onSelectionUpdate: ({ editor: currentEditor }) => {
      const { anchor, head } = currentEditor.state.selection;
      sendSelectionRef.current(anchor, head);
    },
  });

  /* Viewers must not be able to type into the editor. */
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!isReadOnly);
  }, [editor, isReadOnly]);

  const autosave = useAutosave<DocumentDraft>({
    value: draft,
    save: async (next) => {
      const updated = await documentService.update(doc.id, {
        title: next.title.trim() || 'Untitled document',
        content: next.content ?? undefined,
      });
      versionRef.current = updated.version ?? versionRef.current;
      onDocumentChange(updated);
    },
    enabled: !isReadOnly,
    delay: 800,
    label: 'document',
  });

  const { status, error, savedAt, flush, sync } = autosave;
  const statusRef = useRef(status);
  statusRef.current = status;

  /* ---------------------------------------------------------------- */
  /* Applying remote changes                                           */
  /* ---------------------------------------------------------------- */

  /** Put a document that came from somebody else into the editor. */
  const applyRemoteContent = useCallback(
    (content: TiptapDocument, title?: string) => {
      if (!editor) return;

      const next: DocumentDraft = {
        title: title ?? draftRef.current.title,
        content,
      };

      // Keep the local caret where it was.
      const { from, to } = editor.state.selection;
      const size = editor.state.doc.content.size;

      editor.commands.setContent(content, { emitUpdate: false });
      editor.commands.setTextSelection({
        from: Math.min(from, size),
        to: Math.min(to, size),
      });

      setDraft(next);
      sync(next);
    },
    [editor, sync],
  );

  /** A change somebody else made on the stream (live, not saved yet). */
  const handleRemoteContent = useCallback(
    (content: TiptapDocument, userId: number, name: string) => {
      if (userId === user?.id) return;

      // Local edits that are not saved yet → let the user decide.
      if (statusRef.current !== 'saved') {
        setConflict({
          document_id: doc.id,
          content,
          title: draftRef.current.title,
          version: 0,
          author_id: userId,
          author_name: name,
        });
        return;
      }

      applyRemoteContent(content);
    },
    [user?.id, doc.id, applyRemoteContent],
  );

  /** A document somebody else saved (the server broadcast). */
  const applyRemoteChange = useCallback(
    (update: RealtimeUpdate) => {
      if (update.author_id && update.author_id === user?.id) return;

      versionRef.current = update.version || versionRef.current;

      if (statusRef.current !== 'saved') {
        setConflict(update);
        return;
      }

      if (update.content) {
        applyRemoteContent(update.content, update.title);
      } else if (update.title) {
        const next = { ...draftRef.current, title: update.title };
        setDraft(next);
        sync(next);
      }
    },
    [user?.id, applyRemoteContent, sync],
  );

  const handleRemoteSelection = useCallback((selection: RemoteSelectionMessage) => {
    const color = colorForUser(selection.userId);

    setRemoteSelections((current) => [
      ...current.filter((item) => item.userId !== selection.userId),
      {
        userId: selection.userId,
        name: selection.name,
        color: color.hex,
        soft: color.soft,
        anchor: selection.anchor,
        head: selection.head,
      },
    ]);
  }, []);

  const { status: socketStatus, peers, sendContent, sendSelection } = useDocumentRealtime({
    documentId: doc.id,
    onUpdate: applyRemoteChange,
    onRemoteContent: handleRemoteContent,
    onRemoteSelection: handleRemoteSelection,
  });

  sendContentRef.current = sendContent;
  sendSelectionRef.current = sendSelection;

  /* Push the remote selections into the editor as decorations. ---------- */
  useEffect(() => {
    if (!editor) return;
    editor.view.dispatch(
      editor.state.tr.setMeta(REMOTE_SELECTIONS_KEY, { selections: remoteSelections }),
    );
  }, [editor, remoteSelections]);

  /* Forget the selections of people that left. -------------------------- */
  useEffect(() => {
    const present = new Set(peers.map((peer) => peer.id));
    setRemoteSelections((current) => current.filter((item) => present.has(item.userId)));
  }, [peers]);

  /* Fallback for when the live socket is not available: ask for the version
     from time to time and notice changes that were made elsewhere. */
  useEffect(() => {
    if (socketStatus === 'open') return undefined;

    let cancelled = false;
    const timer = window.setInterval(() => {
      if (cancelled || document.hidden) return;

      void documentService
        .getVersion(doc.id)
        .then((info) => {
          if (cancelled || info.version <= versionRef.current) return;

          return documentService.get(doc.id).then((fresh) => {
            if (cancelled) return;
            applyRemoteChange({
              document_id: fresh.id,
              content: fresh.content,
              title: fresh.title,
              version: fresh.version,
              // The version endpoint does not know the author — 0 means
              // "somebody else", which is exactly what we know here.
              author_id: 0,
              author_name: 'Somebody',
            });
          });
        })
        .catch(() => undefined);
    }, POLL_INTERVAL);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [socketStatus, doc.id, applyRemoteChange]);

  /* ---------------------------------------------------------------- */
  /* Conflict resolution                                               */
  /* ---------------------------------------------------------------- */

  function handleReloadTheirs() {
    if (!conflict) return;

    const next: DocumentDraft = {
      title: conflict.title || draftRef.current.title,
      content: conflict.content ?? draftRef.current.content,
    };

    if (conflict.content) {
      editor?.commands.setContent(conflict.content, { emitUpdate: false });
    }

    setDraft(next);
    sync(next);
    setConflict(null);

    // Make sure the server ends up with the same version.
    window.setTimeout(() => flush(), 0);
    push('Loaded the newer version', 'info');
  }

  function handleKeepMine() {
    setConflict(null);
    flush();
    push('Your version was saved', 'success');
  }

  /* Ctrl/Cmd + S saves immediately. */
  useEffect(() => {
    if (isReadOnly) return undefined;

    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        flush();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flush, isReadOnly]);

  const wordCount = useMemo(() => countWords(draft.content), [draft.content]);

  async function handleShareChanged() {
    try {
      onDocumentChange(await documentService.get(doc.id));
    } catch (refreshError) {
      push(getErrorMessage(refreshError, 'Could not refresh the document.'), 'error');
    }
  }

  return (
    <div className="editor-page">
      <EditorHeader
        title={draft.title}
        role={doc.role}
        owner={doc.owner}
        isReadOnly={isReadOnly}
        status={status}
        error={error}
        savedAt={savedAt}
        presence={<PresenceBar peers={peers} currentUserId={user?.id} status={socketStatus} />}
        exportMenu={
          <ExportMenu
            hasOriginal={Boolean(doc.source_filename)}
            onExport={(format) => {
              void documentService.download(doc.id, format).catch((downloadError) => {
                push(getErrorMessage(downloadError, 'Could not export the document.'), 'error');
              });
            }}
          />
        }
        banner={
          <>
            {isReadOnly ? (
              <div className="readonly-banner">
                <Icon name="eye" size={16} />
                <span>
                  You have view-only access to this document. Ask the owner for edit permission
                  to change it.
                </span>
              </div>
            ) : null}

            {conflict ? (
              <ConflictBanner
                authorName={conflict.author_name || 'Somebody'}
                onReload={handleReloadTheirs}
                onKeepMine={handleKeepMine}
              />
            ) : null}
          </>
        }
        onTitleChange={(title) => setDraft((current) => ({ ...current, title }))}
        onBack={onBack}
        onShare={() => setShareOpen(true)}
        onRetry={flush}
      />

      <EditorToolbar editor={editor} isReadOnly={isReadOnly} wordCount={wordCount} />

      <div className="editor-canvas">
        <article className={`paper ${isReadOnly ? 'paper--readonly' : ''}`.trim()}>
          <div className="paper__meta">
            <span>
              Owner: <strong>{doc.owner.full_name}</strong>
            </span>
            <span className="dot" />
            <span>Created {formatDateTime(doc.created_at)}</span>
            {doc.source_filename ? (
              <>
                <span className="dot" />
                <span>Imported from {doc.source_filename}</span>
              </>
            ) : null}
          </div>

          <EditorContent editor={editor} />
        </article>
      </div>

      <ShareModal
        isOpen={isShareOpen}
        document={doc}
        onClose={() => setShareOpen(false)}
        onChanged={() => void handleShareChanged()}
      />
    </div>
  );
}

export default DocumentEditor;
