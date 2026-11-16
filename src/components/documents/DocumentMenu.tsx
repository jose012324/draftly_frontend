import { createPortal } from 'react-dom';

import { useAnchoredMenu } from '../../hooks/useAnchoredMenu';
import type { DocumentSummary } from '../../types';
import { Icon } from '../ui/Icon';

interface DocumentMenuProps {
  /** The document — named `doc`, because `document` would shadow the DOM. */
  doc: DocumentSummary;
  onOpen: (document: DocumentSummary) => void;
  onDownload: (document: DocumentSummary) => void;
  /** Only the owner may rename, share or delete a document. */
  onRename?: (document: DocumentSummary) => void;
  onShare?: (document: DocumentSummary) => void;
  onDelete?: (document: DocumentSummary) => void;
}

const MENU_WIDTH = 190;

/**
 * The context menu of a document row.
 *
 * Downloading is possible for everybody who can read the document; renaming,
 * sharing and deleting belong to the owner alone.
 */
export function DocumentMenu({
  doc,
  onOpen,
  onDownload,
  onRename,
  onShare,
  onDelete,
}: DocumentMenuProps) {
  const { triggerRef, panelRef, isOpen, position, toggle } = useAnchoredMenu(MENU_WIDTH);

  function run(action: (document: DocumentSummary) => void) {
    toggle();
    // `doc` — not `document`: the global `document` is the DOM document.
    action(doc);
  }

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        className="doc-menu__trigger"
        onClick={(event) => {
          event.stopPropagation();
          toggle();
        }}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`Actions for ${doc.title}`}
      >
        <Icon name="more" size={16} />
      </button>

      {isOpen && position
        ? createPortal(
            <div
              ref={panelRef}
              className="doc-menu__panel doc-menu__panel--fixed"
              style={{ top: position.top, left: position.left, width: MENU_WIDTH }}
              role="menu"
            >
              <button
                type="button"
                className="doc-menu__item"
                role="menuitem"
                onClick={() => run(onOpen)}
              >
                <Icon name="file" size={15} />
                Open
              </button>

              <button
                type="button"
                className="doc-menu__item"
                role="menuitem"
                onClick={() => run(onDownload)}
              >
                <Icon name="download" size={15} />
                Download
              </button>

              {onRename ? (
                <button
                  type="button"
                  className="doc-menu__item"
                  role="menuitem"
                  onClick={() => run(onRename)}
                >
                  <Icon name="edit" size={15} />
                  Rename
                </button>
              ) : null}

              {onShare ? (
                <button
                  type="button"
                  className="doc-menu__item"
                  role="menuitem"
                  onClick={() => run(onShare)}
                >
                  <Icon name="share" size={15} />
                  Share
                </button>
              ) : null}

              {onDelete ? (
                <button
                  type="button"
                  className="doc-menu__item doc-menu__item--danger"
                  role="menuitem"
                  onClick={() => run(onDelete)}
                >
                  <Icon name="trash" size={15} />
                  Move to trash
                </button>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

export default DocumentMenu;
