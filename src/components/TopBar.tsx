import React from 'react';
import { Brand } from './Brand';
import { IconButton } from './IconButton';
import { IconName } from './icons';

export interface TopBarProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showBrand?: boolean;
  actionIcon?: IconName;
  onAction?: () => void;
  actionAriaLabel?: string;
  className?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  title = '',
  showBack = false,
  onBack,
  showBrand = false,
  actionIcon,
  onAction,
  actionAriaLabel = 'Ação',
  className = '',
}) => {
  return (
    <header
      className={`nexo-topbar ${className}`}
      style={{
        height: '47px',
        display: 'grid',
        gridTemplateColumns: '44px 1fr 44px',
        alignItems: 'center',
        marginBottom: '18px',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
        {showBack && (
          <IconButton
            icon="back"
            size="topbar"
            aria-label="Voltar"
            onClick={onBack}
          />
        )}
        {!showBack && showBrand && <Brand compact />}
      </div>

      <div
        style={{
          textAlign: 'center',
          fontSize: 'max(var(--min-text), 15px)',
          fontWeight: 650,
          color: 'var(--text)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          padding: '0 4px',
        }}
      >
        {title}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        {actionIcon && (
          <IconButton
            icon={actionIcon}
            size="topbar"
            aria-label={actionAriaLabel}
            onClick={onAction}
          />
        )}
      </div>
    </header>
  );
};
