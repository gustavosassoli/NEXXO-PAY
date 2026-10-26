import { describe, it, expect } from 'vitest';
import { Payment, PaymentStatus } from './types';
import {
  transition,
  canTransition,
  resolvePixAttempt,
  ALLOWED_TRANSITIONS,
  isFinalStatus,
} from './transitions';
import { stepsFor, resultStateFor } from './steps';

describe('Payment Domain State Machine (src/domain/payment/payment.test.ts)', () => {
  const ALL_STATUSES: PaymentStatus[] = [
    'CREATED',
    'QUOTED',
    'AWAITING_CRYPTO',
    'CRYPTO_CONFIRMED',
    'PAYING_PIX',
    'PIX_PENDING',
    'COMPLETED',
    'REFUNDING',
    'REFUNDED',
    'EXPIRED',
    'FAILED',
  ];

  const dummyQuote = {
    asset: 'USDT' as const,
    brlCents: 12840,
    conversionFeeBrlCents: 128,
    networkFeeBrlCents: 42,
    serviceFeeBrlCents: 80,
    totalFeesBrlCents: 250,
    totalBrlCents: 13090,
    quoteString: '1 USDT = R$ 5,155',
    convertedUnits: 24_908_000n,
    feesUnits: 485_000n,
    totalUnits: 25_393_000n,
    decimals: 6,
    convertedTokenString: '24,908 USDT',
    feesTokenString: '0,485 USDT',
    totalTokenString: '25,393 USDT',
    debitedString: '25,393 USDT debitados',
    quotedAt: 1000,
    expiresAt: 46000,
  };

  const createTestPayment = (status: PaymentStatus = 'CREATED'): Payment => ({
    id: `pay_test_${status.toLowerCase()}`,
    status,
    pix: {
      receiverName: 'Mercado Vila Nova',
      receiverCity: 'SAO PAULO',
      txid: 'NEXO1842',
      amountCents: 12840,
      rawCode: '000201...',
      amountFormatted: 'R$ 128,40',
    },
    asset: 'USDT',
    quote: dummyQuote,
    createdAt: 1000,
    updatedAt: 1000,
    history: [{ status, at: 1000 }],
  });

  describe('Exhaustive Transition Matrix Validation', () => {
    it('verifies that every single permitted transition succeeds, updates timestamp, and appends history', () => {
      ALL_STATUSES.forEach((fromStatus) => {
        const allowedTargets = ALLOWED_TRANSITIONS[fromStatus];

        allowedTargets.forEach((targetStatus) => {
          const payment = createTestPayment(fromStatus);
          const timestamp = 2500;
          const reason = `Test transition from ${fromStatus} to ${targetStatus}`;

          expect(canTransition(fromStatus, targetStatus)).toBe(true);

          const result = transition(payment, targetStatus, timestamp, reason);

          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.payment.status).toBe(targetStatus);
            expect(result.payment.updatedAt).toBe(timestamp);
            expect(result.payment.history).toHaveLength(2);
            expect(result.payment.history[1]).toEqual({
              status: targetStatus,
              at: timestamp,
              reason,
            });
          }
        });
      });
    });

    it('verifies that every non-permitted transition is strictly rejected with a typed error without throwing', () => {
      ALL_STATUSES.forEach((fromStatus) => {
        const allowedTargets = new Set(ALLOWED_TRANSITIONS[fromStatus]);
        const forbiddenTargets = ALL_STATUSES.filter((target) => !allowedTargets.has(target));

        forbiddenTargets.forEach((targetStatus) => {
          const payment = createTestPayment(fromStatus);
          const timestamp = 2500;

          expect(canTransition(fromStatus, targetStatus)).toBe(false);

          const result = transition(payment, targetStatus, timestamp);

          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.currentStatus).toBe(fromStatus);
            expect(result.targetStatus).toBe(targetStatus);
            expect(result.error).toContain(
              `Transição inválida de ${fromStatus} para ${targetStatus}`
            );
          }
          // Garante imutabilidade do objeto original
          expect(payment.status).toBe(fromStatus);
          expect(payment.history).toHaveLength(1);
        });
      });
    });

    it('enforces that terminal states (COMPLETED, REFUNDED, EXPIRED, FAILED) have zero outgoing transitions', () => {
      const terminalStates: PaymentStatus[] = ['COMPLETED', 'REFUNDED', 'EXPIRED', 'FAILED'];

      terminalStates.forEach((terminalState) => {
        expect(isFinalStatus(terminalState)).toBe(true);
        expect(ALLOWED_TRANSITIONS[terminalState]).toEqual([]);

        ALL_STATUSES.forEach((attemptedTarget) => {
          const payment = createTestPayment(terminalState);
          const result = transition(payment, attemptedTarget, 3000);
          expect(result.success).toBe(false);
        });
      });
    });
  });

  describe('Critical Safety Rules: PIX_PENDING vs REFUNDING', () => {
    it('forces uncertain or timeout responses to PIX_PENDING, strictly preventing premature REFUNDING', () => {
      const payingPixPayment = createTestPayment('PAYING_PIX');
      const now = 5000;

      const result = resolvePixAttempt(
        payingPixPayment,
        'uncertain_or_timeout',
        now,
        'SPI timeout from Central Bank'
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.payment.status).toBe('PIX_PENDING');
        expect(result.payment.status).not.toBe('REFUNDING');
        expect(result.payment.history).toHaveLength(2);
        expect(result.payment.history[1].status).toBe('PIX_PENDING');
      }
    });

    it('allows REFUNDING only upon confirmed and definite Pix failure', () => {
      const payingPixPayment = createTestPayment('PAYING_PIX');
      const now = 5000;

      const result = resolvePixAttempt(
        payingPixPayment,
        'failure_confirmed',
        now,
        'Destination bank account closed/blocked'
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.payment.status).toBe('REFUNDING');
        expect(result.payment.status).not.toBe('PIX_PENDING');
        expect(result.payment.history[1].status).toBe('REFUNDING');
      }
    });

    it('allows successful Pix resolution to reach COMPLETED', () => {
      const payingPixPayment = createTestPayment('PAYING_PIX');
      const now = 5000;

      const result = resolvePixAttempt(
        payingPixPayment,
        'success',
        now,
        'Pix settled with E2E receipt'
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.payment.status).toBe('COMPLETED');
        expect(result.payment.status).not.toBe('REFUNDING');
      }
    });

    it('allows PIX_PENDING to resolve to COMPLETED once confirmed or to REFUNDING if confirmed failed', () => {
      const pendingPayment = createTestPayment('PIX_PENDING');

      // 1. Resolução para COMPLETED (sucesso tardio recebido via webhook/poll)
      const successTransition = transition(pendingPayment, 'COMPLETED', 6000, 'Late webhook confirmed');
      expect(successTransition.success).toBe(true);
      if (successTransition.success) {
        expect(successTransition.payment.status).toBe('COMPLETED');
      }

      // 2. Resolução para REFUNDING (falha confirmada após pendência)
      const refundTransition = transition(pendingPayment, 'REFUNDING', 6000, 'Late failure confirmed');
      expect(refundTransition.success).toBe(true);
      if (refundTransition.success) {
        expect(refundTransition.payment.status).toBe('REFUNDING');
      }

      // 3. Rejeita transições diretas inválidas a partir de PIX_PENDING
      expect(transition(pendingPayment, 'AWAITING_CRYPTO', 6000).success).toBe(false);
      expect(transition(pendingPayment, 'CREATED', 6000).success).toBe(false);
      expect(transition(pendingPayment, 'EXPIRED', 6000).success).toBe(false);
      expect(transition(pendingPayment, 'REFUNDED', 6000).success).toBe(false); // deve passar por REFUNDING primeiro!
    });

    it('ensures REFUNDING leads to terminal REFUNDED or FAILED, and cannot re-trigger payments', () => {
      const refundingPayment = createTestPayment('REFUNDING');

      // Sucesso no estorno
      const refundSuccess = transition(refundingPayment, 'REFUNDED', 7000, 'Crypto refunded to user');
      expect(refundSuccess.success).toBe(true);
      if (refundSuccess.success) {
        expect(refundSuccess.payment.status).toBe('REFUNDED');
        expect(isFinalStatus('REFUNDED')).toBe(true);
      }

      // Falha no estorno
      const refundFail = transition(refundingPayment, 'FAILED', 7000, 'Refund contract execution error');
      expect(refundFail.success).toBe(true);
      if (refundFail.success) {
        expect(refundFail.payment.status).toBe('FAILED');
        expect(isFinalStatus('FAILED')).toBe(true);
      }

      // Rejeita voltar para PAYING_PIX ou COMPLETED
      expect(transition(refundingPayment, 'PAYING_PIX', 7000).success).toBe(false);
      expect(transition(refundingPayment, 'COMPLETED', 7000).success).toBe(false);
    });
  });

  describe('Decoupled UI Steps and Result Mapping', () => {
    it('maps all payment statuses to their appropriate 5-step timeline representation', () => {
      // CREATED: Etapa 1 em andamento
      const createdSteps = stepsFor('CREATED');
      expect(createdSteps[0].status).toBe('in_progress');
      expect(createdSteps[1].status).toBe('pending');

      // AWAITING_CRYPTO: Etapa 1 concluída, Etapa 2 em andamento
      const cryptoSteps = stepsFor('AWAITING_CRYPTO');
      expect(cryptoSteps[0].status).toBe('done');
      expect(cryptoSteps[1].status).toBe('in_progress');
      expect(cryptoSteps[2].status).toBe('pending');

      // CRYPTO_CONFIRMED: Etapas 1 e 2 concluídas, Etapa 3 em andamento
      const confirmedSteps = stepsFor('CRYPTO_CONFIRMED');
      expect(confirmedSteps[0].status).toBe('done');
      expect(confirmedSteps[1].status).toBe('done');
      expect(confirmedSteps[2].status).toBe('in_progress');
      expect(confirmedSteps[3].status).toBe('pending');

      // PAYING_PIX: Etapas 1, 2 e 3 concluídas, Etapa 4 em andamento
      const payingSteps = stepsFor('PAYING_PIX');
      expect(payingSteps[0].status).toBe('done');
      expect(payingSteps[1].status).toBe('done');
      expect(payingSteps[2].status).toBe('done');
      expect(payingSteps[3].status).toBe('in_progress');
      expect(payingSteps[4].status).toBe('pending');

      // PIX_PENDING: Etapas 1, 2, 3 e 4 concluídas, Etapa 5 em andamento
      const pendingSteps = stepsFor('PIX_PENDING');
      expect(pendingSteps[0].status).toBe('done');
      expect(pendingSteps[1].status).toBe('done');
      expect(pendingSteps[2].status).toBe('done');
      expect(pendingSteps[3].status).toBe('done');
      expect(pendingSteps[4].status).toBe('in_progress');

      // COMPLETED: Todas as 5 etapas concluídas
      const completedSteps = stepsFor('COMPLETED');
      expect(completedSteps.every((s) => s.status === 'done')).toBe(true);
    });

    it('maps domain statuses to visual result outcomes accurately', () => {
      expect(resultStateFor('COMPLETED')).toBe('confirmed');
      expect(resultStateFor('PIX_PENDING')).toBe('pending');
      expect(resultStateFor('REFUNDING')).toBe('refused');
      expect(resultStateFor('REFUNDED')).toBe('refused');
      expect(resultStateFor('FAILED')).toBe('refused');
      expect(resultStateFor('EXPIRED')).toBe('expired');
    });
  });
});
