import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { Button } from '../components/Button';
import { InfoCard } from '../components/InfoCard';
import { Icon } from '../components/icons';
import { useToast } from '../components/Toast';
import { strings } from '../strings';
import { getActivity, mockActivities } from '../data/mock';

export const ActivityDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const activityId = searchParams.get('id') || 'act-1';
  const activity = getActivity(activityId) || mockActivities[0];

  // Estado para os botões de cópia (armazenando a chave copiada temporariamente)
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, value: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(value).catch(() => {});
    }
    setCopiedKey(key);
    showToast(strings.common.copied);
    setTimeout(() => {
      setCopiedKey((current) => (current === key ? null : current));
    }, 1600);
  };

  // Cores do ícone conforme o tom
  let iconBg = 'var(--surface-3)';
  let iconColor = 'var(--activity-out)';
  if (activity.type === 'incoming') {
    iconBg = 'var(--accent-tint-10)';
    iconColor = 'var(--accent)';
  } else if (activity.type === 'conversion') {
    iconBg = 'var(--activity-conv-bg)';
    iconColor = 'var(--activity-conv)';
  }

  return (
    <div
      style={{
        padding: '0 20px 32px 20px',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* TopBar com botão voltar e ação de download de comprovante */}
      <TopBar
        showBack
        onBack={() => navigate('/atividade')}
        title={strings.activity.detailTitle}
        actionIcon="download"
        actionAriaLabel={strings.activity.downloadReceipt}
        onAction={() => showToast(strings.activity.downloadReceipt + ' (demonstrativo)')}
      />

      {/* Cabeçalho centralizado com ícone, título, valor e pílula de status */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginTop: '6px',
          marginBottom: '26px',
        }}
      >
        {/* Caixa de ícone */}
        <div
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '17px',
            backgroundColor: iconBg,
            color: iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px',
          }}
        >
          <Icon name={activity.icon} size={26} />
        </div>

        {/* Nome / Recebedor */}
        <h2
          style={{
            margin: '0 0 6px 0',
            fontSize: 'max(var(--min-text), 17px)',
            fontWeight: 700,
            color: 'var(--text)',
            letterSpacing: '-0.02em',
          }}
        >
          {activity.receiver || activity.title}
        </h2>

        {/* Valor em destaque */}
        <div
          style={{
            fontSize: 'max(var(--min-text), 24px)',
            fontWeight: 750,
            color: 'var(--text)',
            letterSpacing: '-0.03em',
            marginBottom: '12px',
          }}
        >
          {activity.detailDisplayAmount || (activity.isNegative ? '− R$ 128,40' : 'R$ 128,40')}
        </div>

        {/* Pílula Confirmado */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 12px',
            borderRadius: '14px',
            backgroundColor: 'var(--accent-tint-12)',
            border: '1px solid var(--accent-border-25)',
            color: 'var(--accent)',
            fontSize: 'max(var(--min-text), 10px)',
            fontWeight: 600,
          }}
        >
          <Icon name="check" size={13} />
          <span>{strings.activity.confirmed}</span>
        </div>
      </div>

      {/* Cartão de dados da transação */}
      {activity.detailFields && activity.detailFields.length > 0 && (
        <section
          style={{
            borderRadius: '17px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--line)',
            padding: '4px 16px',
            marginBottom: '20px',
          }}
        >
          {activity.detailFields.map((field, idx) => (
            <div key={field.label}>
              {idx > 0 && (
                <div style={{ height: '1px', backgroundColor: 'var(--line)' }} />
              )}
              <div
                style={{
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <span
                  style={{
                    fontSize: 'max(var(--min-text), 11px)',
                    color: 'var(--muted)',
                    fontWeight: 400,
                  }}
                >
                  {field.label}
                </span>
                <span
                  style={{
                    fontSize: 'max(var(--min-text), 11px)',
                    color: 'var(--text)',
                    fontWeight: 600,
                    textAlign: 'right',
                  }}
                >
                  {field.value}
                </span>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Seção Identificadores */}
      {activity.identifiers && activity.identifiers.length > 0 && (
        <section style={{ marginBottom: '16px' }}>
          <div
            style={{
              fontSize: 'max(var(--min-text), 10px)',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'var(--muted)',
              textTransform: 'uppercase',
              marginBottom: '10px',
            }}
          >
            {strings.activity.identifiers}
          </div>

          <div
            style={{
              borderRadius: '17px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--line)',
              padding: '4px 16px',
            }}
          >
            {activity.identifiers.map((ident, idx) => {
              const isCopied = copiedKey === ident.label;

              return (
                <div key={ident.label}>
                  {idx > 0 && (
                    <div style={{ height: '1px', backgroundColor: 'var(--line)' }} />
                  )}
                  <div
                    style={{
                      minHeight: '46px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 'max(var(--min-text), 11px)',
                        color: 'var(--muted)',
                        fontWeight: 400,
                      }}
                    >
                      {ident.label}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: 'max(var(--min-text), 11px)',
                          color: 'var(--text)',
                          fontWeight: 600,
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {ident.value}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleCopy(ident.label, ident.value)}
                        aria-label={`Copiar ${ident.label}`}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '4px',
                          cursor: 'pointer',
                          color: isCopied ? 'var(--accent)' : 'var(--muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          outline: 'none',
                          transition: 'color 150ms ease, transform 150ms ease',
                        }}
                      >
                        <Icon name={isCopied ? 'check' : 'copy'} size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Cartão informativo */}
      <InfoCard icon="info" style={{ margin: '8px 0 24px 0' }}>
        {strings.activity.liquidationConfirmed}
      </InfoCard>

      {/* Botão Ver comprovante */}
      <Button
        variant="primary"
        fullWidth
        onClick={() => showToast('Comprovante demonstrativo gerado')}
      >
        {strings.activity.viewReceipt}
      </Button>
    </div>
  );
};
