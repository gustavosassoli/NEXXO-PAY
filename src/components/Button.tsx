import React, { forwardRef } from 'react';
import { Icon, IconName } from './icons';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: IconName;
  iconSize?: number;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      icon,
      iconSize = 18,
      fullWidth = true,
      children,
      className = '',
      disabled,
      style,
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={`nexo-button nexo-button--${variant} ${className}`}
        disabled={disabled}
        style={{
          minHeight: '51px',
          borderRadius: '16px',
          fontSize: 'max(var(--min-text), 12px)',
          fontWeight: 700,
          fontFamily: 'inherit',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '9px',
          width: fullWidth ? '100%' : 'auto',
          padding: '0 20px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          transition: 'transform 200ms ease, opacity 200ms ease, background-color 200ms ease',
          border: 'none',
          outline: 'none',
          userSelect: 'none',
          ...style,
        }}
        {...rest}
      >
        {icon && <Icon name={icon} size={iconSize} />}
        <span>{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';
