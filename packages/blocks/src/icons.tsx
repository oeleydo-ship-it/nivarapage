import type { ReactNode } from 'react'

/**
 * Inline stroke icons used by blocks and by the builder's icon picker.
 * Kept dependency-free so blocks stay renderable inside Server Components.
 */
const PATHS: Record<string, ReactNode> = {
  sparkles: (
    <>
      <path d="M12 3l1.8 4.6L18.5 9.4 13.8 11.2 12 15.8 10.2 11.2 5.5 9.4 10.2 7.6z" />
      <path d="M18 15l.9 2.2L21 18l-2.1.8L18 21l-.9-2.2L15 18l2.1-.8z" />
    </>
  ),
  zap: <path d="M13 2L4.5 13.5H11l-1 8.5L19.5 10H13z" />,
  shield: <path d="M12 3l7.5 3v5.5c0 4.6-3.1 8.2-7.5 9.5-4.4-1.3-7.5-4.9-7.5-9.5V6z" />,
  heart: <path d="M12 20.5S3.5 15.2 3.5 9.6A4.6 4.6 0 0112 7a4.6 4.6 0 018.5 2.6c0 5.6-8.5 10.9-8.5 10.9z" />,
  star: <path d="M12 3.5l2.7 5.6 6.1.8-4.4 4.3 1.1 6.1-5.5-3-5.5 3 1.1-6.1L3.2 9.9l6.1-.8z" />,
  check: <path d="M4.5 12.5l5 5 10-11" />,
  'check-circle': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.8 2.8L16.5 9.5" />
    </>
  ),
  rocket: (
    <>
      <path d="M13.5 3.5c3.5.4 6.6 3.5 7 7l-7.6 7.6-6.9-6.9z" />
      <path d="M6 15.5L3.5 21l5.5-2.5" />
      <circle cx="15" cy="9" r="1.6" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <path d="M8 16V11" />
      <path d="M13 16V7" />
      <path d="M18 16v-3" />
    </>
  ),
  'trending-up': (
    <>
      <path d="M3.5 16.5l6-6 4 4 7-7" />
      <path d="M15 7.5h5.5V13" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3.5 12h17" />
      <path d="M12 3a15 15 0 010 18 15 15 0 010-18z" />
    </>
  ),
  users: (
    <>
      <circle cx="9.5" cy="8.5" r="3.2" />
      <path d="M3.5 20a6 6 0 0112 0" />
      <path d="M16 6.2a3.2 3.2 0 010 6.1" />
      <path d="M17.4 20h3.1a5.4 5.4 0 00-3.3-5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3.2 2" />
    </>
  ),
  phone: <path d="M6 3.5h3l1.6 4-2 1.4a10.5 10.5 0 006.5 6.5l1.4-2 4 1.6v3a2 2 0 01-2.2 2A16.5 16.5 0 014 5.7 2 2 0 016 3.5z" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3.8 6.7L12 12.8l8.2-6.1" />
    </>
  ),
  'map-pin': (
    <>
      <path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  cart: (
    <>
      <path d="M3 4h2.2l2.4 11h9.9l2-7H6.3" />
      <circle cx="9.5" cy="19" r="1.4" />
      <circle cx="17" cy="19" r="1.4" />
    </>
  ),
  gift: (
    <>
      <rect x="3.5" y="9" width="17" height="11" rx="2" />
      <path d="M3.5 13.5h17M12 9v11" />
      <path d="M12 9S10.5 4.5 8 4.5A2.2 2.2 0 008 9zM12 9s1.5-4.5 4-4.5A2.2 2.2 0 0116 9z" />
    </>
  ),
  camera: (
    <>
      <path d="M3.5 8.5h3l1.6-2.5h6.8L16.5 8.5h4v10h-17z" />
      <circle cx="12" cy="13.5" r="3.2" />
    </>
  ),
  code: (
    <>
      <path d="M9 8l-4.5 4L9 16" />
      <path d="M15 8l4.5 4L15 16" />
    </>
  ),
  palette: (
    <>
      <path d="M12 20.5a8.5 8.5 0 110-17c4.7 0 8.5 3.2 8.5 7.1 0 2.5-2 4-4.4 4h-1.6a1.9 1.9 0 00-1.3 3.3 1.6 1.6 0 01-1.2 2.6z" />
      <circle cx="8.5" cy="10.5" r="1.1" />
      <circle cx="12" cy="8" r="1.1" />
      <circle cx="15.5" cy="10.5" r="1.1" />
    </>
  ),
  wrench: <path d="M20 5.5l-3 3-2.5-2.5 3-3a5.5 5.5 0 00-7.3 7.3L4 16.5V20h3.5l6.2-6.2A5.5 5.5 0 0020 5.5z" />,
  leaf: (
    <>
      <path d="M4 20c0-8 5-13 16-13 0 9-5.5 13-11 13a5 5 0 01-5-5z" />
      <path d="M4.5 19.5C8 16 12 13.5 17 12" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.4" />
      <path d="M8 10.5V8a4 4 0 018 0v2.5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </>
  ),
  message: <path d="M4 5h16v11H9l-5 4z" />,
  calendar: (
    <>
      <rect x="3.5" y="5.5" width="17" height="15" rx="2.4" />
      <path d="M3.5 10.5h17M8.5 3.5v4M15.5 3.5v4" />
    </>
  ),
  award: (
    <>
      <circle cx="12" cy="9.5" r="5.5" />
      <path d="M8.6 14.2L7 21l5-2.6L17 21l-1.6-6.8" />
    </>
  ),
  truck: (
    <>
      <path d="M3 7h10v9H3zM13 10.5h4l3 3.2V16h-7z" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </>
  ),
  coffee: (
    <>
      <path d="M4 8h13v5.5A5.5 5.5 0 014 13.5z" />
      <path d="M17 9.5h1.8a2.2 2.2 0 010 4.4H17" />
      <path d="M3.5 20.5h14" />
    </>
  ),
  utensils: (
    <>
      <path d="M7 3.5v8M4.5 3.5v4A2.5 2.5 0 007 10M9.5 3.5v4A2.5 2.5 0 017 10M7 11.5v9" />
      <path d="M16 20.5v-8c0-4 1.5-6.5 3.5-9v17" />
    </>
  ),
  scissors: (
    <>
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="6.5" cy="17.5" r="2.5" />
      <path d="M8.6 8.3L20 19M8.6 15.7L20 5" />
    </>
  ),
  dumbbell: (
    <>
      <path d="M4 9v6M7 7.5v9M17 7.5v9M20 9v6M7 12h10" />
    </>
  ),
  home: (
    <>
      <path d="M4 11l8-6.5 8 6.5v9H4z" />
      <path d="M9.5 20v-5.5h5V20" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3.5" y="7.5" width="17" height="12" rx="2.2" />
      <path d="M9 7.5V6a2 2 0 012-2h2a2 2 0 012 2v1.5M3.5 12.5h17" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5z" />
      <path d="M4 5.5V20.5" />
    </>
  ),
  cloud: <path d="M7 18.5h10a3.5 3.5 0 000-7 5.5 5.5 0 00-10.6 1.4A3 3 0 007 18.5z" />,
  cpu: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="2" />
      <path d="M10 3.5v3M14 3.5v3M10 17.5v3M14 17.5v3M3.5 10h3M3.5 14h3M17.5 10h3M17.5 14h3" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="6.5" rx="7.5" ry="3" />
      <path d="M4.5 6.5v11c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-11" />
      <path d="M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3.5L20.5 8 12 12.5 3.5 8z" />
      <path d="M3.5 12.5L12 17l8.5-4.5" />
    </>
  ),
  pen: <path d="M4 20l1-4.5L16 4.5a2.1 2.1 0 013 3L8 18.5z" />,
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  play: <path d="M8 5.5l11 6.5-11 6.5z" />,
  quote: (
    <>
      <path d="M9 6.5C6 8 4.5 10.4 4.5 13.5v4h5v-6H7c0-1.8.7-3.2 2-4.2z" />
      <path d="M19 6.5c-3 1.5-4.5 3.9-4.5 7v4h5v-6H17c0-1.8.7-3.2 2-4.2z" />
    </>
  ),
  arrow: <path d="M4.5 12h14M13.5 6.5L20 12l-6.5 5.5" />,
  plus: <path d="M12 5.5v13M5.5 12h13" />,
  minus: <path d="M5.5 12h13" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  instagram: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4.5" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="17" cy="7" r="0.9" />
    </>
  ),
  facebook: <path d="M14.5 8.5h2.5V5h-2.5A4 4 0 0010.5 9v2H8v3.5h2.5V21H14v-6.5h2.4l.6-3.5H14V9.5a1 1 0 011-1z" />,
  twitter: <path d="M20 6.3a7 7 0 01-2 .6 3.4 3.4 0 001.5-1.9 7 7 0 01-2.2.9A3.4 3.4 0 0011.5 9a9.6 9.6 0 01-7-3.5s-2.5 5.5 3 8.5a6.8 6.8 0 01-4 1c3 2 6.5 2 9-.5 1.9-1.9 2.6-4.3 2.4-6.6A5.7 5.7 0 0020 6.3z" />,
  linkedin: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M8 10.5V16M8 7.6v.1M12 16v-3.2a1.8 1.8 0 013.6 0V16" />
    </>
  ),
  youtube: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="3.5" />
      <path d="M10.5 9.5l4.5 2.5-4.5 2.5z" />
    </>
  ),
  github: (
    <path d="M12 3a9 9 0 00-2.84 17.54c.45.08.62-.2.62-.44v-1.54c-2.5.54-3.03-1.2-3.03-1.2-.41-1.04-1-1.32-1-1.32-.82-.56.06-.55.06-.55.9.06 1.38.93 1.38.93.8 1.37 2.1.97 2.62.74.08-.59.32-.97.57-1.2-2-.23-4.1-1-4.1-4.45 0-1 .36-1.8.93-2.43-.09-.23-.4-1.15.09-2.4 0 0 .76-.24 2.48.92A8.6 8.6 0 0112 7.07c.77 0 1.55.1 2.27.3 1.72-1.16 2.48-.92 2.48-.92.49 1.25.18 2.17.09 2.4.58.63.93 1.44.93 2.43 0 3.46-2.11 4.22-4.12 4.44.33.29.62.84.62 1.7v2.52c0 .24.16.53.62.44A9 9 0 0012 3z" />
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: <path d="M16.5 4.6A8 8 0 108 19.4 6.8 6.8 0 0016.5 4.6z" />,
}

export const ICON_NAMES = Object.keys(PATHS)

export function Icon({ name, size = 24, filled = false }: { name?: unknown; size?: number; filled?: boolean }) {
  const key = typeof name === 'string' && PATHS[name] ? name : 'sparkles'
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[key]}
    </svg>
  )
}
