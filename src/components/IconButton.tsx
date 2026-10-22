import React from 'react';
import { Icon, IconName } from './icons';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  iconSize?: number;
  size?: 'normal' | 'topbar';
  badgeDot?: boolean;
  'aria-label': string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  iconSize,
  size = 'normal',
  badgeDot = false,
  className = '',
  style,
  ...rest
}) => {
  const dimension = size === 'topbar' ? 36 : 40;
  const defaultIconSize = size === 'topbar' ? 18 : 20;
  const resolvedIconSize = iconSize ?? defaultIconSize;

  return (
    <button
      type="button"
      className={`nexo-icon-button ${className}`}
      style={{
        width: `${dimension}px`,
        height: `${dimension}px`,
        borderRadius: '13px',
        border: '1px solid var(--line)',
        backgroundColor: 'var(--icon-btn-bg)',
        color: 'var(--text)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: 'pointer',
        padding: 0,
        outline: 'none',
        flexShrink: 0,
        transition: 'transform 200ms ease, background-color 200ms ease, opacity 200ms ease',
        ...style,
      }}
      {...rest}
    >
      <Icon name={icon} size={resolvedIconSize} />
      {badgeDot && (
        <span
          className="nexo-icon-button-badge"
          style={{
            position: 'absolute',
            top: '8px',
            right: '9px',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent)',
            boxShadow: '0 0 0 2px var(--surface)',
          }}
        />
      )}
    </button>
  );
};
