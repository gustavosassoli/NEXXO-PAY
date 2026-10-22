import React, { createContext, useContext, useState, useMemo } from 'react';
import { CoinType } from '../components/Coin';
import { parsePixQRCode, PixParseResult } from '../lib/brcode';
import { calculateQuote, SupportedAsset } from '../lib/quote';

export type ReaderState =
  | 'permission'
  | 'active'
  | 'identified'
  | 'invalid'
  | 'unrecognized';

export type PaymentResultState =
  | 'confirmed'
  | 'pending'
  | 'refused'
  | 'expired';

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

const DEFAULT_SAMPLE_CODE =
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
  chargeBrlCents: 12840, // R$ 128,40
  amountFormatted: 'R$ 128,40',
  conversionFeeBrlCents: 128, // R$ 1,28
  networkFeeBrlCents: 42, // R$ 0,42
  serviceFeeBrlCents: 80, // R$ 0,80
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
  currentAssetConfig: AssetQuoteConfig;
  handleScannedCode: (raw: string) => PixParseResult;
  simulateValidRead: () => void;
  testError: () => void;
  confirmPayment: () => void;
  resetFlow: () => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [readerState, setReaderState] = useState<ReaderState>('permission');
  const [codeScanned, setCodeScanned] = useState<boolean>(false);
  const [selectedAsset, setSelectedAsset] = useState<CoinType>('USDT');
  const [paymentConfirmed, setPaymentConfirmed] = useState<boolean>(false);
  const [resultState, setResultState] = useState<PaymentResultState>('confirmed');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>(defaultPaymentDetails);

  const handleScannedCode = (raw: string): PixParseResult => {
    const res = parsePixQRCode(raw);

    if (res.isValid && res.data) {
      const { date, receiptDateTime } = getNowDateStrings();
      const brlAmount = res.data.amount;
      const brlCents = Math.round(brlAmount * 100);

      // Random hex IDs for mock receipt
      const randomHex = Math.random().toString(16).substring(2, 6).toUpperCase();
      const cryptoId = `0x8F2A...${randomHex}`;
      const endToEndPix = `E${Math.random().toString(36).substring(2, 5).toUpperCase()}...4X9P`;

      setPaymentDetails({
        receiverName: res.data.receiverName || 'Recebedor Pix',
        receiverCompany: undefined, // BR Code não traz
        cnpj: undefined, // BR Code não traz
        institution: undefined, // BR Code não traz
        description: res.data.txid ? `Compra balcão ${res.data.txid}` : undefined,
        date,
        chargeBrlCents: brlCents,
        amountFormatted: res.data.amountFormatted,
        conversionFeeBrlCents: 128,
        networkFeeBrlCents: 42,
        serviceFeeBrlCents: 80,
        receiptDateTime,
        cryptoId,
        endToEndPix,
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

  const confirmPayment = () => {
    setPaymentConfirmed(true);
  };

  const resetFlow = () => {
    setReaderState('active');
    setCodeScanned(false);
    setPaymentConfirmed(false);
    setResultState('confirmed');
    setSelectedAsset('USDT');
  };

  // Motor de cotação dinâmico baseado no ativo e no valor da cobrança
  const currentAssetConfig = useMemo<AssetQuoteConfig>(() => {
    const brlAmount = paymentDetails.chargeBrlCents / 100;
    const q = calculateQuote(brlAmount, selectedAsset as SupportedAsset);

    return {
      code: selectedAsset,
      balanceString: q.balanceString,
      quoteString: q.quoteString,
      convertedTokenString: q.convertedTokenString,
      totalTokenString: q.totalTokenString,
      feesTokenString: q.feesTokenString,
      debitedString: q.debitedString,
      isInsufficientBalance: q.isInsufficientBalance,
    };
  }, [paymentDetails.chargeBrlCents, selectedAsset]);

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
        currentAssetConfig,
        handleScannedCode,
        simulateValidRead,
        testError,
        confirmPayment,
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
