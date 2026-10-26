/**
 * NEXO PAY - Implementação Mock do BalanceService
 */

import { PaymentAsset } from '../../domain/payment/types';
import { ASSET_BALANCES_UNITS } from '../../lib/quote';
import { BalanceService } from '../types';

export class MockBalanceService implements BalanceService {
  async getBalance(asset: PaymentAsset): Promise<bigint> {
    const assetData = ASSET_BALANCES_UNITS[asset];
    return assetData ? assetData.units : 0n;
  }

  async hasSufficientBalance(amountUnits: bigint, asset: PaymentAsset): Promise<boolean> {
    const currentBalance = await this.getBalance(asset);
    return currentBalance >= amountUnits;
  }

  async formatBalance(asset: PaymentAsset): Promise<string> {
    const assetData = ASSET_BALANCES_UNITS[asset];
    return assetData ? assetData.formatted : `0,00 ${asset}`;
  }
}
