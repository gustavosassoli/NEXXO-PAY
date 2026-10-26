import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { DemoBadge } from '../components/DemoBadge';
import { InfoCard } from '../components/InfoCard';
import { Button } from '../components/Button';
import { Icon } from '../components/icons';
import { strings } from '../strings';
import { usePayment } from '../context/PaymentContext';
import { stepsFor } from '../domain/payment/steps';
import { useServices } from '../services';
import { Payment } from '../domain/payment/types';

export const ProcessingScreen: React.FC = () => {
  const navigate = useNavigate();
  const { paymentService } = useServices();
  const {
    codeScanned,
    paymentConfirmed,
    currentPayment,
  } = usePayment();

  // Proteção de rota
  if (!codeScanned) {
    return <Navigate to="/pagar" replace />;
  }
  if (!paymentConfirmed) {
    return <Navigate to="/pagar/revisar" replace />;
  }

  // Estado do pagamento atualizado em tempo real via PaymentService.subscribe()
  const [livePayment, setLivePayment] = useState<Payment | null>(currentPayment);

  useEffect(() => {
    if (!currentPayment) return;

    const unsubscribe = paymentService.subscribe(currentPayment.id, (updated) => {
      setLivePayment(updated);
    });

    return () => {
      unsubscribe();
    };
  }, [currentPayment, paymentService]);

  const currentStatus = livePayment ? livePayment.status : 'AWAITING_CRYPTO';
  const timelineSteps = stepsFor(currentStatus);
  const isCompleted = currentStatus === 'COMPLETED';

  return (
    <div
      className="nexo-screen nexo-screen--processing"
      style={{
        padding: '20px 20px 36px',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        minHeight: '100%',
      }}
    >
      <TopBar
        title={strings.processing.title}
        showBrand={true}
      />

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
        <DemoBadge />
      </div>

      {/* Visual Central: Spinner (em andamento) ou Anel de Sucesso (concluído) */}
      <div
        style={{
          height: '140px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {!isCompleted ? (
          <div className="nexo-spinner" />
        ) : (
          <div
            style={{
              width: '78px',
              height: '78px',
              borderRadius: '50%',
              border: '2px solid var(--accent)',
              backgroundColor: 'var(--accent-tint-7)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px var(--accent-btn-shadow)',
            }}
          >
            <Icon name="check" size={34} />
          </div>
        )}
      </div>

      {/* Título e Subtítulo */}
      <div style={{ textAlign: 'center', marginBottom: '22px' }}>
        <h1
          style={{
            margin: '0 0 6px',
            fontSize: 'max(var(--min-text), 20px)',
            fontWeight: 700,
            color: 'var(--text)',
          }}
        >
          {isCompleted
            ? strings.processing.completedTitle
            : strings.processing.inProgressTitle}
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 'max(var(--min-text), 10px)',
            color: 'var(--muted)',
            lineHeight: 1.4,
          }}
        >
          {isCompleted
            ? strings.processing.completedSubtitle
            : strings.processing.inProgressSubtitle}
        </p>
      </div>

      {/* Linha do Tempo (Timeline com 5 etapas reais orientadas pelo Domínio) */}
      <div
        className="nexo-card"
        aria-live="polite"
        style={{
          borderRadius: '20px',
          padding: '16px 15px',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--line)',
          marginBottom: '14px',
        }}
      >
        {timelineSteps.map((step, index) => {
          const stepDone = step.status === 'done';
          const stepCurrent = step.status === 'in_progress';
          const isLast = index === timelineSteps.length - 1;

          let statusText: string = strings.processing.statusPending;
          if (stepDone) statusText = strings.processing.statusDone;
          else if (stepCurrent) statusText = strings.processing.statusInProgress;

          return (
            <div
              key={step.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                minHeight: isLast ? '42px' : '57px',
                position: 'relative',
              }}
            >
              {/* Coluna da Bolinha e Linha Vertical */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '29px',
                  flexShrink: 0,
                }}
              >
                {/* Bolinha do status */}
                <div
                  style={{
                    width: '29px',
                    height: '29px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'max(var(--min-text), 11px)',
                    fontWeight: 700,
                    transition: 'all 250ms ease',
                    ...(stepDone
                      ? {
                          backgroundColor: 'var(--accent)',
                          color: 'var(--on-accent)',
                          border: 'none',
                        }
                      : stepCurrent
                      ? {
                          backgroundColor: 'var(--surface-3)',
                          border: '2px solid var(--accent)',
                          color: 'var(--accent)',
                          boxShadow: '0 0 0 4px var(--accent-glow-spinner)',
                        }
                      : {
                          backgroundColor: 'var(--surface-3)',
                          border: '1px solid var(--line)',
                          color: 'var(--muted)',
                        }),
                  }}
                >
                  {stepDone ? (
                    <Icon name="check" size={14} />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>

                {/* Linha vertical conectando com a próxima etapa */}
                {!isLast && (
                  <div
                    style={{
                      width: '1px',
                      flex: 1,
                      minHeight: '26px',
                      backgroundColor: 'var(--line)',
                      margin: '3px 0',
                    }}
                  />
                )}
              </div>

              {/* Textos da etapa */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingTop: '4px' }}>
                <span
                  style={{
                    fontSize: 'max(var(--min-text), 11px)',
                    fontWeight: 600,
                    color: stepCurrent ? 'var(--accent)' : 'var(--text)',
                    lineHeight: 1.2,
                  }}
                >
                  {step.title}
                </span>
                <span
                  style={{
                    fontSize: 'max(var(--min-text), 8px)',
                    color: 'var(--muted)',
                    lineHeight: 1.2,
                  }}
                >
                  {statusText}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cartão Informativo */}
      <InfoCard icon="clock" iconSize={18} style={{ margin: '0 0 16px' }}>
        {strings.processing.info}
      </InfoCard>

      {/* Botão para ver resultado quando concluído */}
      {isCompleted && (
        <Button
          variant="primary"
          onClick={() => navigate('/pagar/resultado')}
          style={{ marginTop: 'auto' }}
        >
          {strings.processing.viewResult}
        </Button>
      )}
    </div>
  );
};
