import React from 'react';

export interface DataRowProps {
  label: string;
  value: React.ReactNode;
  variant?: 'default' | 'strong';
  className?: string;
  style?: React.CSSProperties;
}

export const DataRow: React.FC<DataRowProps> = ({
  label,
  value,
  variant = 'default',
  className = '',
  style,
}) => {
  const isStrong = variant === 'strong';

  return (
    <div
      className={`nexo-datarow ${isStrong ? 'nexo-datarow--strong' : ''} ${className}`}
      style={{
        minHeight: isStrong ? '52px' : '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        ...style,
      }}
    >
      <span
        style={{
          color: isStrong ? 'var(--text)' : 'var(--muted)',
          fontSize: isStrong
            ? 'max(var(--min-text), 13px)'
            : 'max(var(--min-text), 10px)',
          fontWeight: isStrong ? 600 : 400,
        }}
      >
        {label}
      </span>

      <span
        style={{
          color: isStrong ? 'var(--accent)' : 'var(--text)',
          fontSize: isStrong
            ? 'max(var(--min-text), 15px)'
            : 'max(var(--min-text), 10px)',
          fontWeight: 600,
          textAlign: 'right',
        }}
      >
        {value}
      </span>
    </div>
  );
};
