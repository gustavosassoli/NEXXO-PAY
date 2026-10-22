import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { Coin } from '../components/Coin';
import { WarningCard } from '../components/WarningCard';
import { ActivityItem } from '../components/ActivityItem';
import { Icon } from '../components/icons';
import { strings } from '../strings';
import { getAsset, getAssets, getRecentActivity } from '../data/mock';
import { formatBrl, formatUsd, formatToken } from '../lib/money';
import { useToast } from '../components/Toast';

export const AssetDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const codeParam = searchParams.get('code') || 'USDT';
  const asset = getAsset(codeParam) || getAssets()[0];
  const activities = getRecentActivity(3);

  const formattedTokenAmount = formatToken(
    asset.amount,
    asset.decimals,
    asset.code
  );

  // Cotação formatada
  let quoteText = 'R$ 5,155';
  if (asset.code === 'ETH') {
    quoteText = 'R$ 13.218,00';
  }

  // Alturas das 8 barras do gráfico
  const barHeights = [25, 42, 34, 61, 52, 78, 68, 90];

  return (
    <div
      className="nexo-screen nexo-screen--asset-detail"
      style={{
        padding: '20px 20px 36px',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        minHeight: '100%',
      }}
    >
      <TopBar
        title={asset.name}
        showBack={true}
        onBack={() => navigate('/carteira')}
        actionIcon="settings"
        actionAriaLabel="Configurações"
        onAction={() => navigate('/perfil')}
      />

      {/* Herói Centralizado (padding 12/0/25) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '12px 0 25px',
          textAlign: 'center',
        }}
      >
        <Coin
          coin={asset.code}
          initial={asset.code === 'USDT' ? 'T' : asset.initial}
          size="large"
        />

        <div
          style={{
            marginTop: '12px',
            marginBottom: '4px',
            fontSize: 'max(var(--min-text), 9px)',
            color: 'var(--muted)',
            lineHeight: 1,
          }}
        >
          {strings.assetDetail.availableBalance}
        </div>

        <div
          style={{
            fontSize: 'max(var(--min-text), 25px)',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            color: 'var(--text)',
            lineHeight: 1.1,
            marginBottom: '6px',
          }}
        >
          {formattedTokenAmount}
        </div>

        <div
          style={{
            fontSize: 'max(var(--min-text), 10px)',
            color: 'var(--muted)',
            lineHeight: 1,
          }}
        >
          {formatUsd(asset.usdCents)} · {formatBrl(asset.brlCents)}
        </div>
      </div>

      {/* Três Ações (Receber, Enviar, Trocar) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
          marginBottom: '28px',
        }}
      >
        {/* Receber */}
        <button
          type="button"
          onClick={() => navigate('/receber')}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '9px',
            cursor: 'pointer',
            padding: 0,
            outline: 'none',
          }}
        >
          <div
            style={{
              width: '45px',
              height: '45px',
              borderRadius: '15px',
              backgroundColor: 'var(--accent-tint-9)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="arrowDown" size={22} />
          </div>
          <span
            style={{
              fontSize: 'max(var(--min-text), 10px)',
              fontWeight: 700,
              color: 'var(--text)',
            }}
          >
            {strings.wallet.receive}
          </span>
        </button>

        {/* Enviar */}
        <button
          type="button"
          onClick={() => showToast(strings.wallet.soonToast)}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '9px',
            cursor: 'pointer',
            padding: 0,
            outline: 'none',
          }}
        >
          <div
            style={{
              width: '45px',
              height: '45px',
              borderRadius: '15px',
              backgroundColor: 'var(--accent-tint-9)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="arrowUp" size={22} />
          </div>
          <span
            style={{
              fontSize: 'max(var(--min-text), 10px)',
              fontWeight: 700,
              color: 'var(--text)',
            }}
          >
            {strings.wallet.send}
          </span>
        </button>

        {/* Trocar */}
        <button
          type="button"
          onClick={() => showToast(strings.wallet.soonToast)}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '9px',
            cursor: 'pointer',
            padding: 0,
            outline: 'none',
          }}
        >
          <div
            style={{
              width: '45px',
              height: '45px',
              borderRadius: '15px',
              backgroundColor: 'var(--accent-tint-9)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="swap" size={22} />
          </div>
          <span
            style={{
              fontSize: 'max(var(--min-text), 10px)',
              fontWeight: 700,
              color: 'var(--text)',
            }}
          >
            {strings.wallet.swap}
          </span>
        </button>
      </div>

      {/* Cartão de Mercado (surface, padding 16, raio 18, margem 27) */}
      <div
        className="nexo-card"
        style={{
          padding: '16px',
          borderRadius: '18px',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--line)',
          marginBottom: '27px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span
              style={{
                fontSize: 'max(var(--min-text), 8px)',
                color: 'var(--muted)',
                lineHeight: 1,
              }}
            >
              {strings.assetDetail.referenceQuote}
            </span>
            <span
              style={{
                fontSize: 'max(var(--min-text), 17px)',
                fontWeight: 700,
                color: 'var(--text)',
                lineHeight: 1.1,
              }}
            >
              {quoteText}
            </span>
          </div>

          <span
            style={{
              fontSize: 'max(var(--min-text), 9px)',
              fontWeight: 600,
              color: 'var(--accent)',
            }}
          >
            {strings.assetDetail.todayChange}
          </span>
        </div>

        {/* Gráfico de 8 Barras (altura total 42, espaço 6) */}
        <div
          style={{
            height: '42px',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '6px',
          }}
        >
          {barHeights.map((pct, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${pct}%`,
                borderTopLeftRadius: '3px',
                borderTopRightRadius: '3px',
                background: 'var(--chart-bar-gradient)',
                opacity: 0.5,
              }}
            />
          ))}
        </div>
      </div>

      {/* Histórico */}
      <h2
        style={{
          margin: '0 0 14px',
          fontSize: 'max(var(--min-text), 16px)',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--text)',
        }}
      >
        {strings.assetDetail.history}
      </h2>

      {/* Lista com as 3 primeiras atividades */}
      <div
        className="nexo-card"
        style={{
          borderRadius: '19px',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--line)',
          overflow: 'hidden',
        }}
      >
        {activities.map((act, index) => {
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
                <div
                  style={{
                    height: '1px',
                    backgroundColor: 'var(--line)',
                    margin: 0,
                  }}
                />
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

      {/* Aviso de conformidade com rede */}
      <WarningCard style={{ marginTop: '15px' }}>
        {strings.assetDetail.warningForAsset(asset.code)}
      </WarningCard>
    </div>
  );
};
