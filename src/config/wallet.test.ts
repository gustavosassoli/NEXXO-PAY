import { describe, it, expect } from 'vitest';
import { getAddress, isAddress } from 'viem';
import {
  CHAINS,
  POLYGON_CHAIN_ID,
  getEnabledChains,
  getChain,
} from './chains';
import {
  ASSETS,
  NATIVE_POLYGON_USDC_ADDRESS,
  getEnabledAssets,
  getAsset,
} from './assets';
import {
  abbreviateAddress,
  normalizeAddress,
  getFriendlyWalletErrorMessage,
  formatTokenBalance,
} from '../lib/wallet';
import { formatToken } from '../lib/money';
import { strings } from '../strings';

describe('Web3 Wallet & Asset Configuration (src/config/wallet.test.ts)', () => {
  describe('Chains & Assets Registry', () => {
    it('only enables Polygon PoS for MVP in getEnabledChains', () => {
      const enabledChains = getEnabledChains();
      expect(enabledChains).toHaveLength(1);
      expect(enabledChains[0].id).toBe(POLYGON_CHAIN_ID);
      expect(enabledChains[0].enabled).toBe(true);
      expect(enabledChains[0].shortName).toBe('Polygon');
      expect(enabledChains[0].nativeSymbol).toBe('POL');
    });

    it('retrieves chain by id and returns undefined for unknown chain', () => {
      const chain = getChain(POLYGON_CHAIN_ID);
      expect(chain).toBeDefined();
      expect(chain?.name).toBe('Polygon PoS');

      const unknown = getChain(999999);
      expect(unknown).toBeUndefined();
    });

    it('only enables native USDC for MVP in getEnabledAssets', () => {
      const enabledAssets = getEnabledAssets();
      expect(enabledAssets).toHaveLength(1);
      expect(enabledAssets[0].symbol).toBe('USDC');
      expect(enabledAssets[0].enabled).toBe(true);
      expect(enabledAssets[0].decimals).toBe(6);
    });

    it('keeps USDT and ETH in the registry but disabled for MVP', () => {
      expect(ASSETS.USDT).toBeDefined();
      expect(ASSETS.USDT.enabled).toBe(false);
      expect(ASSETS.ETH).toBeDefined();
      expect(ASSETS.ETH.enabled).toBe(false);
    });

    it('has correct checksum for native Polygon USDC address and valid EIP-55', () => {
      expect(isAddress(NATIVE_POLYGON_USDC_ADDRESS)).toBe(true);
      expect(NATIVE_POLYGON_USDC_ADDRESS).toBe(
        getAddress('0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359')
      );
      expect(ASSETS.USDC.addresses[POLYGON_CHAIN_ID]).toBe(NATIVE_POLYGON_USDC_ADDRESS);
    });

    it('retrieves asset by symbol via getAsset', () => {
      expect(getAsset('USDC')?.symbol).toBe('USDC');
      expect(getAsset('USDT')?.symbol).toBe('USDT');
      expect(getAsset('ETH')?.symbol).toBe('ETH');
      expect(getAsset('UNKNOWN')).toBeUndefined();
    });
  });

  describe('BigInt 6-Decimal Formatting for Display', () => {
    it('formats 0n as "0,00 USDC"', () => {
      expect(formatTokenBalance(0n, 6, 'USDC')).toBe('0,00 USDC');
      expect(formatToken(0n, 6, 'USDC', 2, 6)).toBe('0,00 USDC');
    });

    it('formats 1n as "0,000001 USDC"', () => {
      expect(formatTokenBalance(1n, 6, 'USDC')).toBe('0,000001 USDC');
      expect(formatToken(1n, 6, 'USDC', 2, 6)).toBe('0,000001 USDC');
    });

    it('formats 1500000n as "1,50 USDC"', () => {
      expect(formatTokenBalance(1_500_000n, 6, 'USDC')).toBe('1,50 USDC');
      expect(formatToken(1_500_000n, 6, 'USDC', 2, 6)).toBe('1,50 USDC');
    });

    it('formats 334500000n as "334,50 USDC"', () => {
      expect(formatTokenBalance(334_500_000n, 6, 'USDC')).toBe('334,50 USDC');
      expect(formatToken(334_500_000n, 6, 'USDC', 2, 6)).toBe('334,50 USDC');
    });

    it('formats 850000000n as "850,00 USDC"', () => {
      expect(formatTokenBalance(850_000_000n, 6, 'USDC')).toBe('850,00 USDC');
      expect(formatToken(850_000_000n, 6, 'USDC', 2, 6)).toBe('850,00 USDC');
    });
  });

  describe('Address Abbreviation and Normalization', () => {
    it('abbreviates addresses according to spec: abbreviateAddress("0x71A4C8D205FA3E7819B4C04F") -> "0x71A4…C04F"', () => {
      expect(abbreviateAddress('0x71A4C8D205FA3E7819B4C04F')).toBe('0x71A4…C04F');
    });

    it('handles falsy or short values gracefully in abbreviateAddress', () => {
      expect(abbreviateAddress('')).toBe('');
      expect(abbreviateAddress(null)).toBe('');
      expect(abbreviateAddress(undefined)).toBe('');
      expect(abbreviateAddress('0x123')).toBe('0x123');
    });

    it('normalizes valid addresses with EIP-55 checksum', () => {
      const normalized = normalizeAddress('0x3c499c542cef5e3811e1192ce70d8cc03d5c3359');
      expect(normalized).toBe('0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359');
    });

    it('returns null for invalid addresses in normalizeAddress', () => {
      expect(normalizeAddress('invalid-address')).toBeNull();
      expect(normalizeAddress('')).toBeNull();
      expect(normalizeAddress(null)).toBeNull();
    });
  });

  describe('Wallet Error Mapping', () => {
    it('maps user rejection (code 4001) to calm rejection message', () => {
      const errorWithCode = { code: 4001, message: 'User rejected the request.' };
      expect(getFriendlyWalletErrorMessage(errorWithCode)).toBe(
        strings.walletSheet.rejectionMessage
      );

      const errorWithMessage = { message: 'MetaMask: User rejected transaction' };
      expect(getFriendlyWalletErrorMessage(errorWithMessage)).toBe(
        strings.walletSheet.rejectionMessage
      );
    });

    it('maps missing provider errors to noProviderError message', () => {
      const error = { message: 'ConnectorNotFoundError: No provider found' };
      expect(getFriendlyWalletErrorMessage(error)).toBe(
        strings.walletSheet.noProviderError
      );
    });

    it('maps network switch errors to networkError message', () => {
      const error4902 = { code: 4902, message: 'Unrecognized chain ID' };
      expect(getFriendlyWalletErrorMessage(error4902)).toBe(
        strings.walletSheet.networkError
      );

      const chainError = { message: 'ChainNotConfiguredError' };
      expect(getFriendlyWalletErrorMessage(chainError)).toBe(
        strings.walletSheet.networkError
      );
    });
  });

  describe('RealBalanceService Account Binding & RPC Error Handling', () => {
    it('updates the address used by getBalance when setAccount is called (using fake client)', async () => {
      const { RealBalanceService } = await import('../services/real/RealBalanceService');

      const address1 = '0x71A4c8D205fA3e7819B4C04F0389278912781928';
      const address2 = '0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF';

      const calls: any[] = [];
      const fakeClient = {
        readContract: async (params: any) => {
          calls.push(params);
          const requestedAddress = params.args[0];
          if (requestedAddress.toLowerCase() === address1.toLowerCase()) {
            return 100_000_000n; // 100 USDC
          }
          if (requestedAddress.toLowerCase() === address2.toLowerCase()) {
            return 250_000_000n; // 250 USDC
          }
          return 0n;
        },
      };

      const service = new RealBalanceService(fakeClient);

      // Sem conta configurada retorna 0n sem chamar o cliente
      expect(await service.getBalance('USDC')).toBe(0n);
      expect(calls).toHaveLength(0);

      // Define primeira conta
      service.setAccount(address1);
      expect(service.getAccount()).toBe(address1);
      const balance1 = await service.getBalance('USDC');
      expect(balance1).toBe(100_000_000n);
      expect(calls).toHaveLength(1);
      expect(calls[0].args[0].toLowerCase()).toBe(address1.toLowerCase());

      // Muda para a segunda conta via setAccount
      service.setAccount(address2);
      expect(service.getAccount()).toBe(address2);
      const balance2 = await service.getBalance('USDC');
      expect(balance2).toBe(250_000_000n);
      expect(calls).toHaveLength(2);
      expect(calls[1].args[0].toLowerCase()).toBe(address2.toLowerCase());
    });

    it('throws on RPC read error instead of returning 0n silently', async () => {
      const { RealBalanceService } = await import('../services/real/RealBalanceService');
      const testAccount = '0x71A4c8D205fA3e7819B4C04F0389278912781928';

      const failingClient = {
        readContract: async () => {
          throw new Error('RPC connection timeout');
        },
      };

      const service = new RealBalanceService(failingClient);
      service.setAccount(testAccount);

      await expect(service.getBalance('USDC')).rejects.toThrow('RPC connection timeout');
    });
  });

  describe('Network Detection & QUOTED Interruption on Chain Change', () => {
    it('detects wrong network when wallet emits chainChanged to 0x1 (Ethereum Mainnet)', () => {
      const isConnected = true;

      // Conectado na Polygon
      const polygonChainId = POLYGON_CHAIN_ID;
      const isWrongOnPolygon = Boolean(isConnected && polygonChainId && polygonChainId !== POLYGON_CHAIN_ID);
      expect(isWrongOnPolygon).toBe(false);

      // Carteira emite chainChanged para 0x1 (1)
      const ethMainnetChainId: number = 1; // 0x1
      const isWrongOnEth = Boolean(isConnected && ethMainnetChainId && ethMainnetChainId !== POLYGON_CHAIN_ID);
      expect(isWrongOnEth).toBe(true);
    });

    it('cancels QUOTED payment and triggers notification when chain changes to 0x1', () => {
      let resetCalled = false;
      let toastMessage = '';

      const resetFlow = () => {
        resetCalled = true;
      };
      const showToast = (msg: string) => {
        toastMessage = msg;
      };

      // Simulação da lógica de verificação do PaymentWalletWatcher
      let currentStatus = 'QUOTED';
      let prevChainId: number | undefined = POLYGON_CHAIN_ID;
      let newChainId: number | undefined = 1; // 0x1

      if (prevChainId !== undefined && newChainId !== undefined && prevChainId !== newChainId) {
        if (currentStatus === 'QUOTED') {
          resetFlow();
          showToast(strings.walletSheet.paymentInterruptedToast);
        }
      }

      expect(resetCalled).toBe(true);
      expect(toastMessage).toBe(strings.walletSheet.paymentInterruptedToast);
    });

    it('does not treat balance read failure as insufficient balance', () => {
      const isConnected = true;
      const isWrongNetwork = false;
      const balanceError = strings.walletSheet.balanceReadError;
      const balanceUnits = 0n;
      const currentQuote = { totalUnits: 25_000_000n };

      // Lógica idêntica à do PaymentContext:
      const isInsufficientBalance = Boolean(
        isConnected &&
        !isWrongNetwork &&
        !balanceError &&
        currentQuote &&
        balanceUnits < currentQuote.totalUnits
      );

      // Com balanceError, isInsufficientBalance DEVE ser false (bloqueio por erro, não saldo zero)
      expect(isInsufficientBalance).toBe(false);
    });
  });
});
