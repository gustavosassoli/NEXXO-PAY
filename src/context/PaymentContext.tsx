import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { CoinType } from '../components/Coin';
import { parsePixQRCode, PixParseResult } from '../lib/brcode';
import { formatBrl } from '../lib/money';
import { Payment, PaymentAsset, PaymentPixData, PaymentQuote } from '../domain/payment/types';
import { resultStateFor, ResultOutcome } from '../domain/payment/steps';
import { useServices } from '../services';

export type ReaderState =
  | 'permission'
  | 'active'
  | 'identified'
  | 'invalid'
  | 'unrecognized';

export type PaymentResultState = ResultOutcome;

export interface PaymentDetails {
  receiverName: string;
  receiverCompany?: string;
  cnpj?: string;
  institution?: string;
  description?: string;
  date: string;
  chargeBrlCents: number;
  amountFormatted: string;
  conversionFeeBrlCents: number;
  networkFeeBrlCents: number;
  serviceFeeBrlCents: number;
  receiptDateTime: string;
  cryptoId: string;
  endToEndPix: string;
}

export interface AssetQuoteConfig {
  code: CoinType;
  balanceString: string;
  quoteString: string;
  convertedTokenString: string;
  totalTokenString: string;
  feesTokenString: string;
  debitedString: string;
  isInsufficientBalance: boolean;
}

export const DEFAULT_SAMPLE_CODE =
  '00020101021226580014br.gov.bcb.pix013611111111-2222-4333-8444-5555555555555204000053039865406128.405802BR5917MERCADO VILA NOVA6009SAO PAULO62120508NEXO184263046550';

function getNowDateStrings(): { date: string; receiptDateTime: string } {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const date = `Hoje, ${hours}:${minutes}`;

  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const day = now.getDate();
  const month = months[now.getMonth()];
  const year = now.getFullYear();
  const receiptDateTime = `${day} ${month} ${year}, ${hours}:${minutes}`;

  return { date, receiptDateTime };
}

export const defaultPaymentDetails: PaymentDetails = {
  receiverName: 'Mercado Vila Nova',
  receiverCompany: 'Comercial Vila Nova LTDA',
  cnpj: '12.***.***/0001-45',
  institution: 'Banco Parceiro S.A.',
  description: 'Compra balcão 1842',
  date: 'Hoje, 10:48',
  chargeBrlCents: 12840, // R$ 128,40 (centavos inteiros)
  amountFormatted: 'R$ 128,40',
  conversionFeeBrlCents: 128,
  networkFeeBrlCents: 42,
  serviceFeeBrlCents: 80,
  receiptDateTime: '18 jun 2025, 10:49',
  cryptoId: '0x8F2A...91C4',
  endToEndPix: 'E000...4X9P',
};

interface PaymentContextType {
  readerState: ReaderState;
  setReaderState: (state: ReaderState) => void;
  codeScanned: boolean;
  selectedAsset: CoinType;
  setSelectedAsset: (asset: CoinType) => void;
  paymentConfirmed: boolean;
  resultState: PaymentResultState;
  setResultState: (state: PaymentResultState) => void;
  paymentDetails: PaymentDetails;
  currentPayment: Payment | null;
  currentQuote: PaymentQuote | null;
  currentAssetConfig: AssetQuoteConfig;
  handleScannedCode: (raw: string) => PixParseResult;
  simulateValidRead: () => void;
  testError: () => void;
  confirmPayment: () => Promise<Payment | undefined>;
  refreshQuote: (nowClock?: () => number) => Promise<PaymentQuote | null>;
  resetFlow: () => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { quoteService, balanceService, paymentService } = useServices();

  const [readerState, setReaderState] = useState<ReaderState>('permission');
  const [codeScanned, setCodeScanned] = useState<boolean>(false);
  const [selectedAsset, setSelectedAsset] = useState<CoinType>('USDT');
  const [paymentConfirmed, setPaymentConfirmed] = useState<boolean>(false);
  const [resultState, setResultState] = useState<PaymentResultState>('confirmed');
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);
  const [currentQuote, setCurrentQuote] = useState<PaymentQuote | null>(null);
  const [balanceString, setBalanceString] = useState<string>('850,00 USDT');
  const [isInsufficientBalance, setIsInsufficientBalance] = useState<boolean>(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>(defaultPaymentDetails);

  // Mantém saldo atualizado quando o ativo muda
  useEffect(() => {
    let isMounted = true;
    balanceService.formatBalance(selectedAsset as PaymentAsset).then((formatted) => {
      if (isMounted) setBalanceString(formatted);
    });
    return () => {
      isMounted = false;
    };
  }, [selectedAsset, balanceService]);

  // Atualiza a cotação e validação de saldo
  const updateQuote = useCallback(
    async (
      amountCents: number,
      asset: PaymentAsset,
      nowClock?: () => number,
      forceNew = false
    ): Promise<PaymentQuote> => {
      if (forceNew) {
        quoteService.invalidate(amountCents, asset);
      }
      const quote = await quoteService.getQuote(amountCents, asset, nowClock);
      const isSufficient = await balanceService.hasSufficientBalance(quote.totalUnits, asset);

      setCurrentQuote(quote);
      setIsInsufficientBalance(!isSufficient);
      return quote;
    },
    [quoteService, balanceService]
  );

  // Recarrega cotação quando ativo ou valor do pagamento muda
  useEffect(() => {
    if (!codeScanned && !currentPayment) {
      // Pré-carrega cotação padrão (R$ 128,40)
      updateQuote(12840, selectedAsset as PaymentAsset);
      return;
    }

    const amount = currentPayment ? currentPayment.pix.amountCents : paymentDetails.chargeBrlCents;
    updateQuote(amount, selectedAsset as PaymentAsset);
  }, [selectedAsset, currentPayment, codeScanned, paymentDetails.chargeBrlCents, updateQuote]);

  const refreshQuote = useCallback(
    async (nowClock?: () => number): Promise<PaymentQuote | null> => {
      const amount = currentPayment
        ? currentPayment.pix.amountCents
        : paymentDetails.chargeBrlCents;
      return updateQuote(amount, selectedAsset as PaymentAsset, nowClock, true);
    },
    [currentPayment, paymentDetails.chargeBrlCents, selectedAsset, updateQuote]
  );

  const handleScannedCode = (raw: string): PixParseResult => {
    const res = parsePixQRCode(raw);

    if (res.isValid && res.data) {
      const { date, receiptDateTime } = getNowDateStrings();
      const amountCents = res.data.amountCents;

      const randomHex = Math.random().toString(16).substring(2, 6).toUpperCase();
      const cryptoId = `0x8F2A...${randomHex}`;
      const endToEndPix = `E${Math.random().toString(36).substring(2, 5).toUpperCase()}...4X9P`;

      const pixData: PaymentPixData = {
        receiverName: res.data.receiverName,
        receiverCity: res.data.receiverCity,
        txid: res.data.txid,
        amountCents,
        rawCode: res.data.raw,
        amountFormatted: res.data.amountFormatted,
      };

      setPaymentDetails({
        receiverName: res.data.receiverName,
        receiverCompany: undefined,
        cnpj: undefined,
        institution: undefined,
        description: res.data.txid ? `Compra balcão ${res.data.txid}` : undefined,
        date,
        chargeBrlCents: amountCents,
        amountFormatted: res.data.amountFormatted,
        conversionFeeBrlCents: 128,
        networkFeeBrlCents: 42,
        serviceFeeBrlCents: 80,
        receiptDateTime,
        cryptoId,
        endToEndPix,
      });

      // Cria a ordem de pagamento no PaymentService
      paymentService.create(pixData, selectedAsset as PaymentAsset).then((createdPayment) => {
        setCurrentPayment(createdPayment);
        setCurrentQuote(createdPayment.quote);
      });

      setCodeScanned(true);
      setReaderState('identified');

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(50);
        } catch {
          // ignore
        }
      }
    } else {
      setCodeScanned(false);
      setReaderState(res.visualState);
    }

    return res;
  };

  const simulateValidRead = () => {
    handleScannedCode(DEFAULT_SAMPLE_CODE);
  };

  const testError = () => {
    setCodeScanned(false);
    setReaderState((prev) => (prev === 'invalid' ? 'unrecognized' : 'invalid'));
  };

  const confirmPayment = async (): Promise<Payment | undefined> => {
    if (!currentPayment) {
      setPaymentConfirmed(true);
      return;
    }

    setPaymentConfirmed(true);
    const confirmedPayment = await paymentService.confirm(currentPayment.id);
    setCurrentPayment(confirmedPayment);
    setResultState(resultStateFor(confirmedPayment.status));
    return confirmedPayment;
  };

  const resetFlow = () => {
    setReaderState('permission');
    setCodeScanned(false);
    setPaymentConfirmed(false);
    setCurrentPayment(null);
    setResultState('confirmed');
    setSelectedAsset('USDT');
    if (paymentService.reset) {
      paymentService.reset();
    }
  };

  // Configuração do ativo atual para ReviewPaymentScreen e ResultScreen
  const currentAssetConfig = useMemo<AssetQuoteConfig>(() => {
    if (currentQuote && currentQuote.asset === selectedAsset) {
      return {
        code: selectedAsset,
        balanceString,
        quoteString: currentQuote.quoteString,
        convertedTokenString: currentQuote.convertedTokenString,
        totalTokenString: currentQuote.totalTokenString,
        feesTokenString: currentQuote.feesTokenString,
        debitedString: currentQuote.debitedString,
        isInsufficientBalance,
      };
    }

    // Fallback inicial estático enquanto a cotação assíncrona carrega
    return {
      code: selectedAsset,
      balanceString,
      quoteString: selectedAsset === 'ETH' ? '1 ETH = R$ 13.218,00' : `1 ${selectedAsset} = R$ 5,155`,
      convertedTokenString: selectedAsset === 'ETH' ? '0,00971 ETH' : `24,908 ${selectedAsset}`,
      totalTokenString: selectedAsset === 'ETH' ? '0,00990 ETH' : `25,393 ${selectedAsset}`,
      feesTokenString: selectedAsset === 'ETH' ? '0,00019 ETH' : `0,485 ${selectedAsset}`,
      debitedString:
        selectedAsset === 'ETH'
          ? '0,00990 ETH debitados'
          : `25,393 ${selectedAsset} debitados`,
      isInsufficientBalance,
    };
  }, [currentQuote, selectedAsset, balanceString, isInsufficientBalance]);

  return (
    <PaymentContext.Provider
      value={{
        readerState,
        setReaderState,
        codeScanned,
        selectedAsset,
        setSelectedAsset,
        paymentConfirmed,
        resultState,
        setResultState,
        paymentDetails,
        currentPayment,
        currentQuote,
        currentAssetConfig,
        handleScannedCode,
        simulateValidRead,
        testError,
        confirmPayment,
        refreshQuote,
        resetFlow,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment deve ser utilizado dentro de um PaymentProvider');
  }
  return context;
};
