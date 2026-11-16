import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

interface AnchoredMenu {
  /** The button that opens the menu. */
  triggerRef: RefObject<HTMLButtonElement | null>;
  /** The menu panel (rendered in a portal). */
  panelRef: RefObject<HTMLDivElement | null>;
  isOpen: boolean;
  /** Where the panel should be placed (viewport coordinates). */
  position: { top: number; left: number } | null;
  toggle: () => void;
  close: () => void;
}

/**
 * Anchors a menu to its trigger.
 *
 * The panel is positioned with `position: fixed` and rendered in a portal, so
 * no ancestor can clip it — a dropdown inside a sheet with `overflow: hidden`
 * would otherwise disappear behind the edge of that sheet.
 */
export function useAnchoredMenu(width = 180, gap = 6): AnchoredMenu {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  const place = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const left = Math.min(Math.max(8, rect.right - width), window.innerWidth - width - 8);

    // Flip upwards when there is not enough room below.
    const spaceBelow = window.innerHeight - rect.bottom;
    const estimatedHeight = panelRef.current?.offsetHeight ?? 180;
    const top =
      spaceBelow < estimatedHeight + 24 && rect.top > estimatedHeight
        ? rect.top - estimatedHeight - gap
        : rect.bottom + gap;

    setPosition({ top, left });
  }, [width, gap]);

  const open = useCallback(() => {
    place();
    setIsOpen(true);
  }, [place]);

  const close = useCallback(() => setIsOpen(false), []);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  useEffect(() => {
    if (!isOpen) return undefined;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') close();
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      close();
    }

    function handleReflow() {
      place();
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleReflow, true);
    window.addEventListener('resize', handleReflow);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleReflow, true);
      window.removeEventListener('resize', handleReflow);
    };
  }, [isOpen, close, place]);

  return { triggerRef, panelRef, isOpen, position, toggle, close };
}

export default useAnchoredMenu;
