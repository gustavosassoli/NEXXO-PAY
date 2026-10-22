import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { DemoBadge } from '../components/DemoBadge';
import { DataRow } from '../components/DataRow';
import { WarningCard } from '../components/WarningCard';
import { Button } from '../components/Button';
import { Icon } from '../components/icons';
import { strings } from '../strings';
import { usePayment } from '../context/PaymentContext';
import { CoinType } from '../components/Coin';

export const ReviewPaymentScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    codeScanned,
    selectedAsset,
    setSelectedAsset,
    paymentDetails,
    currentAssetConfig,
    confirmPayment,
  } = usePayment();

  // Proteção de rota: se nenhum código foi lido, redireciona para o leitor
  if (!codeScanned) {
    return <Navigate to="/pagar" replace />;
  }

  const handleConfirm = () => {
    if (currentAssetConfig.isInsufficientBalance) return;
    confirmPayment();
    navigate('/pagar/processando');
  };

  const assetOptions: CoinType[] = ['USDT', 'USDC', 'ETH'];
  const isInsufficient = currentAssetConfig.isInsufficientBalance;

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

      {/* Seletor Segmentado USDT / USDC / ETH */}
      <div className="nexo-segmented" style={{ marginBottom: '16px' }}>
        {assetOptions.map((asset) => (
          <button
            key={asset}
            type="button"
            className={`nexo-segmented-btn ${selectedAsset === asset ? 'is-active' : ''}`}
            onClick={() => setSelectedAsset(asset)}
          >
            {asset}
          </button>
        ))}
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

      {/* Nota da reserva da cotação */}
      <div
        style={{
          fontSize: 'max(var(--min-text), 8px)',
          color: 'var(--muted)',
          textAlign: 'center',
          margin: '12px 0 16px',
        }}
      >
        {strings.review.quoteReserved}
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

      {/* Botão de confirmação */}
      <Button
        variant="primary"
        icon="lock"
        onClick={handleConfirm}
        disabled={isInsufficient}
        aria-disabled={isInsufficient}
      >
        {strings.review.confirmPayment}
      </Button>
    </div>
  );
};
