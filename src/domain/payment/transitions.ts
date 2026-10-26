/**
 * NEXO PAY - Máquina de Estados e Transições de Pagamento (Puro TypeScript)
 */

import { Payment, PaymentStatus, TransitionResult } from './types';

/**
 * Tabela única de transições permitidas.
 * Estados finais: COMPLETED, REFUNDED, EXPIRED, FAILED (não possuem transições de saída).
 */
export const ALLOWED_TRANSITIONS: Readonly<Record<PaymentStatus, readonly PaymentStatus[]>> = {
  CREATED: ['QUOTED', 'FAILED'],
  QUOTED: ['AWAITING_CRYPTO', 'EXPIRED', 'FAILED'],
  AWAITING_CRYPTO: ['CRYPTO_CONFIRMED', 'EXPIRED', 'FAILED'],
  CRYPTO_CONFIRMED: ['PAYING_PIX', 'REFUNDING'],
  PAYING_PIX: ['COMPLETED', 'PIX_PENDING', 'REFUNDING'],
  PIX_PENDING: ['COMPLETED', 'REFUNDING'],
  REFUNDING: ['REFUNDED', 'FAILED'],
  COMPLETED: [],
  REFUNDED: [],
  EXPIRED: [],
  FAILED: [],
};

/**
 * Verifica se um estado é terminal/final.
 */
export function isFinalStatus(status: PaymentStatus): boolean {
  return ALLOWED_TRANSITIONS[status].length === 0;
}

/**
 * Verifica se uma transição é teoricamente permitida pela tabela.
 */
export function canTransition(from: PaymentStatus, to: PaymentStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/**
 * Função pura que executa uma transição de estado sobre uma instância de Payment.
 * Rejeita transições inválidas com erro tipado, sem lançar exceções.
 */
export function transition(
  payment: Payment,
  novoStatus: PaymentStatus,
  agora: number,
  reason?: string
): TransitionResult {
  const allowed = ALLOWED_TRANSITIONS[payment.status];

  if (!allowed.includes(novoStatus)) {
    return {
      success: false,
      error: `Transição inválida de ${payment.status} para ${novoStatus}.`,
      currentStatus: payment.status,
      targetStatus: novoStatus,
    };
  }

  const updatedPayment: Payment = {
    ...payment,
    status: novoStatus,
    updatedAt: agora,
    history: [
      ...payment.history,
      {
        status: novoStatus,
        at: agora,
        ...(reason ? { reason } : {}),
      },
    ],
  };

  return {
    success: true,
    payment: updatedPayment,
  };
}

/**
 * Resultado da tentativa de envio ou verificação do Pix junto ao PSP/Banco Central.
 */
export type PixAttemptOutcome =
  | 'success' // Pix liquidado com sucesso comprovado
  | 'failure_confirmed' // Falha confirmada e definitiva (ex.: chave inexistente, conta recebedora bloqueada)
  | 'uncertain_or_timeout'; // Resposta incerta, timeout de rede ou processamento assíncrono

/**
 * Regra de Segurança Crítica:
 * REFUNDING só é atingível após falha confirmada e definitiva do Pix.
 * Resposta incerta ou timeout do Pix leva OBRIGATORIAMENTE a PIX_PENDING, jamais a REFUNDING.
 *
 * Esta função garante essa invariante em nível de código antes de invocar a transição de estado.
 */
export function resolvePixAttempt(
  payment: Payment,
  outcome: PixAttemptOutcome,
  agora: number,
  reason?: string
): TransitionResult {
  switch (outcome) {
    case 'success':
      return transition(payment, 'COMPLETED', agora, reason || 'Pix liquidado com sucesso');

    case 'failure_confirmed':
      return transition(
        payment,
        'REFUNDING',
        agora,
        reason || 'Falha definitiva confirmada no Pix; iniciando estorno de cripto'
      );

    case 'uncertain_or_timeout':
      // SEGURANÇA: NUNCA transicionar para REFUNDING sob incerteza!
      // Caso contrário, o cliente receberia estorno e o recebedor Pix ainda poderia receber os fundos (duplo gasto).
      return transition(
        payment,
        'PIX_PENDING',
        agora,
        reason || 'Status Pix incerto ou timeout de rede; aguardando confirmação assíncrona'
      );
  }
}
