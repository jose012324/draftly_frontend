import type { ReactNode } from 'react';

import { Icon, type IconName } from '../ui/Icon';

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  text?: string;
  children?: ReactNode;
}

export function EmptyState({ icon = 'file', title, text, children }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon">
        <Icon name={icon} size={24} />
      </span>
      <span className="empty-state__title">{title}</span>
      {text ? <span className="empty-state__text">{text}</span> : null}
      {children ? <div className="empty-state__actions">{children}</div> : null}
    </div>
  );
}

export default EmptyState;
