/**
 * NEXO PAY - Utilitários de formatação e manipulação financeira.
 *
 * Regras:
 * - Valores em reais e dólares armazenados em centavos (números inteiros).
 * - Valores em tokens cripto armazenados em bigint com a escala de casas decimais do token.
 * - Formatação pura em pt-BR sem ponto flutuante para preservar precisão.
 */

/**
 * Formata um valor em centavos de Real para a representação pt-BR:
 * Ex: 662260 -> "R$ 6.622,60"
 * Ex: 12840 -> "R$ 128,40"
 */
export function formatBrl(cents: number, includePrefix = true): string {
  const isNegative = cents < 0;
  const absCents = Math.abs(cents);
  const integerPart = Math.floor(absCents / 100);
  const fractionalPart = (absCents % 100).toString().padStart(2, '0');

  // Formata a parte inteira com separadores de milhar pt-BR (ponto)
  const integerFormatted = integerPart
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  const formatted = `${integerFormatted},${fractionalPart}`;
  const prefix = includePrefix ? 'R$ ' : '';
  return isNegative ? `-${prefix}${formatted}` : `${prefix}${formatted}`;
}

/**
 * Formata um valor em centavos de Dólar para a representação pt-BR:
 * Ex: 128450 -> "US$ 1.284,50"
 * Ex: 85000 -> "US$ 850,00"
 */
export function formatUsd(cents: number, includePrefix = true): string {
  const isNegative = cents < 0;
  const absCents = Math.abs(cents);
  const integerPart = Math.floor(absCents / 100);
  const fractionalPart = (absCents % 100).toString().padStart(2, '0');

  const integerFormatted = integerPart
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  const formatted = `${integerFormatted},${fractionalPart}`;
  const prefix = includePrefix ? 'US$ ' : '';
  return isNegative ? `-${prefix}${formatted}` : `${prefix}${formatted}`;
}

/**
 * Formata um montante de token em bigint para representação com vírgula decimal e símbolo:
 * Ex: formatToken(850000000n, 6, 'USDT') -> "850,00 USDT"
 * Ex: formatToken(25393000n, 6, 'USDT') -> "25,393 USDT"
 * Ex: formatToken(39000000000000000n, 18, 'ETH') -> "0,039 ETH"
 */
export function formatToken(
  amount: bigint,
  decimals: number,
  symbol?: string,
  minDecimals = 2,
  maxDecimals = decimals
): string {
  const isNegative = amount < 0n;
  const absAmount = isNegative ? -amount : amount;

  const divisor = 10n ** BigInt(decimals);
  const integerPart = absAmount / divisor;
  const remainder = absAmount % divisor;

  // Converte a fração para string com padding
  const fracStrFull = remainder.toString().padStart(decimals, '0');
  // Pega até maxDecimals
  let fracTrimmed = fracStrFull.slice(0, maxDecimals);

  // Garante pelo menos minDecimals
  while (fracTrimmed.length < minDecimals) {
    fracTrimmed += '0';
  }

  // Remove zeros extras além de minDecimals
  while (fracTrimmed.length > minDecimals && fracTrimmed.endsWith('0')) {
    fracTrimmed = fracTrimmed.slice(0, -1);
  }

  const integerFormatted = integerPart
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  const numberStr = `${integerFormatted},${fracTrimmed}`;
  const sign = isNegative ? '-' : '';

  if (symbol) {
    return `${sign}${numberStr} ${symbol}`;
  }
  return `${sign}${numberStr}`;
}
