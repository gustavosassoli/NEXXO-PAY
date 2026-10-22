import React from 'react';
import { strings } from '../strings';

interface BrandProps {
  compact?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Brand: React.FC<BrandProps> = ({ compact = false, className = '', onClick }) => {
  const iconSize = compact ? 32 : 27;
  const iconRadius = compact ? 11 : 9;

  // Escala das barras no logo
  const barScale = compact ? 32 / 27 : 1;

  return (
    <div
      className={`nexo-brand ${compact ? 'nexo-brand--compact' : ''} ${className}`}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '9px',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
      }}
    >
      <div
        className="nexo-brand-icon"
        style={{
          width: `${iconSize}px`,
          height: `${iconSize}px`,
          borderRadius: `${iconRadius}px`,
          backgroundColor: 'var(--accent)',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: `${2 * barScale}px`,
            top: `${8 * barScale}px`,
            width: `${17 * barScale}px`,
            height: `${5 * barScale}px`,
            borderRadius: `${5 * barScale}px`,
            backgroundColor: 'var(--bg)',
            transform: 'rotate(42deg)',
            transformOrigin: 'center center',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: `${8 * barScale}px`,
            top: `${14 * barScale}px`,
            width: `${17 * barScale}px`,
            height: `${5 * barScale}px`,
            borderRadius: `${5 * barScale}px`,
            backgroundColor: 'var(--bg)',
            transform: 'rotate(42deg)',
            transformOrigin: 'center center',
          }}
        />
      </div>

      {!compact && (
        <span
          className="nexo-brand-text"
          style={{
            fontSize: 'max(var(--min-text), 15px)',
            fontWeight: 800,
            letterSpacing: '0.12em',
            lineHeight: 1,
            display: 'flex',
            gap: '4px',
          }}
        >
          <span style={{ color: 'var(--text)' }}>{strings.appBrandPrefix}</span>
          <span style={{ color: 'var(--accent)' }}>{strings.appBrandSuffix}</span>
        </span>
      )}
    </div>
  );
};
