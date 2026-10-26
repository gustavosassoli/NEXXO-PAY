/**
 * NEXO PAY - Tipos do Domínio de Pagamento (TypeScript puro, sem dependência do React)
 */

export type PaymentStatus =
  | 'CREATED'
  | 'QUOTED'
  | 'AWAITING_CRYPTO'
  | 'CRYPTO_CONFIRMED'
  | 'PAYING_PIX'
  | 'PIX_PENDING'
  | 'COMPLETED'
  | 'REFUNDING'
  | 'REFUNDED'
  | 'EXPIRED'
  | 'FAILED';

export type PaymentAsset = 'USDT' | 'USDC' | 'ETH';

export interface PaymentPixData {
  receiverName: string;
  receiverCity: string;
  txid: string;
  amountCents: number; // Centavos de BRL (ex.: R$ 128,40 = 12840)
  rawCode: string;
  amountFormatted?: string;
  receiverCompany?: string;
  cnpj?: string;
  institution?: string;
  description?: string;
}

export interface PaymentQuote {
  asset: PaymentAsset;
  brlCents: number;
  conversionFeeBrlCents: number;
  networkFeeBrlCents: number;
  serviceFeeBrlCents: number;
  totalFeesBrlCents: number;
  totalBrlCents: number;
  quoteString: string;
  // Valores em unidades mínimas de token (BigInt)
  convertedUnits: bigint;
  feesUnits: bigint;
  totalUnits: bigint;
  decimals: number;
  // Representações textuais pré-formatadas para exibição
  convertedTokenString: string;
  feesTokenString: string;
  totalTokenString: string;
  debitedString: string;
  quotedAt: number;
  expiresAt: number;
}

export interface PaymentHistoryEntry {
  status: PaymentStatus;
  at: number;
  reason?: string;
}

export interface PaymentReceipt {
  receiptDateTime: string;
  cryptoId: string;
  endToEndPix: string;
}

export interface Payment {
  id: string;
  status: PaymentStatus;
  pix: PaymentPixData;
  asset: PaymentAsset;
  quote: PaymentQuote;
  createdAt: number;
  updatedAt: number;
  history: PaymentHistoryEntry[];
  receipt?: PaymentReceipt;
}

export type TransitionResult =
  | { success: true; payment: Payment }
  | {
      success: false;
      error: string;
      currentStatus: PaymentStatus;
      targetStatus: PaymentStatus;
    };
