import React from 'react';

export type CoinType = 'USDT' | 'USDC' | 'ETH';

export interface CoinProps {
  coin: CoinType;
  initial?: string;
  size?: 'small' | 'large';
  className?: string;
  style?: React.CSSProperties;
}

const COIN_CONFIG: Record<
  CoinType,
  { bg: string; text: string; defaultInitial: string }
> = {
  USDT: {
    bg: 'var(--coin-usdt-bg)',
    text: 'var(--coin-usdt-text)',
    defaultInitial: 'U',
  },
  USDC: {
    bg: 'var(--coin-usdc-bg)',
    text: 'var(--coin-usdc-text)',
    defaultInitial: 'U',
  },
  ETH: {
    bg: 'var(--coin-eth-bg)',
    text: 'var(--coin-eth-text)',
    defaultInitial: 'E',
  },
};

export const Coin: React.FC<CoinProps> = ({
  coin,
  initial,
  size = 'small',
  className = '',
  style,
}) => {
  const config = COIN_CONFIG[coin] || COIN_CONFIG.USDT;
  const isLarge = size === 'large';
  const dimension = isLarge ? 57 : 34;
  const fontSize = isLarge ? 19 : 12;
  const letter = initial ?? config.defaultInitial;

  return (
    <div
      className={`nexo-coin nexo-coin--${coin.toLowerCase()} ${className}`}
      style={{
        width: `${dimension}px`,
        height: `${dimension}px`,
        borderRadius: '50%',
        backgroundColor: config.bg,
        color: config.text,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `max(var(--min-text), ${fontSize}px)`,
        fontWeight: 800,
        lineHeight: 1,
        userSelect: 'none',
        flexShrink: 0,
        ...style,
      }}
    >
      {letter}
    </div>
  );
};
