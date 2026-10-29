/**
 * NEXO PAY - Observador de Estado da Carteira durante o Fluxo de Pagamento
 *
 * Se a conta ou a rede mudar durante um pagamento no estado QUOTED:
 * cancela o fluxo e redireciona ao leitor com toast informativo.
 * Não altera pagamentos a partir de AWAITING_CRYPTO.
 */

import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAccount, useChainId } from 'wagmi';
import { usePayment } from '../context/PaymentContext';
import { useToast } from './Toast';
import { strings } from '../strings';

export const PaymentWalletWatcher: React.FC = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const { currentPayment, resetFlow } = usePayment();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const prevAddressRef = useRef<string | undefined>(address);
  const prevChainIdRef = useRef<number | undefined>(chainId);

  useEffect(() => {
    const prevAddress = prevAddressRef.current;
    const prevChainId = prevChainIdRef.current;

    prevAddressRef.current = address;
    prevChainIdRef.current = chainId;

    // Mudança de conta enquanto no estado QUOTED
    if (prevAddress !== undefined && address !== undefined && prevAddress !== address) {
      if (currentPayment && currentPayment.status === 'QUOTED') {
        resetFlow();
        showToast(strings.walletSheet.paymentInterruptedToast);
        if (location.pathname.startsWith('/pagar/')) {
          navigate('/pagar');
        }
      }
    }

    // Mudança de rede enquanto no estado QUOTED
    if (prevChainId !== undefined && chainId !== undefined && prevChainId !== chainId) {
      if (currentPayment && currentPayment.status === 'QUOTED') {
        resetFlow();
        showToast(strings.walletSheet.paymentInterruptedToast);
        if (location.pathname.startsWith('/pagar/')) {
          navigate('/pagar');
        }
      }
    }
  }, [address, chainId, currentPayment, resetFlow, showToast, navigate, location.pathname]);

  return null;
};
