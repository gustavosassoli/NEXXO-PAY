import React from 'react';
import { strings } from '../strings';
import { DEMO_MODE } from '../config';

interface DemoBadgeProps {
  className?: string;
  style?: React.CSSProperties;
}

export const DemoBadge: React.FC<DemoBadgeProps> = ({ className = '', style }) => {
  if (!DEMO_MODE) {
    return null;
  }

  return (
    <div
      className={`nexo-demo-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '5px 8px',
        borderRadius: '100px',
        border: '1px solid var(--line)',
        backgroundColor: 'var(--demo-badge-bg)',
        color: 'var(--demo-badge-text)',
        fontSize: 'max(var(--min-text), 8px)',
        fontWeight: 700,
        letterSpacing: '0.09em',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        userSelect: 'none',
        ...style,
      }}
    >
      {strings.demoBadge}
    </div>
  );
};
