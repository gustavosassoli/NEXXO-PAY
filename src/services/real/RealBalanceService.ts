/**
 * NEXO PAY - Serviço de Leitura de Saldo Real On-Chain (Polygon PoS)
 *
 * Somente leitura: lê balanceOf do token ERC-20 na Polygon via viem/RPC.
 * Nenhum método de escrita, assinatura ou aprovação é exposto.
 */

import { createPublicClient, http, getAddress, parseAbi } from 'viem';
import { PaymentAsset } from '../../domain/payment/types';
import { BalanceService } from '../types';
import { getEnabledChains, POLYGON_CHAIN_ID } from '../../config/chains';
import { getAsset } from '../../config/assets';
import { formatToken } from '../../lib/money';

const erc20BalanceOfAbi = parseAbi([
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
]);

export class RealBalanceService implements BalanceService {
  private client: ReturnType<typeof createPublicClient> | null = null;
  private currentAccount?: string;
  private cachedBalances = new Map<string, bigint>();

  constructor(getAccount?: () => string | undefined) {
    if (getAccount) {
      this.getAccount = getAccount;
    }
  }

  public getAccount: () => string | undefined = () => this.currentAccount;

  public setAccount(account?: string) {
    this.currentAccount = account;
  }

  private getPublicClient() {
    if (!this.client) {
      const polygonChain =
        getEnabledChains().find((c) => c.id === POLYGON_CHAIN_ID) || getEnabledChains()[0];
      this.client = createPublicClient({
        transport: http(polygonChain.rpcUrl),
      });
    }
    return this.client;
  }

  async getBalance(asset: PaymentAsset): Promise<bigint> {
    const account = this.getAccount();
    if (!account) {
      return 0n;
    }

    const assetConfig = getAsset(asset);
    if (!assetConfig || !assetConfig.enabled) {
      return 0n;
    }

    const chain =
      getEnabledChains().find((c) => c.id === POLYGON_CHAIN_ID) || getEnabledChains()[0];
    const contractAddress = assetConfig.addresses[chain.id];
    if (!contractAddress) {
      return 0n;
    }

    try {
      const client = this.getPublicClient();
      const rawBalance = await client.readContract({
        address: contractAddress as `0x${string}`,
        abi: erc20BalanceOfAbi,
        functionName: 'balanceOf',
        args: [getAddress(account)],
      });

      const balanceBigInt = BigInt(rawBalance.toString());
      this.cachedBalances.set(`${account}_${asset}`, balanceBigInt);
      return balanceBigInt;
    } catch (err) {
      console.warn('[RealBalanceService] Erro de leitura on-chain (RPC):', err);
      return this.cachedBalances.get(`${account}_${asset}`) || 0n;
    }
  }

  async hasSufficientBalance(amountUnits: bigint, asset: PaymentAsset): Promise<boolean> {
    const current = await this.getBalance(asset);
    return current >= amountUnits;
  }

  async formatBalance(asset: PaymentAsset): Promise<string> {
    const balance = await this.getBalance(asset);
    const assetConfig = getAsset(asset);
    const decimals = assetConfig?.decimals ?? 6;
    return formatToken(balance, decimals, asset, 2, 6);
  }
}
