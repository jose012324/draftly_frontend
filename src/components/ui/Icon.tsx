import type { ReactElement, SVGProps } from 'react';

/**
 * A tiny inline SVG icon set (feather-style, 24x24 grid).
 * Keeping the icons in the project avoids an extra UI dependency.
 */

export type IconName =
  | 'home'
  | 'file'
  | 'files'
  | 'users'
  | 'clock'
  | 'trash'
  | 'plus'
  | 'upload'
  | 'search'
  | 'back'
  | 'share'
  | 'more'
  | 'edit'
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'bulletList'
  | 'orderedList'
  | 'quote'
  | 'code'
  | 'link'
  | 'undo'
  | 'redo'
  | 'check'
  | 'alert'
  | 'info'
  | 'close'
  | 'restore'
  | 'menu'
  | 'sparkles'
  | 'eye'
  | 'pen'
  | 'download'
  | 'lock'
  | 'mail'
  | 'logout'
  | 'minus'
  | 'document'
  | 'arrowRight'
  | 'chevronDown';

const PATHS: Record<IconName, ReactElement> = {
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.8V20a1 1 0 0 0 1 1h3.5v-5.5h5V21H18a1 1 0 0 0 1-1V9.8" />
    </>
  ),
  file: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h4" />
    </>
  ),
  files: (
    <>
      <rect x="3" y="6" width="12" height="14" rx="2" />
      <path d="M8 3h9a2 2 0 0 1 2 2v11" />
    </>
  ),
  users: (
    <>
      <path d="M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20" />
      <circle cx="9" cy="7" r="3.2" />
      <path d="M17 11.2a3.2 3.2 0 1 0-1.2-6.1" />
      <path d="M22 20v-1.5a4 4 0 0 0-3-3.8" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16" />
      <path d="M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7" />
      <path d="M6.5 7l.8 12.1a1.9 1.9 0 0 0 1.9 1.8h5.6a1.9 1.9 0 0 0 1.9-1.8L17.5 7" />
      <path d="M10.5 11v6M13.5 11v6" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  upload: (
    <>
      <path d="M12 16V4" />
      <path d="M7.5 8.5 12 4l4.5 4.5" />
      <path d="M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-3.6-3.6" />
    </>
  ),
  back: (
    <>
      <path d="M19 12H5" />
      <path d="M11 6l-6 6 6 6" />
    </>
  ),
  share: (
    <>
      <circle cx="18" cy="5.5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="18.5" r="2.5" />
      <path d="M8.2 10.8 15.8 6.8M8.2 13.2l7.6 4" />
    </>
  ),
  more: (
    <>
      <circle cx="12" cy="5" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="12" cy="19" r="1.4" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3z" />
      <path d="M13.5 7.5l3 3" />
    </>
  ),
  bold: (
    <>
      <path d="M7 4h6a4 4 0 0 1 0 8H7z" />
      <path d="M7 12h7a4 4 0 0 1 0 8H7z" />
    </>
  ),
  italic: <path d="M15 4h-5M14 20H9M14.5 4 9.5 20" />,
  underline: (
    <>
      <path d="M7 4v6a5 5 0 0 0 10 0V4" />
      <path d="M5 20h14" />
    </>
  ),
  strike: (
    <>
      <path d="M5 12h14" />
      <path d="M16 7.5C15.3 5.6 13.7 4.8 11.8 4.8 9.4 4.8 7.6 6.2 7.6 8.2c0 1.2.7 2.1 2 2.8" />
      <path d="M8 16c.7 2 2.4 3.2 4.4 3.2 2.5 0 4.3-1.4 4.3-3.5 0-1-.4-1.9-1.2-2.5" />
    </>
  ),
  h1: (
    <>
      <path d="M4 6v12M11 6v12M4 12h7" />
      <path d="M15.5 10.5 18 9v9" />
    </>
  ),
  h2: (
    <>
      <path d="M4 6v12M11 6v12M4 12h7" />
      <path d="M15 10.5a2.5 2.5 0 1 1 4.4 1.6L15 18h4.5" />
    </>
  ),
  h3: (
    <>
      <path d="M4 6v12M11 6v12M4 12h7" />
      <path d="M15 10.5a2.5 2.5 0 1 1 4 2 2.5 2.5 0 1 1-4 2" />
    </>
  ),
  bulletList: (
    <>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="4.5" cy="6" r="1.2" />
      <circle cx="4.5" cy="12" r="1.2" />
      <circle cx="4.5" cy="18" r="1.2" />
    </>
  ),
  orderedList: (
    <>
      <path d="M10 6h10M10 12h10M10 18h10" />
      <path d="M4 5.5h1.4V9M3.6 13c.2-.7 1-1.2 1.7-.8.8.5.5 1.6-.7 2.6L3.6 16H6" />
    </>
  ),
  quote: (
    <>
      <path d="M9 7H5.5A2.5 2.5 0 0 0 3 9.5v1A2.5 2.5 0 0 0 5.5 13H7v1a3 3 0 0 1-3 3" />
      <path d="M20 7h-3.5A2.5 2.5 0 0 0 14 9.5v1a2.5 2.5 0 0 0 2.5 2.5H18v1a3 3 0 0 1-3 3" />
    </>
  ),
  code: (
    <>
      <path d="M9 8l-4 4 4 4" />
      <path d="M15 8l4 4-4 4" />
    </>
  ),
  link: (
    <>
      <path d="M10.5 13.5a4 4 0 0 0 5.7 0l2.3-2.3a4 4 0 0 0-5.7-5.7l-1.3 1.3" />
      <path d="M13.5 10.5a4 4 0 0 0-5.7 0l-2.3 2.3a4 4 0 1 0 5.7 5.7l1.3-1.3" />
    </>
  ),
  undo: (
    <>
      <path d="M4 9h9a5 5 0 0 1 0 10H8" />
      <path d="M4 9l4-4M4 9l4 4" />
    </>
  ),
  redo: (
    <>
      <path d="M20 9h-9a5 5 0 0 0 0 10h5" />
      <path d="M20 9l-4-4M20 9l-4 4" />
    </>
  ),
  check: <path d="M5 12.5 10 17.5 19 7" />,
  alert: (
    <>
      <path d="M12 4.5 21 19.5H3z" />
      <path d="M12 10v4M12 17h.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6 6 18" />,
  restore: (
    <>
      <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" />
      <path d="M3.5 4.5V10H9" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  sparkles: (
    <>
      <path d="M12 3.5 13.6 8 18 9.6 13.6 11.2 12 15.7 10.4 11.2 6 9.6 10.4 8z" />
      <path d="M18 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  pen: (
    <>
      <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3z" />
      <path d="M14.5 7.5 17.5 10.5" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v12" />
      <path d="M7.5 11.5 12 16l4.5-4.5" />
      <path d="M4 18.5V19a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 19v-.5" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10" width="15" height="10" rx="2" />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="M3.5 7 12 13l8.5-6" />
    </>
  ),
  logout: (
    <>
      <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
      <path d="M10 8l-4 4 4 4" />
      <path d="M6 12h9" />
    </>
  ),
  minus: <path d="M6 12h12" />,
  document: (
    <>
      <path d="M6 3.5h7.5L18 8v12.5H6z" />
      <path d="M13.5 3.5V8H18" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </>
  ),
  chevronDown: <path d="M6 9.5l6 6 6-6" />,
};

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
  strokeWidth?: number;
}

export function Icon({ name, size = 18, strokeWidth = 1.8, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}

export default Icon;
