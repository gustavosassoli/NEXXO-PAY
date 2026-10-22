import React from 'react';
import { Icon, IconName } from './icons';

export interface InfoCardProps {
  icon?: IconName;
  iconSize?: number;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  icon = 'info',
  iconSize = 18,
  children,
  className = '',
  style,
}) => {
  return (
    <div
      className={`nexo-info-card ${className}`}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '13px',
        borderRadius: '15px',
        backgroundColor: 'var(--info-bg)',
        border: '1px solid var(--info-border)',
        color: 'var(--info-card-text)',
        fontSize: 'max(var(--min-text), 9px)',
        lineHeight: 1.5,
        margin: '15px 0',
        ...style,
      }}
    >
      <div style={{ color: 'var(--info-card-text)', flexShrink: 0, marginTop: '1px' }}>
        <Icon name={icon} size={iconSize} />
      </div>
      <div>{children}</div>
    </div>
  );
};
