import { createPortal } from 'react-dom';

import { useAnchoredMenu } from '../../hooks/useAnchoredMenu';
import type { DownloadFormat } from '../../services/api';
import { Icon } from '../ui/Icon';

interface ExportMenuProps {
  onExport: (format: DownloadFormat) => void;
  /** True when the document was imported — the original upload can be fetched. */
  hasOriginal?: boolean;
}

const MENU_WIDTH = 190;

export function ExportMenu({ onExport, hasOriginal = false }: ExportMenuProps) {
  const { triggerRef, panelRef, isOpen, position, toggle } = useAnchoredMenu(MENU_WIDTH);

  const formats: { format: DownloadFormat; label: string; hint: string }[] = [
    { format: 'docx', label: 'Word document', hint: '.docx' },
    { format: 'md', label: 'Markdown', hint: '.md' },
    { format: 'html', label: 'HTML page', hint: '.html' },
    { format: 'txt', label: 'Plain text', hint: '.txt' },
    { format: 'json', label: 'Draftly JSON', hint: '.json' },
  ];

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        className="btn btn--secondary btn--sm"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Export document"
      >
        <Icon name="download" size={14} />
        Export
      </button>

      {isOpen && position
        ? createPortal(
            <div
              ref={panelRef}
              className="doc-menu__panel doc-menu__panel--fixed"
              style={{ top: position.top, left: position.left, width: MENU_WIDTH }}
              role="menu"
            >
              {formats.map((entry) => (
                <button
                  key={entry.format}
                  type="button"
                  className="doc-menu__item doc-menu__item--split"
                  role="menuitem"
                  onClick={() => {
                    toggle();
                    onExport(entry.format);
                  }}
                >
                  {entry.label}
                  <span className="doc-menu__hint">{entry.hint}</span>
                </button>
              ))}

              {hasOriginal ? (
                <>
                  <div className="doc-menu__separator" />
                  <button
                    type="button"
                    className="doc-menu__item doc-menu__item--split"
                    role="menuitem"
                    onClick={() => {
                      toggle();
                      onExport('original');
                    }}
                  >
                    Original upload
                    <span className="doc-menu__hint">file</span>
                  </button>
                </>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

export default ExportMenu;
