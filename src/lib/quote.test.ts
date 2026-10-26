import { describe, it, expect } from 'vitest';
import { calculateQuote } from './quote';

describe('Quote Engine (src/lib/quote.ts) - Zero Floats, BigInt & Integer Cents', () => {
  it('calculates exact values for 12840 cents (R$ 128,40) with USDT (6 decimals)', () => {
    const q = calculateQuote(12840, 'USDT');
    expect(q.quoteString).toBe('1 USDT = R$ 5,155');
    expect(q.convertedUnits).toBe(24_908_000n);
    expect(q.totalUnits).toBe(25_393_000n);
    expect(q.feesUnits).toBe(485_000n);
    expect(q.decimals).toBe(6);

    expect(q.convertedTokenString).toBe('24,908 USDT');
    expect(q.totalTokenString).toBe('25,393 USDT');
    expect(q.feesTokenString).toBe('0,485 USDT');
    expect(q.debitedString).toBe('25,393 USDT debitados');
    expect(q.isInsufficientBalance).toBe(false);
  });

  it('calculates exact values for 12840 cents (R$ 128,40) with USDC (6 decimals)', () => {
    const q = calculateQuote(12840, 'USDC');
    expect(q.quoteString).toBe('1 USDC = R$ 5,155');
    expect(q.convertedUnits).toBe(24_908_000n);
    expect(q.totalUnits).toBe(25_393_000n);
    expect(q.feesUnits).toBe(485_000n);
    expect(q.decimals).toBe(6);

    expect(q.convertedTokenString).toBe('24,908 USDC');
    expect(q.totalTokenString).toBe('25,393 USDC');
    expect(q.feesTokenString).toBe('0,485 USDC');
    expect(q.isInsufficientBalance).toBe(false);
  });

  it('calculates exact values for 12840 cents (R$ 128,40) with ETH (18 decimals)', () => {
    const q = calculateQuote(12840, 'ETH');
    expect(q.quoteString).toBe('1 ETH = R$ 13.218,00');
    expect(q.convertedUnits).toBe(9_710_000_000_000_000n);
    expect(q.totalUnits).toBe(9_900_000_000_000_000n);
    expect(q.feesUnits).toBe(190_000_000_000_000n);
    expect(q.decimals).toBe(18);

    expect(q.convertedTokenString).toBe('0,00971 ETH');
    expect(q.totalTokenString).toBe('0,00990 ETH');
    expect(q.feesTokenString).toBe('0,00019 ETH');
    expect(q.debitedString).toBe('0,00990 ETH debitados');
    expect(q.isInsufficientBalance).toBe(false);
  });

  it('calculates correct values for 8600 cents (R$ 86,00) with USDT', () => {
    const q = calculateQuote(8600, 'USDT');
    expect(q.convertedTokenString).toBe('16,683 USDT');
    expect(q.totalTokenString).toBe('17,168 USDT');
    expect(q.feesTokenString).toBe('0,485 USDT');
    expect(q.isInsufficientBalance).toBe(false);
  });

  it('detects insufficient balance using BigInt comparison', () => {
    // Saldo padrão de ETH é 0,039 ETH (39_000_000_000_000_000n)
    // Se cobrarmos 100000 centavos (R$ 1000.00), totalUnits ultrapassa o saldo:
    const q = calculateQuote(100000, 'ETH');
    expect(q.isInsufficientBalance).toBe(true);

    // Saldo customizado muito baixo: 10 USDT (10_000_000n)
    const qCustom = calculateQuote(12840, 'USDT', 10_000_000n);
    expect(qCustom.isInsufficientBalance).toBe(true);
  });
});
