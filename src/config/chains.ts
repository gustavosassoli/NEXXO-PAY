/**
 * NEXO PAY - Registro Extensível de Redes Blockchain
 *
 * Configuração central das redes suportadas pelo protocolo.
 * Por arquitetura, o chain ID 137 não deve ser codificado fora deste arquivo.
 */

export interface ChainConfig {
  id: number;
  name: string;
  shortName: string;
  nativeSymbol: string;
  rpcUrl: string;
  explorerUrl: string;
  enabled: boolean;
}

export const POLYGON_CHAIN_ID = 137;

export const CHAINS: Record<number, ChainConfig> = {
  [POLYGON_CHAIN_ID]: {
    id: POLYGON_CHAIN_ID,
    name: 'Polygon PoS',
    shortName: 'Polygon',
    nativeSymbol: 'POL',
    rpcUrl:
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_POLYGON_RPC_URL) ||
      'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    enabled: true,
  },
};

export function getEnabledChains(): ChainConfig[] {
  return Object.values(CHAINS).filter((chain) => chain.enabled);
}

export function getChain(id: number): ChainConfig | undefined {
  return CHAINS[id];
}
