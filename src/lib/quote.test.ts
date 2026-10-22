import { describe, it, expect } from 'vitest';
import { calculateQuote } from './quote';

describe('Quote Engine (src/lib/quote.ts)', () => {
  it('calculates exact values for R$ 128,40 with USDT (matching W1)', () => {
    const q = calculateQuote(128.4, 'USDT');
    expect(q.quoteString).toBe('1 USDT = R$ 5,155');
    expect(q.convertedTokenString).toBe('24,908 USDT');
    expect(q.totalTokenString).toBe('25,393 USDT');
    expect(q.feesTokenString).toBe('0,485 USDT');
    expect(q.debitedString).toBe('25,393 USDT debitados');
    expect(q.isInsufficientBalance).toBe(false);
  });

  it('calculates exact values for R$ 128,40 with USDC (matching W1)', () => {
    const q = calculateQuote(128.4, 'USDC');
    expect(q.quoteString).toBe('1 USDC = R$ 5,155');
    expect(q.convertedTokenString).toBe('24,908 USDC');
    expect(q.totalTokenString).toBe('25,393 USDC');
    expect(q.feesTokenString).toBe('0,485 USDC');
    expect(q.isInsufficientBalance).toBe(false);
  });

  it('calculates exact values for R$ 128,40 with ETH (matching W1)', () => {
    const q = calculateQuote(128.4, 'ETH');
    expect(q.quoteString).toBe('1 ETH = R$ 13.218,00');
    expect(q.convertedTokenString).toBe('0,00971 ETH');
    expect(q.totalTokenString).toBe('0,00990 ETH');
    expect(q.feesTokenString).toBe('0,00019 ETH');
    expect(q.debitedString).toBe('0,00990 ETH debitados');
    expect(q.isInsufficientBalance).toBe(false);
  });

  it('calculates correct values for R$ 86,00 with USDT', () => {
    const q = calculateQuote(86.0, 'USDT');
    // 86.00 / 5.155 = 16.68283... -> 16,683 USDT
    // (86.00 + 2.50) = 88.50 / 5.155 = 17.16779... -> 17,168 USDT
    // Fee = 17,168 - 16,683 = 0,485 USDT
    expect(q.convertedTokenString).toBe('16,683 USDT');
    expect(q.totalTokenString).toBe('17,168 USDT');
    expect(q.feesTokenString).toBe('0,485 USDT');
    expect(q.isInsufficientBalance).toBe(false);
  });

  it('detects insufficient balance when total exceeds available balance', () => {
    // ETH balance is 0.039 ETH (~ R$ 515). If charging R$ 1000.00:
    const q = calculateQuote(1000.0, 'ETH');
    expect(q.isInsufficientBalance).toBe(true);

    // Custom small balance test
    const qCustom = calculateQuote(128.4, 'USDT', 10.0);
    expect(qCustom.isInsufficientBalance).toBe(true);
  });
});
