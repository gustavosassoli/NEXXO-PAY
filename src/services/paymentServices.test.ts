import { describe, it, expect, vi } from 'vitest';
import { MockQuoteService } from './mock/MockQuoteService';
import { MockBalanceService } from './mock/MockBalanceService';
import { MockPaymentService } from './mock/MockPaymentService';
import { PaymentPixData } from '../domain/payment/types';

describe('Payment Services Layer & Idempotency (src/services)', () => {
  const dummyPix: PaymentPixData = {
    receiverName: 'Mercado Vila Nova',
    receiverCity: 'SAO PAULO',
    txid: 'NEXO1842',
    amountCents: 12840,
    rawCode: '00020101021226580014br.gov.bcb.pix...',
    amountFormatted: 'R$ 128,40',
  };

  describe('QuoteService 45s Cache & Clock Injection', () => {
    it('caches quotes for 45 seconds and returns identical quote instance within window', async () => {
      const quoteService = new MockQuoteService();
      let fakeTime = 100_000;
      const getClock = () => fakeTime;

      // 1ª chamada
      const q1 = await quoteService.getQuote(12840, 'USDT', getClock);
      expect(q1.quotedAt).toBe(100_000);
      expect(q1.expiresAt).toBe(145_000);

      // Avança 20 segundos (ainda dentro dos 45s)
      fakeTime += 20_000;
      const q2 = await quoteService.getQuote(12840, 'USDT', getClock);
      expect(q2.quotedAt).toBe(100_000); // Mesmo timestamp cacheado
      expect(q2.expiresAt).toBe(145_000);

      // Avança além dos 45s (total 50s decorridos)
      fakeTime += 30_000; // fakeTime agora é 150_000 > 145_000
      const q3 = await quoteService.getQuote(12840, 'USDT', getClock);
      expect(q3.quotedAt).toBe(150_000); // Nova cotação emitida
      expect(q3.expiresAt).toBe(195_000);
    });
  });

  describe('PaymentService Idempotency (create and confirm)', () => {
    it('create() is idempotent by txid: returns exact same Payment instance without duplicate', async () => {
      const quoteService = new MockQuoteService();
      const paymentService = new MockPaymentService(quoteService);

      const p1 = await paymentService.create(dummyPix, 'USDT');
      const p2 = await paymentService.create(dummyPix, 'USDT');

      expect(p1.id).toBe(p2.id);
      expect(p1.createdAt).toBe(p2.createdAt);
      expect(p1.history.length).toBe(p2.history.length);
    });

    it('confirm() is idempotent: duplicate calls do not re-run or duplicate state transitions', async () => {
      const quoteService = new MockQuoteService();
      const paymentService = new MockPaymentService(quoteService);

      const payment = await paymentService.create(dummyPix, 'USDT');

      // 1º toque em Confirmar
      const c1 = await paymentService.confirm(payment.id);
      expect(c1.status).toBe('AWAITING_CRYPTO');

      // 2º toque (duplo clique acidental)
      const c2 = await paymentService.confirm(payment.id);
      expect(c2.status).toBe('AWAITING_CRYPTO');
      expect(c2.id).toBe(c1.id);
    });

    it('subscribe() notifies subscribers of real-time state changes', async () => {
      vi.useFakeTimers();
      const quoteService = new MockQuoteService();
      const paymentService = new MockPaymentService(quoteService);

      const payment = await paymentService.create(dummyPix, 'USDT');

      const statuses: string[] = [];
      const unsubscribe = paymentService.subscribe(payment.id, (p) => {
        statuses.push(p.status);
      });

      // Estado inicial registrado no subscribe
      expect(statuses).toEqual(['QUOTED']);

      await paymentService.confirm(payment.id);
      expect(statuses).toContain('AWAITING_CRYPTO');

      // Avança tempo simulado do mock (900ms -> CRYPTO_CONFIRMED)
      vi.advanceTimersByTime(950);
      expect(statuses).toContain('CRYPTO_CONFIRMED');

      // Avança para PAYING_PIX (1900ms)
      vi.advanceTimersByTime(1000);
      expect(statuses).toContain('PAYING_PIX');

      // Avança para COMPLETED (3000ms)
      vi.advanceTimersByTime(1100);
      expect(statuses).toContain('COMPLETED');

      unsubscribe();
      vi.useRealTimers();
    });
  });

  describe('BalanceService', () => {
    it('verifies sufficiency correctly using minimal BigInt units', async () => {
      const balanceService = new MockBalanceService();

      // USDT balance is 850_000_000n (850 USDT)
      const has25USDT = await balanceService.hasSufficientBalance(25_393_000n, 'USDT');
      expect(has25USDT).toBe(true);

      const has1000USDT = await balanceService.hasSufficientBalance(1_000_000_000n, 'USDT');
      expect(has1000USDT).toBe(false);

      // ETH balance is 39_000_000_000_000_000n (0.039 ETH)
      const hasSmallEth = await balanceService.hasSufficientBalance(9_900_000_000_000_000n, 'ETH');
      expect(hasSmallEth).toBe(true);

      const hasBigEth = await balanceService.hasSufficientBalance(50_000_000_000_000_000n, 'ETH');
      expect(hasBigEth).toBe(false);
    });
  });
});
