import React from 'react';
import { Icon, IconName } from './icons';

export interface WarningCardProps {
  icon?: IconName;
  iconSize?: number;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const WarningCard: React.FC<WarningCardProps> = ({
  icon = 'shield',
  iconSize = 19,
  children,
  className = '',
  style,
}) => {
  return (
    <div
      className={`nexo-warning-card ${className}`}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '13px',
        borderRadius: '15px',
        backgroundColor: 'var(--warning-bg-7)',
        border: '1px solid var(--warning-border-15)',
        color: 'var(--warning-text)',
        fontSize: 'max(var(--min-text), 9px)',
        lineHeight: 1.5,
        ...style,
      }}
    >
      <div style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '1px' }}>
        <Icon name={icon} size={iconSize} />
      </div>
      <div>{children}</div>
    </div>
  );
};
