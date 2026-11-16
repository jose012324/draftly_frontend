import { useCallback, useEffect, useRef, useState } from 'react';

import { DocumentSocket } from '../services/realtime';
import { tokenStorage } from '../services/api';
import type { RealtimePeer, RealtimeUpdate, SocketStatus, TiptapDocument } from '../types';

/** A selection of somebody else, in ProseMirror positions. */
export interface RemoteSelectionMessage {
  userId: number;
  name: string;
  anchor: number;
  head: number;
}

interface UseDocumentRealtimeOptions {
  documentId: string;
  enabled?: boolean;
  /** Called when a document was saved by somebody else. */
  onUpdate: (update: RealtimeUpdate) => void;
  /** Called for every live content message (the stream of the editors). */
  onRemoteContent?: (content: TiptapDocument, userId: number, name: string) => void;
  /** Called when somebody else selects or moves the caret. */
  onRemoteSelection?: (selection: RemoteSelectionMessage) => void;
}

interface UseDocumentRealtimeResult {
  status: SocketStatus;
  /** Everybody (including me) who currently has the document open. */
  peers: RealtimePeer[];
  /** Broadcast the current content to the other editors. */
  sendContent: (content: TiptapDocument) => void;
  /** Broadcast the current selection to the other editors. */
  sendSelection: (anchor: number, head: number) => void;
}

/**
 * Subscribes to the live updates of a document.
 *
 * The socket is opened with the API token; when the connection drops it
 * reconnects with a growing delay. If the socket cannot be established at all
 * the editor falls back to polling the version endpoint.
 */
export function useDocumentRealtime({
  documentId,
  enabled = true,
  onUpdate,
  onRemoteContent,
  onRemoteSelection,
}: UseDocumentRealtimeOptions): UseDocumentRealtimeResult {
  const [status, setStatus] = useState<SocketStatus>('idle');
  const [peers, setPeers] = useState<RealtimePeer[]>([]);

  const socketRef = useRef<DocumentSocket | null>(null);

  const onUpdateRef = useRef(onUpdate);
  const onRemoteContentRef = useRef(onRemoteContent);
  const onRemoteSelectionRef = useRef(onRemoteSelection);

  onUpdateRef.current = onUpdate;
  onRemoteContentRef.current = onRemoteContent;
  onRemoteSelectionRef.current = onRemoteSelection;

  useEffect(() => {
    if (!enabled) {
      setStatus('idle');
      return undefined;
    }

    const token = tokenStorage.get();
    if (!token) {
      setStatus('idle');
      return undefined;
    }

    const socket = new DocumentSocket({
      documentId,
      token,
      onStatusChange: setStatus,
      onMessage: (message) => {
        if (message.type === 'hello') {
          return;
        }

        if (message.type === 'presence') {
          setPeers(message.users ?? []);
          return;
        }

        if (message.type === 'update') {
          onUpdateRef.current({
            document_id: message.document_id ?? documentId,
            content: message.content ?? null,
            title: message.title ?? '',
            version: message.version ?? 0,
            author_id: message.author_id ?? 0,
            author_name: message.author_name ?? '',
          });
          return;
        }

        if (message.type === 'collab') {
          if (message.kind === 'content' && message.content) {
            onRemoteContentRef.current?.(
              message.content,
              message.user_id ?? 0,
              message.user_name ?? 'Somebody',
            );
          }

          if (message.kind === 'selection') {
            onRemoteSelectionRef.current?.({
              userId: message.user_id ?? 0,
              name: message.user_name ?? 'Somebody',
              anchor: message.anchor ?? 0,
              head: message.head ?? 0,
            });
          }
        }
      },
    });

    socketRef.current = socket;
    socket.connect();

    return () => {
      socket.close();
      socketRef.current = null;
      setPeers([]);
    };
  }, [documentId, enabled]);

  const sendContent = useCallback((content: TiptapDocument) => {
    socketRef.current?.sendThrottled({ type: 'collab', kind: 'content', content });
  }, []);

  const sendSelection = useCallback((anchor: number, head: number) => {
    socketRef.current?.sendThrottled({ type: 'collab', kind: 'selection', anchor, head });
  }, []);

  return { status, peers, sendContent, sendSelection };
}

export default useDocumentRealtime;
