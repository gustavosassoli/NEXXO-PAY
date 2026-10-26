/**
 * NEXO PAY - Mapeamento de Etapas da Linha do Tempo e Estados de Resultado
 *
 * Desacopla a interface (ProcessingScreen e ResultScreen) das regras internas da máquina de estados.
 */

import { PaymentStatus } from './types';

export type StepState = 'done' | 'in_progress' | 'pending';

export interface TimelineStepItem {
  id: number;
  title: string;
  status: StepState;
}

export type ResultOutcome = 'confirmed' | 'pending' | 'refused' | 'expired';

export const TIMELINE_STEP_TITLES: readonly string[] = [
  'Verificando a cobrança Pix', // Etapa 1
  'Solicitando autorização da carteira', // Etapa 2
  'Processando a conversão', // Etapa 3
  'Enviando o pagamento Pix', // Etapa 4
  'Confirmando a liquidação', // Etapa 5
];

/**
 * Retorna o array de 5 etapas da linha do tempo com seus respectivos estados (done, in_progress, pending)
 * de acordo com o status atual do pagamento no domínio.
 */
export function stepsFor(status: PaymentStatus): TimelineStepItem[] {
  let activeStepId = 1;
  let allDone = false;

  switch (status) {
    case 'CREATED':
      activeStepId = 1;
      break;
    case 'QUOTED':
      activeStepId = 2;
      break;
    case 'AWAITING_CRYPTO':
      activeStepId = 2;
      break;
    case 'CRYPTO_CONFIRMED':
      activeStepId = 3;
      break;
    case 'PAYING_PIX':
      activeStepId = 4;
      break;
    case 'PIX_PENDING':
      activeStepId = 5;
      break;
    case 'COMPLETED':
      allDone = true;
      activeStepId = 6;
      break;
    case 'REFUNDING':
    case 'REFUNDED':
    case 'FAILED':
    case 'EXPIRED':
      activeStepId = 0; // Estado terminal não-sucesso
      break;
  }

  return TIMELINE_STEP_TITLES.map((title, index) => {
    const stepNumber = index + 1;
    let stepStatus: StepState = 'pending';

    if (allDone || stepNumber < activeStepId) {
      stepStatus = 'done';
    } else if (stepNumber === activeStepId) {
      stepStatus = 'in_progress';
    } else {
      stepStatus = 'pending';
    }

    return {
      id: stepNumber,
      title,
      status: stepStatus,
    };
  });
}

/**
 * Mapeia o status do domínio para o resultado visual da tela de Resultado:
 * - COMPLETED   → 'confirmed'
 * - PIX_PENDING → 'pending'
 * - FAILED      → 'refused'
 * - REFUNDED    → 'refused'
 * - REFUNDING   → 'refused'
 * - EXPIRED     → 'expired'
 */
export function resultStateFor(status: PaymentStatus): ResultOutcome {
  switch (status) {
    case 'COMPLETED':
      return 'confirmed';
    case 'PIX_PENDING':
      return 'pending';
    case 'REFUNDING':
    case 'REFUNDED':
    case 'FAILED':
      return 'refused';
    case 'EXPIRED':
      return 'expired';
    default:
      return 'pending';
  }
}
