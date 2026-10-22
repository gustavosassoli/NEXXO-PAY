import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { DemoBadge } from '../components/DemoBadge';
import { DataRow } from '../components/DataRow';
import { InfoCard } from '../components/InfoCard';
import { Button } from '../components/Button';
import { Icon } from '../components/icons';
import { strings } from '../strings';
import { useToast } from '../components/Toast';
import { DEMO_MODE } from '../config';

interface Partner {
  id: string;
  name: string;
  info: string;
  time: string;
}

const PARTNERS: Partner[] = [
  {
    id: 'alpha',
    name: 'Parceiro Alpha',
    info: 'Cartão ou Pix · taxa a partir de 1,8%',
    time: '5–15 min',
  },
  {
    id: 'orbit',
    name: 'Parceiro Orbit',
    info: 'Pix · taxa a partir de 1,2%',
    time: 'Até 10 min',
  },
];

export const AddFundsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [selectedPartner, setSelectedPartner] = useState<string>('alpha');

  const handleContinue = () => {
    showToast(strings.addFunds.footerNote);
  };

  return (
    <div
      className="nexo-screen nexo-screen--add-funds"
      style={{
        padding: '20px 20px 36px',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        minHeight: '100%',
      }}
    >
      <TopBar
        title={strings.addFunds.title}
        showBack={true}
        onBack={() => navigate('/carteira')}
      />

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
        <DemoBadge />
      </div>

      {/* Introdução (margem 10/0/24) */}
      <div style={{ marginTop: '10px', marginBottom: '24px' }}>
        <h1
          style={{
            margin: '0 0 6px',
            fontSize: 'max(var(--min-text), 22px)',
            fontWeight: 700,
            color: 'var(--text)',
            lineHeight: 1.2,
          }}
        >
          {strings.addFunds.heading}
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 'max(var(--min-text), 10px)',
            color: 'var(--muted)',
            lineHeight: 1.4,
          }}
        >
          {strings.addFunds.subheading}
        </p>
      </div>

      {/* Lista de Parceiros (role="radiogroup") */}
      <div
        role="radiogroup"
        aria-label="Serviços parceiros"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          marginBottom: '16px',
        }}
      >
        {PARTNERS.map((partner) => {
          const isSelected = selectedPartner === partner.id;

          return (
            <div
              key={partner.id}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => setSelectedPartner(partner.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedPartner(partner.id);
                }
              }}
              style={{
                borderRadius: '18px',
                padding: '14px',
                display: 'grid',
                gridTemplateColumns: '42px 1fr 22px',
                gap: '12px',
                alignItems: 'center',
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 200ms ease',
                backgroundColor: isSelected ? 'transparent' : 'var(--surface)',
                backgroundImage: isSelected
                  ? 'var(--partner-selected-gradient)'
                  : 'none',
                border: isSelected
                  ? '1px solid var(--accent-border-45)'
                  : '1px solid var(--line)',
              }}
            >
              {/* Logo do parceiro (40x40 raio 13 fundo com "N" accent 800) */}
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '13px',
                  backgroundColor: 'var(--partner-logo-bg)',
                  color: 'var(--partner-logo-text)',
                  fontSize: 'max(var(--min-text), 15px)',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  userSelect: 'none',
                  flexShrink: 0,
                }}
              >
                N
              </div>

              {/* Informações do parceiro */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span
                  style={{
                    fontSize: 'max(var(--min-text), 11px)',
                    fontWeight: 700,
                    color: 'var(--text)',
                    lineHeight: 1.2,
                  }}
                >
                  {partner.name}
                </span>
                <span
                  style={{
                    fontSize: 'max(var(--min-text), 8px)',
                    color: 'var(--muted)',
                    lineHeight: 1.2,
                  }}
                >
                  {partner.info}
                </span>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: 'var(--partner-time)',
                    fontSize: 'max(var(--min-text), 8px)',
                    marginTop: '2px',
                  }}
                >
                  <Icon name="clock" size={13} />
                  <span>{partner.time}</span>
                </div>
              </div>

              {/* Círculo de seleção (20px) */}
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: isSelected ? 'none' : '1px solid var(--line)',
                  backgroundColor: isSelected ? 'var(--accent)' : 'transparent',
                  color: 'var(--on-accent-badge)',
                  flexShrink: 0,
                  transition: 'all 180ms ease',
                }}
              >
                {isSelected && <Icon name="check" size={14} />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cartão de dados do ativo */}
      <div
        className="nexo-card"
        style={{
          padding: '10px 15px',
          borderRadius: '18px',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--line)',
          marginBottom: '14px',
        }}
      >
        <DataRow label={strings.addFunds.assetToReceive} value="USDT" />
        <DataRow label={strings.addFunds.network} value="Polygon" />
        <DataRow label={strings.addFunds.availability} value={strings.addFunds.demoAvailability} />
      </div>

      {/* Cartão de aviso */}
      <InfoCard icon="info" iconSize={18} style={{ margin: '0 0 20px' }}>
        {strings.addFunds.disclaimer}
      </InfoCard>

      {/* Botão de continuação */}
      <Button
        variant="primary"
        onClick={handleContinue}
      >
        {strings.addFunds.continuePartner}
      </Button>

      {/* Nota de rodapé (visível em DEMO_MODE) */}
      {DEMO_MODE && (
        <div
          style={{
            fontSize: 'max(var(--min-text), 8px)',
            color: 'var(--muted)',
            textAlign: 'center',
            marginTop: '14px',
          }}
        >
          {strings.addFunds.footerNote}
        </div>
      )}
    </div>
  );
};
