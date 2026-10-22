import React from 'react';
import { Icon, IconName } from './icons';
import { ActivityTone } from '../data/mock';

export interface ActivityItemProps {
  icon: IconName;
  title: string;
  subtitle: string;
  amountPrimary: string;
  amountSecondary: string;
  tone?: ActivityTone;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({
  icon,
  title,
  subtitle,
  amountPrimary,
  amountSecondary,
  tone = 'outgoing',
  onClick,
  className = '',
  style,
}) => {
  // Configuração visual de ícone conforme o tom
  let iconBg = 'var(--surface-3)';
  let iconColor = 'var(--activity-out)';

  if (tone === 'incoming') {
    iconBg = 'var(--accent-tint-10)';
    iconColor = 'var(--accent)';
  } else if (tone === 'conversion') {
    iconBg = 'var(--activity-conv-bg)';
    iconColor = 'var(--activity-conv)';
  }

  return (
    <div
      className={`nexo-activity-item ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{
        padding: '14px',
        display: 'grid',
        gridTemplateColumns: '39px 1fr auto',
        gap: '11px',
        alignItems: 'center',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background-color 150ms ease',
        ...style,
      }}
    >
      {/* Caixa do ícone */}
      <div
        style={{
          width: '39px',
          height: '39px',
          borderRadius: '13px',
          backgroundColor: iconBg,
          color: iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon name={icon} size={20} />
      </div>

      {/* Conteúdo central */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
        <span
          style={{
            fontSize: 'max(var(--min-text), 11px)',
            fontWeight: 600,
            color: 'var(--text)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontSize: 'max(var(--min-text), 8px)',
            fontWeight: 400,
            color: 'var(--muted)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {subtitle}
        </span>
      </div>

      {/* Valores à direita */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '3px',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 'max(var(--min-text), 11px)',
            fontWeight: 600,
            color: 'var(--text)',
            whiteSpace: 'nowrap',
          }}
        >
          {amountPrimary}
        </span>
        <span
          style={{
            fontSize: 'max(var(--min-text), 8px)',
            fontWeight: 400,
            color: 'var(--muted)',
            whiteSpace: 'nowrap',
          }}
        >
          {amountSecondary}
        </span>
      </div>
    </div>
  );
};
