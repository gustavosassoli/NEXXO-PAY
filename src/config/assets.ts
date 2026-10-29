/**
 * NEXO PAY - Registro Extensível de Criptoativos
 *
 * Configuração central dos tokens suportados pelo protocolo.
 * O endereço do contrato do USDC nativo na Polygon não deve ser codificado fora deste arquivo.
 */

import { getAddress } from 'viem';
import { POLYGON_CHAIN_ID } from './chains';

export interface AssetConfig {
  symbol: string;
  name: string;
  decimals: number;
  enabled: boolean;
  addresses: Record<number, string>;
}

// Endereço do contrato do USDC nativo na Polygon (6 casas decimais, não USDC.e) com checksum validado
export const NATIVE_POLYGON_USDC_ADDRESS = getAddress('0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359');

export const ASSETS: Record<string, AssetConfig> = {
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    enabled: true,
    addresses: {
      [POLYGON_CHAIN_ID]: NATIVE_POLYGON_USDC_ADDRESS,
    },
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    enabled: false,
    addresses: {
      [POLYGON_CHAIN_ID]: getAddress('0xc2132D05D31c914a87C6611C10748AEb04B58e8F'),
    },
  },
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    enabled: false,
    addresses: {}, // Ativo nativo na rede Ethereum, sem contrato
  },
};

export function getEnabledAssets(): AssetConfig[] {
  return Object.values(ASSETS).filter((asset) => asset.enabled);
}

export function getAsset(symbol: string): AssetConfig | undefined {
  return ASSETS[symbol];
}
