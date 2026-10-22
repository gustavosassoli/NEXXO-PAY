/**
 * NEXO PAY - Motor de cotação e cálculo de taxas para pagamentos Pix com Cripto
 * Realiza todas as operações em inteiros/BigInt para evitar imprecisões de ponto flutuante.
 */

export type SupportedAsset = 'USDT' | 'USDC' | 'ETH';

export interface QuoteResult {
  asset: SupportedAsset;
  brlAmount: number;
  brlCents: number;
  // Taxas fixas em centavos BRL
  conversionFeeBrlCents: number;
  networkFeeBrlCents: number;
  serviceFeeBrlCents: number;
  totalFeesBrlCents: number;
  totalBrlCents: number;
  // Cotação
  quoteString: string;
  // Cripto
  convertedTokenRaw: number;
  totalTokenRaw: number;
  feesTokenRaw: number;
  convertedTokenString: string;
  totalTokenString: string;
  feesTokenString: string;
  debitedString: string;
  // Saldo
  balanceString: string;
  balanceRaw: number;
  isInsufficientBalance: boolean;
}

// Saldos do usuário no protótipo
export const ASSET_BALANCES: Record<SupportedAsset, { raw: number; formatted: string }> = {
  USDT: { raw: 850.0, formatted: '850,00 USDT' },
  USDC: { raw: 334.5, formatted: '334,50 USDC' },
  ETH: { raw: 0.039, formatted: '0,039 ETH' },
};

// Taxas fixas em BRL centavos
export const FIXED_FEES = {
  conversionFeeBrlCents: 128, // R$ 1,28
  networkFeeBrlCents: 42, // R$ 0,42
  serviceFeeBrlCents: 80, // R$ 0,80
  totalFeesBrlCents: 250, // R$ 2,50
};

/**
 * Formata número com decimais fixos e separador decimal ','
 */
function formatTokenUnits(units: bigint, decimals: number): string {
  const scale = 10n ** BigInt(decimals);
  const intPart = units / scale;
  const fracPart = units % scale;
  const fracStr = fracPart.toString().padStart(decimals, '0');
  return `${intPart},${fracStr}`;
}

/**
 * Calcula a cotação e taxas a partir do valor em Reais e do ativo selecionado
 */
export function calculateQuote(
  brlAmount: number,
  asset: SupportedAsset,
  customBalance?: number
): QuoteResult {
  // Converte o valor em reais (ex: 128.40) para centavos inteiros (12840)
  const brlCents = Math.round(brlAmount * 100);

  const { conversionFeeBrlCents, networkFeeBrlCents, serviceFeeBrlCents, totalFeesBrlCents } =
    FIXED_FEES;
  const totalBrlCents = brlCents + totalFeesBrlCents;

  const userBalance =
    customBalance !== undefined ? customBalance : ASSET_BALANCES[asset].raw;
  const balanceString =
    customBalance !== undefined
      ? `${customBalance.toString().replace('.', ',')} ${asset}`
      : ASSET_BALANCES[asset].formatted;

  let quoteString = '';
  let convertedUnits = 0n;
  let totalUnits = 0n;
  let decimals = 3;
  let divisorScale = 1000;

  if (asset === 'USDT' || asset === 'USDC') {
    quoteString = `1 ${asset} = R$ 5,155`;
    decimals = 3;
    divisorScale = 1000;

    // 1 token = 5,155 BRL = 515.5 cents = 5155 millicents.
    // brlCents em millicents = brlCents * 10n
    const rateMillicents = 5155n;
    const halfRate = rateMillicents / 2n;

    const brlMillicentsConverted = BigInt(brlCents) * 10n;
    convertedUnits = (brlMillicentsConverted * 1000n + halfRate) / rateMillicents;

    const brlMillicentsTotal = BigInt(totalBrlCents) * 10n;
    totalUnits = (brlMillicentsTotal * 1000n + halfRate) / rateMillicents;
  } else {
    // ETH: 1 ETH = R$ 13.218,00 = 1.321.800 centavos
    quoteString = '1 ETH = R$ 13.218,00';
    decimals = 5;
    divisorScale = 100000;

    const rateCents = 1321800n;
    const halfRate = rateCents / 2n;

    const brlCentsBig = BigInt(brlCents);
    convertedUnits = (brlCentsBig * 100000n + halfRate) / rateCents;

    const totalBrlCentsBig = BigInt(totalBrlCents);
    totalUnits = (totalBrlCentsBig * 100000n + halfRate) / rateCents;
  }

  const feesUnits = totalUnits - convertedUnits;

  const convertedTokenString = `${formatTokenUnits(convertedUnits, decimals)} ${asset}`;
  const totalTokenString = `${formatTokenUnits(totalUnits, decimals)} ${asset}`;
  const feesTokenString = `${formatTokenUnits(feesUnits, decimals)} ${asset}`;
  const debitedString = `${totalTokenString} debitados`;

  const totalTokenRaw = Number(totalUnits) / divisorScale;
  const convertedTokenRaw = Number(convertedUnits) / divisorScale;
  const feesTokenRaw = Number(feesUnits) / divisorScale;

  const isInsufficientBalance = totalTokenRaw > userBalance;

  return {
    asset,
    brlAmount: brlCents / 100,
    brlCents,
    conversionFeeBrlCents,
    networkFeeBrlCents,
    serviceFeeBrlCents,
    totalFeesBrlCents,
    totalBrlCents,
    quoteString,
    convertedTokenRaw,
    totalTokenRaw,
    feesTokenRaw,
    convertedTokenString,
    totalTokenString,
    feesTokenString,
    debitedString,
    balanceString,
    balanceRaw: userBalance,
    isInsufficientBalance,
  };
}
