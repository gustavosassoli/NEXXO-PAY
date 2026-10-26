/**
 * NEXO PAY - Implementação Mock do QuoteService com Cache de 45 Segundos
 */

import { PaymentAsset, PaymentQuote } from '../../domain/payment/types';
import { calculateQuote, SupportedAsset } from '../../lib/quote';
import { QuoteService } from '../types';

export class MockQuoteService implements QuoteService {
  private cache = new Map<string, PaymentQuote>();

  private getCacheKey(amountCents: number, asset: PaymentAsset): string {
    return `${amountCents}_${asset}`;
  }

  async getQuote(
    amountCents: number,
    asset: PaymentAsset,
    now?: () => number
  ): Promise<PaymentQuote> {
    const key = this.getCacheKey(amountCents, asset);
    const clock = now ? now() : Date.now();

    const cached = this.cache.get(key);
    if (cached && clock < cached.expiresAt) {
      return cached;
    }

    const calculated = calculateQuote(
      amountCents,
      asset as SupportedAsset,
      undefined,
      clock
    );

    const quote: PaymentQuote = {
      asset: calculated.asset,
      brlCents: calculated.brlCents,
      conversionFeeBrlCents: calculated.conversionFeeBrlCents,
      networkFeeBrlCents: calculated.networkFeeBrlCents,
      serviceFeeBrlCents: calculated.serviceFeeBrlCents,
      totalFeesBrlCents: calculated.totalFeesBrlCents,
      totalBrlCents: calculated.totalBrlCents,
      quoteString: calculated.quoteString,
      convertedUnits: calculated.convertedUnits,
      feesUnits: calculated.feesUnits,
      totalUnits: calculated.totalUnits,
      decimals: calculated.decimals,
      convertedTokenString: calculated.convertedTokenString,
      feesTokenString: calculated.feesTokenString,
      totalTokenString: calculated.totalTokenString,
      debitedString: calculated.debitedString,
      quotedAt: calculated.quotedAt,
      expiresAt: calculated.expiresAt,
    };

    this.cache.set(key, quote);
    return quote;
  }

  invalidate(amountCents: number, asset: PaymentAsset): void {
    const key = this.getCacheKey(amountCents, asset);
    this.cache.delete(key);
  }

  clearCache(): void {
    this.cache.clear();
  }
}
