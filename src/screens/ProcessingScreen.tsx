import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { DemoBadge } from '../components/DemoBadge';
import { InfoCard } from '../components/InfoCard';
import { Button } from '../components/Button';
import { Icon } from '../components/icons';
import { strings } from '../strings';
import { usePayment } from '../context/PaymentContext';

interface TimelineStep {
  id: number;
  title: string;
}

const STEPS: TimelineStep[] = [
  { id: 1, title: strings.processing.step1 },
  { id: 2, title: strings.processing.step2 },
  { id: 3, title: strings.processing.step3 },
  { id: 4, title: strings.processing.step4 },
  { id: 5, title: strings.processing.step5 },
];

export const ProcessingScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    codeScanned,
    paymentConfirmed,
  } = usePayment();

  // Proteção de rota
  if (!codeScanned) {
    return <Navigate to="/pagar" replace />;
  }
  if (!paymentConfirmed) {
    return <Navigate to="/pagar/revisar" replace />;
  }

  // Progresso das etapas: 1 a 5 (em andamento) -> 6 significa concluído
  // Começamos em 3 para que os primeiros já comecem concluídos rapidamente ou em 1 avançando a cada 1.1s
  // Na imagem 11, está na etapa 3 (1 e 2 concluídas, 3 em andamento).
  // Vamos começar na etapa 1 e avançar a cada 1.1s até a etapa 6 (tudo concluído).
  const [currentStep, setCurrentStep] = useState<number>(1);

  useEffect(() => {
    if (currentStep <= 5) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 1100);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const isCompleted = currentStep > 5;

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

      {/* Linha do Tempo (Timeline com 5 etapas) */}
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
        {STEPS.map((step, index) => {
          const stepDone = isCompleted || currentStep > step.id;
          const stepCurrent = !isCompleted && currentStep === step.id;
          const isLast = index === STEPS.length - 1;

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
