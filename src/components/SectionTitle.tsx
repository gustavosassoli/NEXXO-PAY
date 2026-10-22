import React from 'react';

interface SectionTitleProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  actionLabel,
  onAction,
  className = '',
  style,
}) => {
  return (
    <div
      className={`nexo-section-title ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px',
        ...style,
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: 'max(var(--min-text), 16px)',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--text)',
        }}
      >
        {title}
      </h2>

      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: onAction ? 'pointer' : 'default',
            color: 'var(--accent)',
            fontSize: 'max(var(--min-text), 11px)',
            fontWeight: 500,
            lineHeight: 1,
            outline: 'none',
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
