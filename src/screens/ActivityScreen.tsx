import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { ActivityItem } from '../components/ActivityItem';
import { useToast } from '../components/Toast';
import { strings } from '../strings';
import { getActivities } from '../data/mock';
import { formatBrl, formatUsd, formatToken } from '../lib/money';

const FILTER_OPTIONS = [
  strings.activity.filterAll,
  strings.activity.filterPix,
  strings.activity.filterReceived,
  strings.activity.filterTransfers,
  strings.activity.filterConversions,
];

export const ActivityScreen: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [selectedFilter, setSelectedFilter] = useState<string>(strings.activity.filterAll);

  const activities = getActivities(selectedFilter);
  const todayActivities = activities.filter((a) => a.category === 'today');
  const previousActivities = activities.filter((a) => a.category === 'previous');

  return (
    <div
      style={{
        padding: '0 20px 112px 20px',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* TopBar com Marca Compacta, Título "Atividade" e ação Baixar extrato */}
      <TopBar
        showBrand
        title={strings.activity.title}
        actionIcon="download"
        actionAriaLabel={strings.activity.downloadStatement}
        onAction={() => showToast(strings.activity.downloadStatement + ' (demonstrativo)')}
      />

      {/* Pílulas de filtro roláveis horizontalmente */}
      <div
        role="region"
        aria-label="Filtros de atividade"
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '20px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {FILTER_OPTIONS.map((filter) => {
          const isActive = selectedFilter === filter;
          return (
            <button
              key={filter}
              type="button"
              aria-pressed={isActive}
              onClick={() => setSelectedFilter(filter)}
              style={{
                flexShrink: 0,
                height: '35px',
                padding: '0 15px',
                borderRadius: '18px',
                backgroundColor: isActive ? 'var(--surface-3)' : 'var(--surface)',
                border: '1px solid var(--line)',
                color: isActive ? 'var(--text)' : 'var(--muted)',
                fontSize: 'max(var(--min-text), 11px)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 180ms ease',
                outline: 'none',
                boxShadow: isActive ? '0 2px 8px var(--pill-active-shadow)' : 'none',
                userSelect: 'none',
              }}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* Grupo HOJE (exibido apenas se contiver itens) */}
      {todayActivities.length > 0 && (
        <section style={{ marginBottom: '22px' }}>
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
            {strings.activity.todayGroup}
          </div>

          <div
            style={{
              borderRadius: '17px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--line)',
              overflow: 'hidden',
            }}
          >
            {todayActivities.map((act, index) => {
              let primaryStr = '';
              if (act.brlCents !== undefined) {
                const sign = act.isNegative ? '- ' : '+ ';
                primaryStr = `${sign}${formatBrl(act.brlCents)}`;
              } else if (act.usdCents !== undefined) {
                const sign = act.isNegative ? '- ' : '+ ';
                primaryStr = `${sign}${formatUsd(act.usdCents)}`;
              }

              const tokenStr = formatToken(act.tokenAmount, act.tokenDecimals, act.tokenSymbol);
              const secondarySign = act.isNegative ? '− ' : act.type === 'incoming' ? '+ ' : '';
              const secondaryStr = `${secondarySign}${tokenStr}`;

              return (
                <div key={act.id}>
                  {index > 0 && (
                    <div style={{ height: '1px', backgroundColor: 'var(--line)' }} />
                  )}
                  <ActivityItem
                    icon={act.icon}
                    title={act.title}
                    subtitle={act.subtitle}
                    amountPrimary={primaryStr}
                    amountSecondary={secondaryStr}
                    tone={act.type}
                    onClick={() => navigate(`/atividade/detalhe?id=${act.id}`)}
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Grupo ANTERIORES (exibido apenas se contiver itens) */}
      {previousActivities.length > 0 && (
        <section style={{ marginBottom: '22px' }}>
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
            {strings.activity.previousGroup}
          </div>

          <div
            style={{
              borderRadius: '17px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--line)',
              overflow: 'hidden',
            }}
          >
            {previousActivities.map((act, index) => {
              let primaryStr = '';
              if (act.brlCents !== undefined) {
                const sign = act.isNegative ? '- ' : '+ ';
                primaryStr = `${sign}${formatBrl(act.brlCents)}`;
              } else if (act.usdCents !== undefined) {
                const sign = act.isNegative ? '- ' : '+ ';
                primaryStr = `${sign}${formatUsd(act.usdCents)}`;
              }

              const tokenStr = formatToken(act.tokenAmount, act.tokenDecimals, act.tokenSymbol);
              const secondarySign = act.isNegative ? '− ' : act.type === 'incoming' ? '+ ' : '';
              const secondaryStr = `${secondarySign}${tokenStr}`;

              return (
                <div key={act.id}>
                  {index > 0 && (
                    <div style={{ height: '1px', backgroundColor: 'var(--line)' }} />
                  )}
                  <ActivityItem
                    icon={act.icon}
                    title={act.title}
                    subtitle={act.subtitle}
                    amountPrimary={primaryStr}
                    amountSecondary={secondaryStr}
                    tone={act.type}
                    onClick={() => navigate(`/atividade/detalhe?id=${act.id}`)}
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Estado informativo com borda tracejada */}
      <div
        style={{
          border: '1px dashed var(--line)',
          borderRadius: '17px',
          padding: '18px 16px',
          textAlign: 'center',
          backgroundColor: 'var(--empty-dashed-bg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          marginTop: activities.length === 0 ? '12px' : '4px',
        }}
      >
        <span
          style={{
            fontSize: 'max(var(--min-text), 11px)',
            fontWeight: 600,
            color: 'var(--empty-title)',
          }}
        >
          {strings.activity.filtersReady}
        </span>
        <span
          style={{
            fontSize: 'max(var(--min-text), 10px)',
            color: 'var(--muted)',
            fontWeight: 400,
          }}
        >
          {strings.activity.filtersReadySub}
        </span>
      </div>
    </div>
  );
};
