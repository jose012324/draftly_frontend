import { Link } from 'react-router-dom';

import { Icon } from '../components/ui/Icon';

export function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '2rem',
      }}
    >
      <div className="empty-state" style={{ maxWidth: 420 }}>
        <span className="empty-state__icon">
          <Icon name="alert" size={24} />
        </span>
        <span className="empty-state__title">Page not found</span>
        <span className="empty-state__text">
          The page you are looking for does not exist or has been moved.
        </span>
        <div className="empty-state__actions">
          <Link to="/app" className="btn btn--primary">
            Back to the workspace
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
