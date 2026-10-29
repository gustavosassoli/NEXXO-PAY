/**
 * NEXO PAY - Utilitários de Carteira Web3
 */

import { getAddress, isAddress } from 'viem';
import { strings } from '../strings';
import { formatToken } from './money';

/**
 * Formata um valor BigInt de token ERC-20 com casas decimais (padrão 6 para USDC)
 * Exemplos:
 *   0n -> "0,00 USDC"
 *   1n -> "0,000001 USDC"
 *   1500000n -> "1,50 USDC"
 *   334500000n -> "334,50 USDC"
 *   850000000n -> "850,00 USDC"
 */
export function formatTokenBalance(
  amount: bigint,
  decimals = 6,
  symbol = 'USDC'
): string {
  return formatToken(amount, decimals, symbol, 2, decimals);
}

/**
 * Abrevia um endereço Ethereum/Polygon no formato: 0x71A4…C8D2
 */
export function abbreviateAddress(
  address?: string | null,
  startChars = 6,
  endChars = 4
): string {
  if (!address) return '';
  const trimmed = address.trim();
  if (trimmed.length < startChars + endChars) return trimmed;
  return `${trimmed.slice(0, startChars)}…${trimmed.slice(-endChars)}`;
}

/**
 * Valida e formata endereço com checksum EIP-55 via viem.
 * Retorna null se for inválido.
 */
export function normalizeAddress(address?: string | null): string | null {
  if (!address || typeof address !== 'string') return null;
  const trimmed = address.trim();
  if (!isAddress(trimmed)) return null;
  try {
    return getAddress(trimmed);
  } catch {
    return null;
  }
}

/**
 * Mapeia erros de provedores de carteira para mensagens amigáveis e calmas.
 * Código 4001 (rejeição do usuário na MetaMask / WalletConnect) recebe mensagem amigável sem tom de erro crítico.
 */
export function getFriendlyWalletErrorMessage(error: unknown): string {
  if (!error) return strings.walletSheet.rejectionMessage;

  const errObj = error as any;
  const message = String(errObj?.message || '');
  const code = errObj?.code ?? errObj?.cause?.code;

  if (
    code === 4001 ||
    code === 'ACTION_REJECTED' ||
    message.includes('User rejected') ||
    message.includes('user rejected') ||
    message.includes('User denied')
  ) {
    return strings.walletSheet.rejectionMessage;
  }

  if (message.includes('ChainNotConfiguredError') || code === 4902) {
    return strings.walletSheet.networkError;
  }

  if (message.includes('ConnectorNotFoundError') || message.includes('No provider')) {
    return strings.walletSheet.noProviderError;
  }

  return strings.walletSheet.rejectionMessage;
}
