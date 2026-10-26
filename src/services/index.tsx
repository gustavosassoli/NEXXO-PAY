/**
 * NEXO PAY - Injeção de Dependências e Contexto de Serviços
 */

import React, { createContext, useContext, useMemo } from 'react';
import { SERVICES_MODE } from '../config';
import { MockBalanceService } from './mock/MockBalanceService';
import { MockPaymentService } from './mock/MockPaymentService';
import { MockQuoteService } from './mock/MockQuoteService';
import { BalanceService, PaymentService, QuoteService, ServicesContainer } from './types';

export * from './types';
export * from './mock/MockBalanceService';
export * from './mock/MockPaymentService';
export * from './mock/MockQuoteService';

const ServicesContext = createContext<ServicesContainer | undefined>(undefined);

// Instâncias singleton padrão para a aplicação
const defaultQuoteService: QuoteService = new MockQuoteService();
const defaultBalanceService: BalanceService = new MockBalanceService();
const defaultPaymentService: PaymentService = new MockPaymentService(defaultQuoteService);

export interface ServicesProviderProps {
  children: React.ReactNode;
  quoteService?: QuoteService;
  balanceService?: BalanceService;
  paymentService?: PaymentService;
}

export const ServicesProvider: React.FC<ServicesProviderProps> = ({
  children,
  quoteService,
  balanceService,
  paymentService,
}) => {
  const container = useMemo<ServicesContainer>(() => {
    if (SERVICES_MODE === 'real') {
      // Ponto de extensão para modo real quando backend/Web3 forem integrados
      console.info('[NEXO PAY] SERVICES_MODE=real configurado. Inicializando conectores.');
    }

    const resolvedQuote = quoteService || defaultQuoteService;
    const resolvedBalance = balanceService || defaultBalanceService;
    const resolvedPayment = paymentService || defaultPaymentService;

    return {
      quoteService: resolvedQuote,
      balanceService: resolvedBalance,
      paymentService: resolvedPayment,
    };
  }, [quoteService, balanceService, paymentService]);

  return (
    <ServicesContext.Provider value={container}>
      {children}
    </ServicesContext.Provider>
  );
};

export const useServices = (): ServicesContainer => {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error('useServices deve ser utilizado dentro de um ServicesProvider');
  }
  return context;
};
