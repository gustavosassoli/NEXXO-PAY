/**
 * NEXO PAY - Configuração do Wagmi para Conexão de Carteiras
 */

import { createConfig, http } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';
import { defineChain } from 'viem';
import { getEnabledChains, POLYGON_CHAIN_ID } from './chains';

// Constrói as chains do Viem dinamicamente a partir do registro extensível
const viemChains = getEnabledChains().map((c) =>
  defineChain({
    id: c.id,
    name: c.name,
    nativeCurrency: {
      name: c.nativeSymbol,
      symbol: c.nativeSymbol,
      decimals: 18,
    },
    rpcUrls: {
      default: { http: [c.rpcUrl] },
      public: { http: [c.rpcUrl] },
    },
    blockExplorers: {
      default: { name: 'Explorer', url: c.explorerUrl },
    },
  })
);

const polygonChain = viemChains.find((c) => c.id === POLYGON_CHAIN_ID) || viemChains[0];

const walletConnectProjectId =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_WALLETCONNECT_PROJECT_ID) ||
  '31d2dd4ad4b424bb58d9de171774869b';

const connectors: any[] = [
  injected({
    shimDisconnect: true,
  }),
];

if (walletConnectProjectId && walletConnectProjectId.trim().length > 0) {
  connectors.push(
    walletConnect({
      projectId: walletConnectProjectId.trim(),
      showQrModal: true,
    })
  );
} else {
  console.warn(
    '[NEXO PAY] VITE_WALLETCONNECT_PROJECT_ID não informado. Conexão móvel WalletConnect desabilitada.'
  );
}

export const wagmiConfig = createConfig({
  chains: [polygonChain, ...viemChains.filter((c) => c.id !== polygonChain.id)] as any,
  connectors,
  transports: {
    [polygonChain.id]: http(polygonChain.rpcUrls.default.http[0]),
  },
});
