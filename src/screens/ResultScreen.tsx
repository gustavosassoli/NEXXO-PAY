import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { DemoBadge } from '../components/DemoBadge';
import { DataRow } from '../components/DataRow';
import { Button } from '../components/Button';
import { Icon, IconName } from '../components/icons';
import { strings } from '../strings';
import { usePayment, PaymentResultState } from '../context/PaymentContext';
import { DEMO_MODE } from '../config';

export const ResultScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    codeScanned,
    paymentConfirmed,
    resultState,
    setResultState,
    paymentDetails,
    currentPayment,
    currentAssetConfig,
    resetFlow,
  } = usePayment();

  // Proteção de rotas
  if (!codeScanned) {
    return <Navigate to="/pagar" replace />;
  }
  if (!paymentConfirmed) {
    return <Navigate to="/pagar/revisar" replace />;
  }

  const handleBackToHome = () => {
    resetFlow();
    navigate('/');
  };

  // Configurações visuais por estado
  let stateTitle: string = strings.result.confirmedTitle;
  let stateSubtitle: string = strings.result.confirmedSubtitle;
  let iconName: IconName = 'check';
  let iconColor = 'var(--accent)';
  let circleBg = 'var(--accent-tint-10)';
  let circleBorder = '1px solid var(--accent-border-25)';
  let circleShadow = '0 0 20px var(--accent-action-shadow)';

  if (resultState === 'pending') {
    stateTitle = strings.result.pendingTitle;
    stateSubtitle = strings.result.pendingSubtitle;
    iconName = 'clock';
    iconColor = 'var(--warning)';
    circleBg = 'var(--warning-bg-8)';
    circleBorder = '1px solid var(--warning-border-20)';
    circleShadow = 'none';
  } else if (resultState === 'refused') {
    stateTitle = strings.result.refusedTitle;
    stateSubtitle = strings.result.refusedSubtitle;
    iconName = 'close';
    iconColor = 'var(--danger)';
    circleBg = 'var(--danger-bg-8)';
    circleBorder = '1px solid var(--danger-border-20)';
    circleShadow = 'none';
  } else if (resultState === 'expired') {
    stateTitle = strings.result.expiredTitle;
    stateSubtitle = strings.result.expiredSubtitle;
    iconName = 'clock';
    iconColor = 'var(--danger)';
    circleBg = 'var(--danger-bg-8)';
    circleBorder = '1px solid var(--danger-border-20)';
    circleShadow = 'none';
  }

  const previewChips: { id: PaymentResultState; label: string }[] = [
    { id: 'confirmed', label: 'Confirmado' },
    { id: 'pending', label: 'Pendente' },
    { id: 'refused', label: 'Recusado' },
    { id: 'expired', label: 'Expirado' },
  ];

  // Dados reais provenientes do Payment ou de fallback formatado
  const receiverName = currentPayment?.pix.receiverName || paymentDetails.receiverName;
  const amountFormatted = currentPayment?.pix.amountFormatted || paymentDetails.amountFormatted || 'R$ 128,40';
  const debitedString = currentPayment?.quote.debitedString || currentAssetConfig.debitedString;
  const convertedTokenString = currentPayment?.quote.convertedTokenString || currentAssetConfig.convertedTokenString;
  const feesTokenString = currentPayment?.quote.feesTokenString || currentAssetConfig.feesTokenString;
  const receiptDateTime = currentPayment?.receipt?.receiptDateTime || paymentDetails.receiptDateTime;
  const cryptoId = currentPayment?.receipt?.cryptoId || paymentDetails.cryptoId;
  const endToEndPix = currentPayment?.receipt?.endToEndPix || paymentDetails.endToEndPix;

  return (
    <div
      className="nexo-screen nexo-screen--result"
      style={{
        padding: '35px 20px 36px',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        minHeight: '100%',
      }}
    >
      {/* Selo demonstrativo superior */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '27px' }}>
        <DemoBadge />
      </div>

      {/* Ícone circular grande (84px, ícone 38px) */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
        <div
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            backgroundColor: circleBg,
            border: circleBorder,
            color: iconColor,
            boxShadow: circleShadow,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 200ms ease',
          }}
        >
          <Icon name={iconName} size={38} />
        </div>
      </div>

      {/* Título e Subtítulo */}
      <div style={{ textAlign: 'center' }}>
        <h1
          style={{
            margin: '0 0 6px',
            fontSize: 'max(var(--min-text), 21px)',
            fontWeight: 700,
            color: 'var(--text)',
            lineHeight: 1.2,
          }}
        >
          {stateTitle}
        </h1>
        <p
          style={{
            margin: '0 0 8px',
            fontSize: 'max(var(--min-text), 10px)',
            color: 'var(--muted)',
            lineHeight: 1.4,
          }}
        >
          {stateSubtitle}
        </p>
        <span
          style={{
            fontSize: 'max(var(--min-text), 8px)',
            color: 'var(--warning)',
            fontWeight: 500,
          }}
        >
          {strings.result.demoResult}
        </span>
      </div>

      {/* Identificação de valores da cobrança */}
      <div
        style={{
          textAlign: 'center',
          margin: '24px 0 18px',
        }}
      >
        <div
          style={{
            fontSize: 'max(var(--min-text), 9px)',
            color: 'var(--muted)',
            marginBottom: '4px',
          }}
        >
          {receiverName}
        </div>
        <div
          style={{
            fontSize: 'max(var(--min-text), 31px)',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            color: 'var(--text)',
            lineHeight: 1.1,
            marginBottom: '4px',
          }}
        >
          {amountFormatted}
        </div>
        <div
          style={{
            fontSize: 'max(var(--min-text), 9px)',
            color: 'var(--muted)',
          }}
        >
          {debitedString}
        </div>
      </div>

      {/* Cartão de Recibo */}
      <div
        className="nexo-card"
        style={{
          padding: '10px 15px',
          borderRadius: '18px',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--line)',
        }}
      >
        <DataRow
          label={strings.result.convertedValue}
          value={convertedTokenString}
        />
        <DataRow
          label={strings.result.totalFees}
          value={feesTokenString}
        />
        <DataRow
          label={strings.result.dateTime}
          value={receiptDateTime}
        />
        <DataRow
          label={strings.result.cryptoId}
          value={cryptoId}
        />
        <DataRow
          label={strings.result.endToEndPix}
          value={endToEndPix}
        />
      </div>

      {/* Nota informativa */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--muted)',
          fontSize: 'max(var(--min-text), 9px)',
          margin: '14px 0 22px',
          lineHeight: 1.4,
        }}
      >
        <Icon name="info" size={17} style={{ flexShrink: 0 }} />
        <span>{strings.result.infoNote}</span>
      </div>

      {/* Botões de Ação */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
        <Button
          variant="secondary"
          icon="file"
          onClick={() => {
            // Ação informativa de protótipo
          }}
        >
          {strings.result.viewReceipt}
        </Button>
        <Button
          variant="primary"
          onClick={handleBackToHome}
        >
          {strings.result.backToHome}
        </Button>
      </div>

      {/* Seção Pré-visualizar estados (visível em DEMO_MODE) */}
      {DEMO_MODE && (
        <div
          style={{
            marginTop: '22px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 'max(var(--min-text), 8px)',
              color: 'var(--muted)',
              marginBottom: '8px',
            }}
          >
            {strings.result.previewStates}
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            {previewChips.map((chip) => {
              const isActive = resultState === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setResultState(chip.id)}
                  style={{
                    borderRadius: '8px',
                    border: `1px solid ${isActive ? 'var(--accent)' : 'var(--line)'}`,
                    backgroundColor: 'transparent',
                    color: isActive ? 'var(--accent)' : 'var(--muted)',
                    fontSize: 'max(var(--min-text), 7px)',
                    fontWeight: 500,
                    padding: '6px 10px',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 150ms ease',
                  }}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
