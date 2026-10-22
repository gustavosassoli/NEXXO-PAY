import React from 'react';

export type IconName =
  | 'home'
  | 'wallet'
  | 'scan'
  | 'activity'
  | 'user'
  | 'bell'
  | 'eye'
  | 'eyeOff'
  | 'arrowUp'
  | 'arrowDown'
  | 'plus'
  | 'chevron'
  | 'copy'
  | 'flash'
  | 'image'
  | 'keyboard'
  | 'shield'
  | 'check'
  | 'clock'
  | 'close'
  | 'store'
  | 'restaurant'
  | 'swap'
  | 'send'
  | 'settings'
  | 'help'
  | 'logout'
  | 'lock'
  | 'file'
  | 'back'
  | 'info'
  | 'download'
  | 'refresh'
  | 'sun'
  | 'moon';

const ICON_PATHS: Record<IconName, string> = {
  home: 'M3 11l 9-8 9 8M5 10v10h14V10M9 20v-6h6v6',
  wallet:
    'M6 6H18a3 3 0 0 1 3 3V17a3 3 0 0 1 -3 3H6a3 3 0 0 1 -3 -3V9a3 3 0 0 1 3 -3ZM17 11h4v5h-4a2.5 2.5 0 0 1 0-5ZM6 6V5a2 2 0 0 1 2-2h9',
  scan: 'M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3M7 12h10',
  activity: 'M4 18V9M10 18V5M16 18v-7M22 18V3M2 21h21',
  user: 'M8 8a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M4 21a8 8 0 0 1 16 0',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4',
  eye: 'M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12ZM9.5 12a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0',
  eyeOff:
    'M3 3l 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.4 5.2A11 11 0 0 1 12 5c6.5 0 10 7 10 7a15 15 0 0 1-2 2.8M6.6 6.6C3.6 8.3 2 12 2 12s3.5 7 10 7a10 10 0 0 0 4-.8',
  arrowUp: 'M12 19V5M6 11l6-6 6 6',
  arrowDown: 'M12 5v14M18 13l-6 6-6-6',
  plus: 'M12 5v14M5 12h14',
  chevron: 'M9 18l 6-6-6-6',
  copy: 'M10 8H18a2 2 0 0 1 2 2V18a2 2 0 0 1 -2 2H10a2 2 0 0 1 -2 -2V10a2 2 0 0 1 2 -2ZM16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2',
  flash: 'M13 2l-8 12h7l-1 8 8-12h-7l1-8Z',
  image:
    'M6 4H18a3 3 0 0 1 3 3V17a3 3 0 0 1 -3 3H6a3 3 0 0 1 -3 -3V7a3 3 0 0 1 3 -3ZM7 9a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M3 16l 4-4 4 4 3-3 7 7',
  keyboard:
    'M5 5H19a3 3 0 0 1 3 3V16a3 3 0 0 1 -3 3H5a3 3 0 0 1 -3 -3V8a3 3 0 0 1 3 -3ZM6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 13h.01M10 13h.01M14 13h4M7 16h10',
  shield: 'M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10ZM9 12l 2 2 4-4',
  check: 'M5 12l 4 4L19 6',
  clock: 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M12 7v5l3 2',
  close: 'M6 6l 12 12M18 6 6 18',
  store: 'M4 10v10h16V10M3 4h18l-2 6H5L3 4ZM9 20v-6h6v6',
  restaurant:
    'M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M17 3v18M17 3c-3 2-3 8 0 9',
  swap: 'M7 7l 3-3 3 3M10 4v12M17 17l-3 3-3-3M14 20V8',
  send: 'M22 2l-7 20-4-9-9-4 20-7ZM22 2 11 13',
  settings:
    'M9 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z',
  help: 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M9.8 9a2.3 2.3 0 1 1 3.5 2c-1.3.7-1.3 1.2-1.3 2M12 17h.01',
  logout: 'M10 17l5-5-5-5M15 12H3M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4',
  lock: 'M7 10H17a3 3 0 0 1 3 3V18a3 3 0 0 1 -3 3H7a3 3 0 0 1 -3 -3V13a3 3 0 0 1 3 -3ZM8 10V7a4 4 0 0 1 8 0v3',
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8ZM14 2v6h6M8 13h8M8 17h5',
  back: 'M15 18l-6-6 6-6',
  info: 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M12 11v6M12 7h.01',
  download: 'M12 3v12M7 10l5 5 5-5M5 21h14',
  refresh: 'M20 7h-6V1M4 17h6v6M20 7a9 9 0 0 0-15-2M4 17a9 9 0 0 0 15 2',
  sun: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42',
  moon: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z',
};

export interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  className = '',
  style,
}) => {
  const path = ICON_PATHS[name];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style,
      }}
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
};
