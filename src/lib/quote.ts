/**
 * NEXO PAY - Motor de cotação e cálculo de taxas para pagamentos Pix com Cripto
 * Operações puramente aritméticas em inteiros (BRL em centavos) e BigInt (cripto em unidades mínimas).
 * Sem ponto flutuante, sem parseFloat, sem Math.round, sem toFixed.
 */

import { formatToken } from './money';

export type SupportedAsset = 'USDT' | 'USDC' | 'ETH';

export interface QuoteResult {
  asset: SupportedAsset;
  brlCents: number;
  // Taxas fixas em centavos BRL
  conversionFeeBrlCents: number;
  networkFeeBrlCents: number;
  serviceFeeBrlCents: number;
  totalFeesBrlCents: number;
  totalBrlCents: number;
  // Cotação
  quoteString: string;
  // Cripto em unidades mínimas (BigInt)
  convertedUnits: bigint;
  feesUnits: bigint;
  totalUnits: bigint;
  decimals: number;
  // Representações formatadas
  convertedTokenString: string;
  totalTokenString: string;
  feesTokenString: string;
  debitedString: string;
  // Saldo
  balanceUnits: bigint;
  balanceString: string;
  isInsufficientBalance: boolean;
  // Temporização (45s de reserva)
  quotedAt: number;
  expiresAt: number;
}

/**
 * Saldos mockados do usuário em unidades mínimas de cada token:
 * - USDT: 850,00 -> 850_000_000n (6 decimais)
 * - USDC: 334,50 -> 334_500_000n (6 decimais)
 * - ETH: 0,039 -> 39_000_000_000_000_000n (18 decimais)
 */
export const ASSET_BALANCES_UNITS: Record<
  SupportedAsset,
  { units: bigint; decimals: number; formatted: string }
> = {
  USDT: {
    units: 850_000_000n,
    decimals: 6,
    formatted: '850,00 USDT',
  },
  USDC: {
    units: 334_500_000n,
    decimals: 6,
    formatted: '334,50 USDC',
  },
  ETH: {
    units: 39_000_000_000_000_000n,
    decimals: 18,
    formatted: '0,039 ETH',
  },
};

/**
 * Taxas fixas do sistema em centavos de Real:
 * - Conversão: R$ 1,28 (128 centavos)
 * - Rede: R$ 0,42 (42 centavos)
 * - Serviço: R$ 0,80 (80 centavos)
 * - Total: R$ 2,50 (250 centavos)
 */
export const FIXED_FEES = {
  conversionFeeBrlCents: 128,
  networkFeeBrlCents: 42,
  serviceFeeBrlCents: 80,
  totalFeesBrlCents: 250,
} as const;

export const QUOTE_RESERVATION_DURATION_MS = 45_000;

/**
 * Calcula a cotação e taxas a partir do valor em centavos de Real (brlCents) e do ativo selecionado.
 * Retorna as quantias em BigInt na precisão nativa do token e as strings formatadas.
 */
export function calculateQuote(
  brlCents: number,
  asset: SupportedAsset,
  customBalanceUnits?: bigint,
  nowMs?: number
): QuoteResult {
  const { conversionFeeBrlCents, networkFeeBrlCents, serviceFeeBrlCents, totalFeesBrlCents } =
    FIXED_FEES;
  const totalBrlCents = brlCents + totalFeesBrlCents;

  const assetInfo = ASSET_BALANCES_UNITS[asset];
  const userBalanceUnits =
    customBalanceUnits !== undefined ? customBalanceUnits : assetInfo.units;
  const balanceString =
    customBalanceUnits !== undefined
      ? formatToken(
          userBalanceUnits,
          assetInfo.decimals,
          asset,
          asset === 'ETH' ? 3 : 2,
          asset === 'ETH' ? 5 : 3
        )
      : assetInfo.formatted;

  let quoteString = '';
  let convertedUnits = 0n;
  let totalUnits = 0n;
  let decimals = 6;
  let minFmt = 2;
  let maxFmt = 3;

  if (asset === 'USDT' || asset === 'USDC') {
    quoteString = `1 ${asset} = R$ 5,155`;
    decimals = 6;
    minFmt = 3;
    maxFmt = 3;

    // 1 token = 5,155 BRL = 515.5 cents = 5155 millicents.
    // brlCents em millicents = brlCents * 10n
    // Para obter 3 casas decimais de precisão de exibição:
    // displayUnits (milésimos de token) = (millicents * 1000n + halfRate) / rateMillicents
    // Em unidades mínimas de 6 decimais: displayUnits * 1000n
    const rateMillicents = 5155n;
    const halfRate = rateMillicents / 2n;

    const brlMillicentsConverted = BigInt(brlCents) * 10n;
    const convertedDisplay =
      (brlMillicentsConverted * 1000n + halfRate) / rateMillicents;
    convertedUnits = convertedDisplay * 1000n;

    const brlMillicentsTotal = BigInt(totalBrlCents) * 10n;
    const totalDisplay =
      (brlMillicentsTotal * 1000n + halfRate) / rateMillicents;
    totalUnits = totalDisplay * 1000n;
  } else {
    // ETH: 1 ETH = R$ 13.218,00 = 1.321.800 centavos
    quoteString = '1 ETH = R$ 13.218,00';
    decimals = 18;
    minFmt = 5;
    maxFmt = 5;

    const rateCents = 1321800n;
    const halfRate = rateCents / 2n;

    // 5 casas decimais de precisão (100000n)
    const brlCentsBig = BigInt(brlCents);
    const convertedDisplay =
      (brlCentsBig * 100000n + halfRate) / rateCents;
    // Em 18 decimais: display (5 decimais) * 10^13n
    convertedUnits = convertedDisplay * 10_000_000_000_000n;

    const totalBrlCentsBig = BigInt(totalBrlCents);
    const totalDisplay =
      (totalBrlCentsBig * 100000n + halfRate) / rateCents;
    totalUnits = totalDisplay * 10_000_000_000_000n;
  }

  const feesUnits = totalUnits - convertedUnits;

  const convertedTokenString = formatToken(convertedUnits, decimals, asset, minFmt, maxFmt);
  const totalTokenString = formatToken(totalUnits, decimals, asset, minFmt, maxFmt);
  const feesTokenString = formatToken(feesUnits, decimals, asset, minFmt, maxFmt);
  const debitedString = `${totalTokenString} debitados`;

  const isInsufficientBalance = totalUnits > userBalanceUnits;

  const currentTime = nowMs !== undefined ? nowMs : Date.now();
  const expiresAt = currentTime + QUOTE_RESERVATION_DURATION_MS;

  return {
    asset,
    brlCents,
    conversionFeeBrlCents,
    networkFeeBrlCents,
    serviceFeeBrlCents,
    totalFeesBrlCents,
    totalBrlCents,
    quoteString,
    convertedUnits,
    feesUnits,
    totalUnits,
    decimals,
    convertedTokenString,
    totalTokenString,
    feesTokenString,
    debitedString,
    balanceUnits: userBalanceUnits,
    balanceString,
    isInsufficientBalance,
    quotedAt: currentTime,
    expiresAt,
  };
}
