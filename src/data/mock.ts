/**
 * NEXO PAY - Dados de exemplo (Ambiente Demonstrativo).
 *
 * Valores monetários:
 * - Reais e dólares em inteiros de centavos.
 * - Criptoativos em bigint com escala decimal do token.
 */

import { IconName } from '../components/icons';

export interface CryptoAsset {
  code: 'USDT' | 'USDC' | 'ETH';
  name: string;
  initial: string;
  decimals: number;
  amount: bigint;
  usdCents: number;
  brlCents: number;
  colorScheme: 'usdt' | 'usdc' | 'eth';
  quoteBrl: number; // e.g. 5155 means R$ 5,155
}

export type ActivityTone = 'outgoing' | 'incoming' | 'conversion';

export interface Activity {
  id: string;
  icon: IconName;
  title: string;
  subtitle: string;
  detail: string;
  date: string;
  isNegative?: boolean;
  brlCents?: number;
  usdCents?: number;
  tokenAmount: bigint;
  tokenDecimals: number;
  tokenSymbol: string;
  type: ActivityTone;
  category: 'today' | 'previous';
  status: 'confirmed' | 'pending' | 'refused' | 'expired';
  receiver?: string;
  cnpj?: string;
  institution?: string;
  description?: string;
  operationId?: string;
  cryptoRef?: string;
  pixConfirmation?: string;
}

export interface UserProfile {
  name: string;
  greetingName: string;
  email: string;
  initials: string;
  isDemo: boolean;
}

export const mockUser: UserProfile = {
  name: 'Gustavo Martins',
  greetingName: 'Gustavo',
  email: 'gustavo@exemplo.com',
  initials: 'GM',
  isDemo: true,
};

export const mockBalances = {
  totalUsdCents: 128450, // US$ 1.284,50
  estimatedBrlCents: 662260, // R$ 6.622,60
  todayChangePercent: '+1,8% hoje',
};

export const mockAssets: CryptoAsset[] = [
  {
    code: 'USDT',
    name: 'Tether',
    initial: 'U',
    decimals: 6,
    amount: 850_000_000n, // 850,00 USDT
    usdCents: 85000,
    brlCents: 438175, // R$ 4.381,75
    colorScheme: 'usdt',
    quoteBrl: 5155, // R$ 5,155
  },
  {
    code: 'USDC',
    name: 'USD Coin',
    initial: 'U',
    decimals: 6,
    amount: 334_500_000n, // 334,50 USDC
    usdCents: 33450,
    brlCents: 172486, // R$ 1.724,86
    colorScheme: 'usdc',
    quoteBrl: 5155,
  },
  {
    code: 'ETH',
    name: 'Ethereum',
    initial: 'E',
    decimals: 18,
    amount: 39_000_000_000_000_000n, // 0,039 ETH
    usdCents: 10000,
    brlCents: 51550, // R$ 515,50
    colorScheme: 'eth',
    quoteBrl: 1321800, // R$ 13.218,00
  },
];

export function getAssets(): CryptoAsset[] {
  return mockAssets;
}

export function getAsset(code: string): CryptoAsset | undefined {
  const upper = code.toUpperCase();
  return mockAssets.find((a) => a.code === upper);
}

export interface ActivityDetailField {
  label: string;
  value: string;
}

export interface ActivityIdentifier {
  label: string;
  value: string;
}

export interface Activity {
  id: string;
  icon: IconName;
  title: string;
  subtitle: string;
  detail: string;
  date: string;
  isNegative?: boolean;
  brlCents?: number;
  usdCents?: number;
  tokenAmount: bigint;
  tokenDecimals: number;
  tokenSymbol: string;
  type: ActivityTone;
  category: 'today' | 'previous';
  status: 'confirmed' | 'pending' | 'refused' | 'expired';
  detailSubtitle?: string;
  detailDisplayAmount?: string;
  detailFields?: ActivityDetailField[];
  identifiers?: ActivityIdentifier[];
  receiver?: string;
  cnpj?: string;
  institution?: string;
  description?: string;
  operationId?: string;
  cryptoRef?: string;
  pixConfirmation?: string;
}

export const mockActivities: Activity[] = [
  {
    id: 'act-1',
    icon: 'store',
    title: 'Mercado Vila Nova',
    subtitle: 'Pagamento Pix · Hoje, 10:42',
    detail: 'Pagamento Pix',
    date: 'Hoje, 10:42',
    isNegative: true,
    brlCents: 12840, // - R$ 128,40
    tokenAmount: 24_920_000n, // - 24,92 USDT na lista
    tokenDecimals: 6,
    tokenSymbol: 'USDT',
    type: 'outgoing',
    category: 'today',
    status: 'confirmed',
    detailSubtitle: 'Pagamento Pix',
    detailDisplayAmount: '− R$ 128,40',
    detailFields: [
      { label: 'Recebedor', value: 'Mercado Vila Nova' },
      { label: 'Data', value: 'Hoje, 10:42' },
      { label: 'Ativo utilizado', value: 'USDT' },
      { label: 'Quantidade', value: '25,393 USDT' },
      { label: 'Cotação', value: 'R$ 5,155' },
      { label: 'Taxas totais', value: '0,485 USDT' },
    ],
    identifiers: [
      { label: 'ID da operação', value: 'NXP-2025-0618-1842' },
      { label: 'Referência cripto', value: '0x8F2A...91C4' },
      { label: 'Confirmação Pix', value: 'E000...4X9P' },
    ],
    receiver: 'Mercado Vila Nova',
    cnpj: '12.***.***/0001-45',
    institution: 'Banco Parceiro S.A.',
    description: 'Compra balcão 1842',
    operationId: 'NXP-2025-0618-1842',
    cryptoRef: '0x8F2A...91C4',
    pixConfirmation: 'E000...4X9P',
  },
  {
    id: 'act-2',
    icon: 'restaurant',
    title: 'Restaurante Moma',
    subtitle: 'Pagamento Pix · Ontem, 20:16',
    detail: 'Pagamento Pix',
    date: 'Ontem, 20:16',
    isNegative: true,
    brlCents: 8600, // - R$ 86,00
    tokenAmount: 16_700_000n, // - 16,70 USDC
    tokenDecimals: 6,
    tokenSymbol: 'USDC',
    type: 'outgoing',
    category: 'previous',
    status: 'confirmed',
    detailSubtitle: 'Pagamento Pix',
    detailDisplayAmount: '− R$ 86,00',
    detailFields: [
      { label: 'Recebedor', value: 'Restaurante Moma' },
      { label: 'Data', value: 'Ontem, 20:16' },
      { label: 'Ativo utilizado', value: 'USDC' },
      { label: 'Quantidade', value: '16,70 USDC' },
      { label: 'Cotação', value: 'R$ 5,155' },
      { label: 'Taxas totais', value: '0,320 USDC' },
    ],
    identifiers: [
      { label: 'ID da operação', value: 'NXP-2025-0617-2016' },
      { label: 'Referência cripto', value: '0x4C7D...82E1' },
      { label: 'Confirmação Pix', value: 'E000...9K2M' },
    ],
    receiver: 'Restaurante Moma',
  },
  {
    id: 'act-3',
    icon: 'arrowDown',
    title: 'Recebimento',
    subtitle: 'Carteira externa · 12 Jun, 14:08',
    detail: 'Carteira externa',
    date: '12 Jun, 14:08',
    isNegative: false,
    usdCents: 25000, // + US$ 250,00
    tokenAmount: 250_000_000n, // + 250,00 USDT
    tokenDecimals: 6,
    tokenSymbol: 'USDT',
    type: 'incoming',
    category: 'previous',
    status: 'confirmed',
    detailSubtitle: 'Recebimento Cripto',
    detailDisplayAmount: '+ US$ 250,00',
    detailFields: [
      { label: 'Origem', value: 'Carteira externa' },
      { label: 'Data', value: '12 Jun, 14:08' },
      { label: 'Ativo recebido', value: 'USDT' },
      { label: 'Quantidade', value: '250,00 USDT' },
      { label: 'Rede', value: 'Polygon' },
    ],
    identifiers: [
      { label: 'ID da operação', value: 'NXP-2025-0612-1408' },
      { label: 'Referência cripto', value: '0x3A1F...99B2' },
    ],
  },
  {
    id: 'act-4',
    icon: 'swap',
    title: 'Conversão',
    subtitle: 'ETH → USDT · 10 Jun, 09:31',
    detail: 'ETH → USDT',
    date: '10 Jun, 09:31',
    isNegative: false,
    usdCents: 10000, // US$ 100,00
    tokenAmount: 39_000_000_000_000_000n, // 0,039 ETH
    tokenDecimals: 18,
    tokenSymbol: 'ETH',
    type: 'conversion',
    category: 'previous',
    status: 'confirmed',
    detailSubtitle: 'Conversão de Cripto',
    detailDisplayAmount: 'US$ 100,00',
    detailFields: [
      { label: 'Par de conversão', value: 'ETH → USDT' },
      { label: 'Data', value: '10 Jun, 09:31' },
      { label: 'Ativo debitado', value: '0,039 ETH' },
      { label: 'Ativo creditado', value: '100,00 USDT' },
      { label: 'Cotação estimada', value: '1 ETH = US$ 2.564,10' },
    ],
    identifiers: [
      { label: 'ID da operação', value: 'NXP-2025-0610-0931' },
      { label: 'Referência cripto', value: '0x9E2B...11D8' },
    ],
  },
];

export function getActivities(filter?: string): Activity[] {
  if (!filter || filter === 'all' || filter === 'Todas') {
    return mockActivities;
  }
  if (filter === 'pix' || filter === 'Pagamentos Pix') {
    return mockActivities.filter((a) => a.detail === 'Pagamento Pix');
  }
  if (filter === 'received' || filter === 'Recebimentos') {
    return mockActivities.filter((a) => a.type === 'incoming');
  }
  if (filter === 'transfers' || filter === 'Transferências') {
    return [];
  }
  if (filter === 'conversions' || filter === 'Conversões') {
    return mockActivities.filter((a) => a.type === 'conversion');
  }
  return mockActivities;
}

export function getActivity(id: string): Activity | undefined {
  return mockActivities.find((a) => a.id === id);
}

export function getRecentActivity(limit = 3): Activity[] {
  return mockActivities.slice(0, limit);
}
