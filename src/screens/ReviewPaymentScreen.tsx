import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { DemoBadge } from '../components/DemoBadge';
import { DataRow } from '../components/DataRow';
import { WarningCard } from '../components/WarningCard';
import { Button } from '../components/Button';
import { Icon } from '../components/icons';
import { strings } from '../strings';
import { usePayment } from '../context/PaymentContext';
import { useWallet } from '../context/WalletContext';
import { CoinType } from '../components/Coin';
import { getAsset } from '../config/assets';

export interface ReviewPaymentScreenProps {
  now?: () => number;
}

export const ReviewPaymentScreen: React.FC<ReviewPaymentScreenProps> = ({ now }) => {
  const navigate = useNavigate();
  const clock = now || (() => Date.now());

  const {
    codeScanned,
    selectedAsset,
    setSelectedAsset,
    paymentDetails,
    currentAssetConfig,
    currentQuote,
    confirmPayment,
    refreshQuote,
  } = usePayment();

  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(45);
  const isRefreshingRef = useRef<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Proteção de rota: se nenhum código foi lido, redireciona para o leitor
  if (!codeScanned) {
    return <Navigate to="/pagar" replace />;
  }

  // Contador regressivo de 45 segundos da reserva da cotação
  useEffect(() => {
    if (isConfirming) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const calculateRemaining = () => {
      if (!currentQuote) return 45;
      const msLeft = currentQuote.expiresAt - clock();
      return Math.max(0, Math.ceil(msLeft / 1000));
    };

    const initial = calculateRemaining();
    setSecondsRemaining(initial);

    intervalRef.current = setInterval(async () => {
      const left = calculateRemaining();
      setSecondsRemaining(left);

      // Auto-renovação da cotação ao atingir zero
      if (left <= 0 && !isRefreshingRef.current) {
        isRefreshingRef.current = true;
        try {
          await refreshQuote(clock);
        } finally {
          isRefreshingRef.current = false;
        }
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentQuote, clock, refreshQuote, isConfirming]);

  // Formatação em minutos e segundos: "0:32"
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes}:${String(seconds).padStart(2, '0')}`;

  const { isConnected, openWalletSheet } = useWallet();

  const handleConfirm = async () => {
    if (!isConnected) {
      openWalletSheet();
      return;
    }
    if (isConfirming || currentAssetConfig.isInsufficientBalance) return;
    setIsConfirming(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    await confirmPayment();
    navigate('/pagar/processando');
  };

  const assetOptions: CoinType[] = ['USDC', 'USDT', 'ETH'];
  const isInsufficient = isConnected && currentAssetConfig.isInsufficientBalance;

  return (
    <div
      className="nexo-screen nexo-screen--review"
      style={{
        padding: '20px 20px 36px',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        minHeight: '100%',
      }}
    >
      <TopBar
        title={strings.review.title}
        showBack={true}
        onBack={() => navigate('/pagar')}
      />

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '17px' }}>
        <DemoBadge />
      </div>

      {/* Identificação do Recebedor */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          marginBottom: '18px',
        }}
      >
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '17px',
            backgroundColor: 'var(--accent-tint-10)',
            color: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon name="store" size={25} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span
            style={{
              fontSize: 'max(var(--min-text), 9px)',
              color: 'var(--muted)',
              lineHeight: 1,
            }}
          >
            {strings.review.payingTo}
          </span>
          <span
            style={{
              fontSize: 'max(var(--min-text), 15px)',
              fontWeight: 700,
              color: 'var(--text)',
              lineHeight: 1.2,
            }}
          >
            {paymentDetails.receiverName}
          </span>
          {paymentDetails.receiverCompany ? (
            <span
              style={{
                fontSize: 'max(var(--min-text), 9px)',
                color: 'var(--muted)',
                lineHeight: 1,
              }}
            >
              {paymentDetails.receiverCompany}
            </span>
          ) : null}
        </div>
      </div>

      {/* Cartão de dados do recebedor (omite campos ausentes sem deixar buracos) */}
      <div
        className="nexo-card"
        style={{
          padding: '9px 15px',
          borderRadius: '18px',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--line)',
          marginBottom: '16px',
        }}
      >
        {paymentDetails.cnpj ? (
          <DataRow label={strings.review.cnpj} value={paymentDetails.cnpj} />
        ) : null}
        {paymentDetails.institution ? (
          <DataRow label={strings.review.institution} value={paymentDetails.institution} />
        ) : null}
        {paymentDetails.description ? (
          <DataRow label={strings.review.description} value={paymentDetails.description} />
        ) : null}
        <DataRow label={strings.review.date} value={paymentDetails.date} />
      </div>

      {/* Valor da cobrança centralizado */}
      <div
        style={{
          textAlign: 'center',
          padding: '22px 0 18px',
        }}
      >
        <div
          style={{
            fontSize: 'max(var(--min-text), 10px)',
            color: 'var(--muted)',
            marginBottom: '6px',
          }}
        >
          {strings.review.chargeValue}
        </div>
        <div
          style={{
            fontSize: 'max(var(--min-text), 31px)',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            color: 'var(--text)',
            lineHeight: 1.1,
          }}
        >
          {paymentDetails.amountFormatted || 'R$ 128,40'}
        </div>
      </div>

      {/* Aviso */}
      <WarningCard style={{ marginBottom: '23px' }}>
        {strings.review.warning}
      </WarningCard>

      {/* Título Seletor de Ativos */}
      <h2
        style={{
          margin: '0 0 14px',
          fontSize: 'max(var(--min-text), 16px)',
          fontWeight: 700,
          color: 'var(--text)',
        }}
      >
        {strings.review.youWillPayWith}
      </h2>

      {/* Seletor Segmentado USDC / USDT / ETH */}
      <div className="nexo-segmented" style={{ marginBottom: '16px' }}>
        {assetOptions.map((asset) => {
          const assetCfg = getAsset(asset);
          const isEnabled = assetCfg?.enabled ?? false;

          if (!isEnabled) {
            return (
              <button
                key={asset}
                type="button"
                disabled
                aria-disabled="true"
                className="nexo-segmented-btn"
                style={{
                  opacity: 0.4,
                  cursor: 'not-allowed',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
                title={strings.common.comingSoon}
              >
                <span>{asset}</span>
                <span
                  style={{
                    fontSize: 'max(var(--min-text), 7px)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em',
                    padding: '1px 3px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--surface-3)',
                    color: 'var(--muted)',
                  }}
                >
                  {strings.common.comingSoon}
                </span>
              </button>
            );
          }

          return (
            <button
              key={asset}
              type="button"
              className={`nexo-segmented-btn ${selectedAsset === asset ? 'is-active' : ''}`}
              onClick={() => setSelectedAsset(asset)}
            >
              {asset}
            </button>
          );
        })}
      </div>

      {/* Cartão de Pagamento com Cotação e Taxas */}
      <div
        className="nexo-card"
        style={{
          padding: '14px 15px',
          borderRadius: '18px',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--line)',
          marginBottom: '8px',
        }}
      >
        <DataRow
          label={`${strings.review.balanceIn} ${selectedAsset}`}
          value={currentAssetConfig.balanceString}
        />
        <DataRow
          label={strings.review.quoteUsed}
          value={currentAssetConfig.quoteString}
        />
        <DataRow
          label={strings.review.convertedValue}
          value={currentAssetConfig.convertedTokenString}
        />
        <DataRow
          label={strings.review.conversionFee}
          value="R$ 1,28"
        />
        <DataRow
          label={strings.review.networkFee}
          value="R$ 0,42"
        />
        <DataRow
          label={strings.review.serviceFee}
          value="R$ 0,80"
        />

        {/* Divisor */}
        <div
          style={{
            height: '1px',
            backgroundColor: 'var(--line)',
            margin: '6px 0',
          }}
        />

        {/* Linha forte: Total estimado */}
        <DataRow
          variant="strong"
          label={strings.review.estimatedTotal}
          value={currentAssetConfig.totalTokenString}
        />
      </div>

      {/* Nota da reserva da cotação e contador regressivo de 45 segundos */}
      <div
        style={{
          fontSize: 'max(var(--min-text), 8px)',
          color: 'var(--muted)',
          textAlign: 'center',
          margin: '12px 0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '5px',
          lineHeight: 1.3,
        }}
      >
        <span>{strings.review.quoteReserved}</span>
        <span
          style={{
            fontWeight: 600,
            color: 'var(--accent)',
          }}
        >
          Renova em {timeFormatted}
        </span>
      </div>

      {/* Aviso de saldo insuficiente em vermelho suave */}
      {isInsufficient && (
        <div
          style={{
            fontSize: 'max(var(--min-text), 11px)',
            color: 'var(--danger)',
            textAlign: 'center',
            marginBottom: '12px',
            fontWeight: 500,
          }}
        >
          {strings.review.insufficientBalance}
        </div>
      )}

      {/* Botão de confirmação com proteção contra duplo toque e bloqueio sem carteira */}
      <Button
        variant="primary"
        icon="lock"
        onClick={handleConfirm}
        disabled={isConnected && (isInsufficient || isConfirming)}
        aria-disabled={isConnected && (isInsufficient || isConfirming)}
      >
        {strings.review.confirmPayment}
      </Button>
    </div>
  );
};
