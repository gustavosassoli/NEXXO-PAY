/**
 * NEXO PAY - Contexto e Provedor de Carteira Web3 (Wagmi + Viem)
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { POLYGON_CHAIN_ID, getChain } from '../config/chains';
import { RealBalanceService } from '../services/real/RealBalanceService';
import { normalizeAddress } from '../lib/wallet';
import { BALANCE_MODE } from '../config';
import { useToast } from '../components/Toast';
import { strings } from '../strings';

interface WalletContextType {
  address: string | undefined;
  normalizedAddress: string | undefined;
  isConnected: boolean;
  isConnecting: boolean;
  isWrongNetwork: boolean;
  chainId: number | undefined;
  targetChainName: string;
  isWalletSheetOpen: boolean;
  openWalletSheet: () => void;
  closeWalletSheet: () => void;
  connectMetaMask: () => Promise<void>;
  connectWalletConnect: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  switchToPolygon: () => Promise<void>;
  balanceUnits: bigint;
  balanceFormatted: string;
  isLoadingBalance: boolean;
  balanceError: string | null;
  isBalanceStale: boolean;
  refreshBalance: () => Promise<void>;
  realBalanceService: RealBalanceService;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, isConnected, isConnecting, status, chainId } = useAccount();
  const { connectors, connectAsync } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const { showToast } = useToast();

  const [isWalletSheetOpen, setIsWalletSheetOpen] = useState(false);
  const [balanceUnits, setBalanceUnits] = useState<bigint>(0n);
  const [balanceFormatted, setBalanceFormatted] = useState<string>('0,00 USDC');
  const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [isBalanceStale, setIsBalanceStale] = useState<boolean>(false);

  // Instância única lazy do RealBalanceService (não recriada a cada renderização)
  const realBalanceServiceRef = useRef<RealBalanceService | null>(null);
  if (!realBalanceServiceRef.current) {
    realBalanceServiceRef.current = new RealBalanceService();
  }

  const normalizedAddress = normalizeAddress(address) || undefined;
  const isWrongNetwork = Boolean(isConnected && chainId && chainId !== POLYGON_CHAIN_ID);
  const polygonConfig = getChain(POLYGON_CHAIN_ID);
  const targetChainName = polygonConfig?.name || 'Polygon PoS';

  // Atualiza a conta ativa no serviço sempre que o endereço mudar
  useEffect(() => {
    realBalanceServiceRef.current?.setAccount(normalizedAddress);
  }, [normalizedAddress]);

  const openWalletSheet = useCallback(() => setIsWalletSheetOpen(true), []);
  const closeWalletSheet = useCallback(() => setIsWalletSheetOpen(false), []);

  const refreshBalance = useCallback(async () => {
    if (!isConnected || !normalizedAddress || isWrongNetwork) {
      setBalanceUnits(0n);
      setBalanceFormatted('0,00 USDC');
      setIsLoadingBalance(false);
      if (isWrongNetwork) {
        setBalanceError(strings.walletSheet.wrongNetwork);
      } else {
        setBalanceError(null);
      }
      setIsBalanceStale(false);
      return;
    }

    // Assegura que o endereço atual esteja registrado no serviço antes da leitura
    realBalanceServiceRef.current?.setAccount(normalizedAddress);

    setIsLoadingBalance(true);

    try {
      const units = await realBalanceServiceRef.current!.getBalance('USDC');
      const formatted = await realBalanceServiceRef.current!.formatBalance('USDC');
      setBalanceUnits(units);
      setBalanceFormatted(formatted);
      setBalanceError(null);
      setIsBalanceStale(false);
    } catch (err) {
      console.warn('[WalletProvider] Erro ao carregar saldo USDC:', err);
      // Mantém o último valor conhecido e marca como desatualizado
      setBalanceError(strings.walletSheet.balanceReadError);
      setIsBalanceStale(true);
    } finally {
      setIsLoadingBalance(false);
    }
  }, [isConnected, normalizedAddress, isWrongNetwork]);

  // Atualização de saldo: ao conectar, trocar conta, trocar rede, foco na janela e timer de 30s
  useEffect(() => {
    refreshBalance();

    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        refreshBalance();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshBalance();
      }
    }, 30_000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
      clearInterval(interval);
    };
  }, [refreshBalance]);

  // Conexão via MetaMask (injected)
  const connectMetaMask = useCallback(async () => {
    const injectedConnector = connectors.find(
      (c) => c.id === 'injected' || c.name.toLowerCase().includes('metamask')
    );
    if (!injectedConnector) {
      throw new Error(strings.walletSheet.noProviderError);
    }
    await connectAsync({
      connector: injectedConnector,
      chainId: POLYGON_CHAIN_ID,
    });
    await refreshBalance();
  }, [connectors, connectAsync, refreshBalance]);

  // Conexão via WalletConnect
  const connectWalletConnect = useCallback(async () => {
    const wcConnector = connectors.find((c) => c.id === 'walletConnect');
    if (!wcConnector) {
      throw new Error(strings.walletSheet.noProviderError);
    }
    await connectAsync({
      connector: wcConnector,
      chainId: POLYGON_CHAIN_ID,
    });
    await refreshBalance();
  }, [connectors, connectAsync, refreshBalance]);

  // Desconexão
  const disconnectWallet = useCallback(async () => {
    await disconnectAsync();
    setBalanceUnits(0n);
    setBalanceFormatted('0,00 USDC');
    setBalanceError(null);
    setIsBalanceStale(false);
  }, [disconnectAsync]);

  // Troca para Polygon
  const switchToPolygon = useCallback(async () => {
    if (!switchChainAsync) return;
    await switchChainAsync({ chainId: POLYGON_CHAIN_ID });
    await refreshBalance();
  }, [switchChainAsync, refreshBalance]);

  return (
    <WalletContext.Provider
      value={{
        address: normalizedAddress,
        normalizedAddress,
        isConnected,
        isConnecting: isConnecting || status === 'reconnecting',
        isWrongNetwork,
        chainId,
        targetChainName,
        isWalletSheetOpen,
        openWalletSheet,
        closeWalletSheet,
        connectMetaMask,
        connectWalletConnect,
        disconnectWallet,
        switchToPolygon,
        balanceUnits,
        balanceFormatted,
        isLoadingBalance,
        balanceError,
        isBalanceStale,
        refreshBalance,
        realBalanceService: realBalanceServiceRef.current!,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet deve ser utilizado dentro de um WalletProvider');
  }
  return context;
};
