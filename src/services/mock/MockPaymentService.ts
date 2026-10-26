/**
 * NEXO PAY - Implementação Mock do PaymentService com Idempotência e Notificações em Tempo Real
 */

import { Payment, PaymentAsset, PaymentPixData } from '../../domain/payment/types';
import { transition } from '../../domain/payment/transitions';
import { PaymentListener, PaymentService, QuoteService } from '../types';

function generateRandomReceipt(clock: number) {
  const dateObj = new Date(clock);
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const day = dateObj.getDate();
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  const receiptDateTime = `${day} ${month} ${year}, ${hours}:${minutes}`;

  const randomHex = Math.random().toString(16).substring(2, 6).toUpperCase();
  const cryptoId = `0x8F2A...${randomHex}`;
  const endToEndPix = `E${Math.random().toString(36).substring(2, 5).toUpperCase()}...4X9P`;

  return { receiptDateTime, cryptoId, endToEndPix };
}

export class MockPaymentService implements PaymentService {
  private payments = new Map<string, Payment>();
  private idempotencyKeyMap = new Map<string, string>(); // idempotencyKey -> paymentId
  private listeners = new Map<string, Set<PaymentListener>>();
  private timeouts = new Map<string, NodeJS.Timeout[]>();

  constructor(private quoteService: QuoteService) {}

  private getIdempotencyKey(pixData: PaymentPixData): string {
    if (pixData.txid && pixData.txid.trim().length > 0) {
      return `txid:${pixData.txid.trim()}`;
    }
    return `raw:${pixData.rawCode.trim()}`;
  }

  private notify(payment: Payment) {
    const subs = this.listeners.get(payment.id);
    if (subs) {
      subs.forEach((cb) => {
        try {
          cb(payment);
        } catch (e) {
          console.error('[MockPaymentService] Erro ao notificar assinante:', e);
        }
      });
    }
  }

  async create(
    pixData: PaymentPixData,
    asset: PaymentAsset,
    now?: () => number
  ): Promise<Payment> {
    const clock = now ? now() : Date.now();
    const idemKey = this.getIdempotencyKey(pixData);

    const existingId = this.idempotencyKeyMap.get(idemKey);
    if (existingId) {
      const existingPayment = this.payments.get(existingId);
      if (existingPayment) {
        return existingPayment;
      }
    }

    const quote = await this.quoteService.getQuote(pixData.amountCents, asset, now);
    const id = `pay_${clock.toString(36)}_${Math.random().toString(36).substring(2, 7)}`;

    const newPayment: Payment = {
      id,
      status: 'QUOTED',
      pix: pixData,
      asset,
      quote,
      createdAt: clock,
      updatedAt: clock,
      history: [
        { status: 'CREATED', at: clock, reason: 'Ordem criada a partir da leitura do BR Code' },
        { status: 'QUOTED', at: clock, reason: 'Cotação reservada por 45 segundos' },
      ],
    };

    this.payments.set(id, newPayment);
    this.idempotencyKeyMap.set(idemKey, id);
    return newPayment;
  }

  async confirm(paymentId: string, now?: () => number): Promise<Payment> {
    const clock = now ? now() : Date.now();
    const payment = this.payments.get(paymentId);
    if (!payment) {
      throw new Error(`Pagamento ${paymentId} não encontrado.`);
    }

    // Idempotência: se já foi confirmado ou está em andamento, retorna o estado atual sem duplicar
    if (payment.status !== 'QUOTED') {
      return payment;
    }

    // Transição 1: QUOTED -> AWAITING_CRYPTO
    const step1 = transition(payment, 'AWAITING_CRYPTO', clock, 'Iniciada confirmação pelo usuário');
    if (!step1.success) {
      throw new Error(step1.error);
    }

    let current = step1.payment;
    this.payments.set(paymentId, current);
    this.notify(current);

    // Simula a evolução temporal das etapas assíncronas (W6 Mock)
    const timers: NodeJS.Timeout[] = [];

    // Etapa 3: CRYPTO_CONFIRMED após 900ms
    const t1 = setTimeout(() => {
      const p = this.payments.get(paymentId);
      if (!p || p.status !== 'AWAITING_CRYPTO') return;

      const res = transition(p, 'CRYPTO_CONFIRMED', Date.now(), 'Débito cripto confirmado na rede');
      if (res.success) {
        this.payments.set(paymentId, res.payment);
        this.notify(res.payment);
      }
    }, 900);
    timers.push(t1);

    // Etapa 4: PAYING_PIX após 1900ms
    const t2 = setTimeout(() => {
      const p = this.payments.get(paymentId);
      if (!p || p.status !== 'CRYPTO_CONFIRMED') return;

      const res = transition(p, 'PAYING_PIX', Date.now(), 'Ordem de liquidação Pix submetida ao arranjo');
      if (res.success) {
        this.payments.set(paymentId, res.payment);
        this.notify(res.payment);
      }
    }, 1900);
    timers.push(t2);

    // Etapa 5: COMPLETED após 3000ms
    const t3 = setTimeout(() => {
      const p = this.payments.get(paymentId);
      if (!p || p.status !== 'PAYING_PIX') return;

      const res = transition(p, 'COMPLETED', Date.now(), 'Pix liquidado com sucesso');
      if (res.success) {
        const completedWithReceipt: Payment = {
          ...res.payment,
          receipt: generateRandomReceipt(Date.now()),
        };
        this.payments.set(paymentId, completedWithReceipt);
        this.notify(completedWithReceipt);
      }
    }, 3000);
    timers.push(t3);

    this.timeouts.set(paymentId, timers);
    return current;
  }

  async get(paymentId: string): Promise<Payment | undefined> {
    return this.payments.get(paymentId);
  }

  subscribe(paymentId: string, listener: PaymentListener): () => void {
    if (!this.listeners.has(paymentId)) {
      this.listeners.set(paymentId, new Set());
    }
    const set = this.listeners.get(paymentId)!;
    set.add(listener);

    // Dispara imediatamente o estado atual caso já exista
    const current = this.payments.get(paymentId);
    if (current) {
      try {
        listener(current);
      } catch (e) {
        console.error('[MockPaymentService] Erro na notificação inicial:', e);
      }
    }

    return () => {
      set.delete(listener);
      if (set.size === 0) {
        this.listeners.delete(paymentId);
      }
    };
  }

  reset(): void {
    this.timeouts.forEach((timers) => {
      timers.forEach((t) => clearTimeout(t));
    });
    this.timeouts.clear();
    this.payments.clear();
    this.idempotencyKeyMap.clear();
    this.listeners.clear();
  }
}
