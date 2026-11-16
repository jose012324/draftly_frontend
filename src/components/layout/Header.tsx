import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { Icon } from '../ui/Icon';
import { UserMenu } from './UserMenu';

interface HeaderProps {
  onToggleSidebar: () => void;
  onCreateDocument: () => void;
}

/**
 * The sticky top bar: navigation toggle, global search and the primary action.
 *
 * The search term is mirrored into the URL (`?q=…`) so that every list page
 * reads the same query from a single source of truth.
 */
export function Header({ onToggleSidebar, onCreateDocument }: HeaderProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [term, setTerm] = useState(searchParams.get('q') ?? '');

  const debouncedTerm = useDebouncedValue(term, 350);
  const activeQuery = searchParams.get('q') ?? '';

  useEffect(() => {
    setTerm(searchParams.get('q') ?? '');
  }, [searchParams]);

  useEffect(() => {
    if (debouncedTerm === activeQuery) return;

    const next = new URLSearchParams(searchParams);
    if (debouncedTerm) {
      next.set('q', debouncedTerm);
    } else {
      next.delete('q');
    }
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTerm]);

  return (
    <header className="topbar">
      <button
        type="button"
        className="btn btn--secondary btn--icon topbar__toggle"
        onClick={onToggleSidebar}
        aria-label="Toggle navigation"
      >
        <Icon name="menu" size={18} />
      </button>

      <div className="topbar__search">
        <span className="topbar__search-icon">
          <Icon name="search" size={16} />
        </span>
        <input
          className="input"
          type="search"
          value={term}
          placeholder="Search documents…"
          aria-label="Search documents"
          onChange={(event) => setTerm(event.target.value)}
        />
      </div>

      <div className="topbar__actions">
        <button
          type="button"
          className="btn btn--primary"
          onClick={onCreateDocument}
        >
          <Icon name="plus" size={16} strokeWidth={2.2} />
          New document
        </button>
        <span className="topbar__divider" />
        <UserMenu />
      </div>
    </header>
  );
}

export default Header;
