import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

/** A selection (or caret) of somebody else. */
export interface RemoteSelection {
  userId: number;
  name: string;
  /** The solid colour of the user. */
  color: string;
  /** The translucent version used for the highlight. */
  soft: string;
  anchor: number;
  head: number;
}

export interface UserColor {
  hex: string;
  soft: string;
}

/**
 * One colour per user — the first user gets orange, the second blue and so on.
 * The colour is used for the remote selection and for the avatar ring.
 */
const PALETTE: UserColor[] = [
  { hex: '#e8833a', soft: 'rgba(232, 131, 58, 0.22)' },
  { hex: '#3b82f6', soft: 'rgba(59, 130, 246, 0.22)' },
  { hex: '#8b5cf6', soft: 'rgba(139, 92, 246, 0.22)' },
  { hex: '#10b981', soft: 'rgba(16, 185, 129, 0.22)' },
  { hex: '#ec4899', soft: 'rgba(236, 72, 153, 0.22)' },
  { hex: '#eab308', soft: 'rgba(234, 179, 8, 0.22)' },
  { hex: '#06b6d4', soft: 'rgba(6, 182, 212, 0.22)' },
  { hex: '#ef4444', soft: 'rgba(239, 68, 68, 0.22)' },
];

export function colorForUser(userId: number): UserColor {
  const index = (userId - 1 + PALETTE.length) % PALETTE.length;
  return PALETTE[index];
}

export const REMOTE_SELECTIONS_KEY = new PluginKey<{ selections: RemoteSelection[] }>(
  'remoteSelections',
);

/**
 * Renders the selections of the other editors as coloured highlights.
 *
 * The positions are ProseMirror offsets — they only line up while both
 * editors work on the same document, which is exactly the case here.
 */
export const RemoteSelections = Extension.create({
  name: 'remoteSelections',

  addProseMirrorPlugins() {
    return [
      new Plugin<{ selections: RemoteSelection[] }>({
        key: REMOTE_SELECTIONS_KEY,

        state: {
          init: () => ({ selections: [] }),
          apply(transaction, value) {
            const meta = transaction.getMeta(REMOTE_SELECTIONS_KEY);
            return meta ? { selections: meta.selections } : value;
          },
        },

        props: {
          decorations(state) {
            const selections = REMOTE_SELECTIONS_KEY.getState(state)?.selections ?? [];
            const size = state.doc.content.size;
            const decorations = [];

            for (const selection of selections) {
              const from = Math.min(Math.max(0, Math.min(selection.anchor, selection.head)), size);
              const to = Math.min(Math.max(0, Math.max(selection.anchor, selection.head)), size);

              // A caret without a selection is not highlighted.
              if (to <= from) continue;

              decorations.push(
                Decoration.inline(from, to, {
                  class: 'collab-selection',
                  style: `--collab-color: ${selection.color}; --collab-soft: ${selection.soft};`,
                  'data-collab-name': selection.name,
                }),
              );
            }

            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});

export default RemoteSelections;
