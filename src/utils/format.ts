/**
 * Small formatting helpers shared across the UI.
 */

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "Just now", "12m ago", "3h ago", "Yesterday", "4 Mar", "4 Mar 2024" */
export function formatRelativeTime(value: string | Date | null | undefined): string {
  if (!value) return '—';

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  const seconds = Math.round((Date.now() - date.getTime()) / 1000);

  if (seconds < 45) return 'Just now';
  if (seconds < HOUR) return `${Math.floor(seconds / MINUTE)}m ago`;
  if (seconds < DAY) return `${Math.floor(seconds / HOUR)}h ago`;
  if (seconds < 2 * DAY) return 'Yesterday';
  if (seconds < 7 * DAY) return `${Math.floor(seconds / DAY)}d ago`;

  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

/** "4 Mar 2024, 14:05" */
export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Turns "Alice Anderson" into "AA" (falls back to a single letter). */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** "notes" -> "Notes", "my-file" -> "My File" */
export function humanizeFileName(fileName: string): string {
  const base = fileName.replace(/\.[^/.]+$/, '');
  const words = base.replace(/[-_]+/g, ' ').trim();
  if (!words) return 'Untitled document';
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** 1536 -> "1.5 KB" */
export function formatFileSize(bytes: number): string {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

/** "1234" -> "1,234" */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}

/** Greeting used by the dashboard hero: "Good morning" / "Good afternoon" ... */
export function greetingForNow(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
