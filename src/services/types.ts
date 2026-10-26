/**
 * NEXO PAY - Interfaces dos Serviços de Pagamento (Arquitetura Desacoplada)
 */

import { Payment, PaymentAsset, PaymentPixData, PaymentQuote } from '../domain/payment/types';

export interface QuoteService {
  /**
   * Obtém cotação com cache e tempo de expiração de 45 segundos.
   * Suporta injeção de função de relógio now() para testes determinísticos.
   */
  getQuote(
    amountCents: number,
    asset: PaymentAsset,
    now?: () => number
  ): Promise<PaymentQuote>;

  /**
   * Força invalidação do cache de uma cotação específica.
   */
  invalidate(amountCents: number, asset: PaymentAsset): void;

  /**
   * Limpa todo o cache de cotações em memória.
   */
  clearCache(): void;
}

export interface BalanceService {
  /**
   * Retorna o saldo disponível do ativo em unidades mínimas (BigInt).
   */
  getBalance(asset: PaymentAsset): Promise<bigint>;

  /**
   * Verifica se o saldo é suficiente para cobrir as unidades requeridas.
   */
  hasSufficientBalance(amountUnits: bigint, asset: PaymentAsset): Promise<boolean>;

  /**
   * Retorna a representação formatada do saldo (ex.: "850,00 USDT").
   */
  formatBalance(asset: PaymentAsset): Promise<string>;
}

export type PaymentListener = (payment: Payment) => void;

export interface PaymentService {
  /**
   * Cria ou recupera um pagamento existente de forma idempotente por txid/rawCode.
   */
  create(
    pixData: PaymentPixData,
    asset: PaymentAsset,
    now?: () => number
  ): Promise<Payment>;

  /**
   * Confirma a execução do pagamento de forma idempotente.
   * Chamadas repetidas retornam a mesma promessa/instância sem reiniciar nem duplicar.
   */
  confirm(paymentId: string, now?: () => number): Promise<Payment>;

  /**
   * Busca um pagamento pelo ID.
   */
  get(paymentId: string): Promise<Payment | undefined>;

  /**
   * Assina atualizações de estado em tempo real para alimentar a linha do tempo.
   * Retorna uma função de cancelamento (unsubscribe).
   */
  subscribe(paymentId: string, listener: PaymentListener): () => void;

  /**
   * Limpa o repositório em memória (útil para testes unitários ou reset total).
   */
  reset(): void;
}

export interface ServicesContainer {
  quoteService: QuoteService;
  balanceService: BalanceService;
  paymentService: PaymentService;
}
