import { NavLink } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { Brand } from '../ui/Brand';
import { Icon, type IconName } from '../ui/Icon';

interface SidebarProps {
  isOpen: boolean;
  counts: { mine: number; shared: number; recent: number; trash: number };
  onClose: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
  countKey: keyof SidebarProps['counts'];
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/app', label: 'Home', icon: 'home', countKey: 'recent', end: true },
  { to: '/app/my-documents', label: 'My Documents', icon: 'files', countKey: 'mine' },
  { to: '/app/shared-with-me', label: 'Shared with Me', icon: 'users', countKey: 'shared' },
  { to: '/app/recent', label: 'Recent', icon: 'clock', countKey: 'recent' },
  { to: '/app/trash', label: 'Trash', icon: 'trash', countKey: 'trash' },
];

export function Sidebar({ isOpen, counts, onClose }: SidebarProps) {
  const { user } = useAuth();

  return (
    <aside className={`sidebar ${isOpen ? 'is-open' : ''}`.trim()}>
      <NavLink to="/app" className="sidebar__brand" onClick={onClose}>
        <Brand showTagline />
      </NavLink>

      <nav className="sidebar__nav" aria-label="Main navigation">
        <span className="sidebar__section eyebrow">Workspace</span>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`.trim()}
          >
            <span className="nav-link__icon">
              <Icon name={item.icon} size={16} />
            </span>
            <span className="nav-link__label">{item.label}</span>
            {counts[item.countKey] > 0 ? (
              <span className="nav-link__count">{counts[item.countKey]}</span>
            ) : null}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="user-card">
          <span className="user-card__meta">
            <span className="user-card__name">{user?.full_name ?? 'Signed in'}</span>
            <span className="user-card__email">{user?.email ?? ''}</span>
          </span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
