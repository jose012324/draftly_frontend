import type { User } from '../../types';

interface AvatarProps {
  user: Pick<User, 'full_name' | 'initials'> | null;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'brand' | 'emerald' | 'amber' | 'slate';
  title?: string;
}

const TONE_CLASS: Record<NonNullable<AvatarProps['tone']>, string> = {
  brand: '',
  emerald: 'avatar--emerald',
  amber: 'avatar--amber',
  slate: 'avatar--slate',
};

export function Avatar({ user, size = 'md', tone = 'brand', title }: AvatarProps) {
  const sizeClass = size === 'sm' ? 'avatar--sm' : size === 'lg' ? 'avatar--lg' : '';
  const label = user?.full_name || 'Guest';

  return (
    <span
      className={`avatar ${sizeClass} ${TONE_CLASS[tone]}`.trim()}
      title={title ?? label}
      aria-hidden={title ? undefined : 'true'}
    >
      {user?.initials || '?'}
    </span>
  );
}

export default Avatar;
