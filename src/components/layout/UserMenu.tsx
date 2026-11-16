import { createPortal } from 'react-dom';

import { useToast } from '../../context/ToastContext';
import { useAnchoredMenu } from '../../hooks/useAnchoredMenu';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../ui/Avatar';
import { Icon } from '../ui/Icon';

const MENU_WIDTH = 232;

/**
 * The user profile menu of the top bar: name, e-mail and the sign out action.
 */
export function UserMenu() {
  const { user, logout } = useAuth();
  const { push } = useToast();
  const { triggerRef, panelRef, isOpen, position, toggle, close } = useAnchoredMenu(MENU_WIDTH);

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        className="user-menu__trigger"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="User menu"
      >
        <Avatar user={user} size="md" />
        <Icon name="more" size={16} />
      </button>

      {isOpen && position
        ? createPortal(
            <div
              ref={panelRef}
              className="user-menu__panel user-menu__panel--fixed"
              style={{ top: position.top, left: position.left, width: MENU_WIDTH }}
              role="menu"
            >
              <div className="user-menu__identity">
                <Avatar user={user} size="lg" />
                <div>
                  <div className="user-menu__name">{user?.full_name ?? 'Signed in'}</div>
                  <div className="user-menu__email">{user?.email ?? ''}</div>
                </div>
              </div>

              <button
                type="button"
                className="user-menu__item"
                role="menuitem"
                onClick={() => {
                  close();
                  void logout().then(() => {
                    push('You have been signed out', 'info');
                  });
                }}
              >
                <Icon name="logout" size={16} />
                Sign out
              </button>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

export default UserMenu;
