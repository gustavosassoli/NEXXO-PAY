import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { DemoBadge } from '../components/DemoBadge';
import { Coin } from '../components/Coin';
import { InfoCard } from '../components/InfoCard';
import { Icon } from '../components/icons';
import { strings } from '../strings';
import { mockBalances, getAssets } from '../data/mock';
import { formatBrl, formatUsd, formatToken } from '../lib/money';
import { useToast } from '../components/Toast';

export const WalletScreen: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const assets = getAssets();

  const handleAssetClick = (code: string) => {
    navigate(`/carteira/ativo?code=${code}`);
  };

  return (
    <div
      className="nexo-screen nexo-screen--wallet"
      style={{
        padding: '20px 20px 112px',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        minHeight: '100%',
      }}
    >
      <TopBar
        title={strings.wallet.title}
        showBrand={true}
        actionIcon="settings"
        actionAriaLabel="Configurações"
        onAction={() => navigate('/perfil')}
      />

      {/* Total Centralizado (padding 15/0/25) */}
      <div
        style={{
          textAlign: 'center',
          padding: '15px 0 25px',
        }}
      >
        <div
          style={{
            fontSize: 'max(var(--min-text), 10px)',
            color: 'var(--muted)',
            marginBottom: '6px',
            lineHeight: 1,
          }}
        >
          {strings.wallet.totalBalance}
        </div>

        <div
          style={{
            fontSize: 'max(var(--min-text), 31px)',
            fontWeight: 700,
            letterSpacing: '-0.045em',
            color: 'var(--text)',
            lineHeight: 1.1,
            marginBottom: '10px',
          }}
        >
          {formatUsd(mockBalances.totalUsdCents)}
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontSize: 'max(var(--min-text), 10px)',
              color: 'var(--muted)',
            }}
          >
            ≈ {formatBrl(mockBalances.estimatedBrlCents)}
          </span>
          <span
            style={{
              fontSize: 'max(var(--min-text), 10px)',
              fontWeight: 600,
              color: 'var(--accent)',
            }}
          >
            {mockBalances.todayChangePercent}
          </span>
          <DemoBadge />
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
              transition: 'transform 200ms ease',
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
              transition: 'transform 200ms ease',
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
              transition: 'transform 200ms ease',
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

      {/* Seus ativos */}
      <h2
        style={{
          margin: '0 0 14px',
          fontSize: 'max(var(--min-text), 16px)',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--text)',
        }}
      >
        {strings.wallet.yourAssets}
      </h2>

      {/* Lista de Ativos (raio 20) */}
      <div
        className="nexo-card"
        style={{
          borderRadius: '20px',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--line)',
          overflow: 'hidden',
          marginBottom: '15px',
        }}
      >
        {assets.map((asset, index) => {
          const formattedTokenAmount = formatToken(
            asset.amount,
            asset.decimals,
            asset.code
          );

          return (
            <div key={asset.code}>
              {index > 0 && (
                <div
                  style={{
                    height: '1px',
                    backgroundColor: 'var(--line)',
                    margin: 0,
                  }}
                />
              )}
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleAssetClick(asset.code)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleAssetClick(asset.code);
                  }
                }}
                className="nexo-activity-item"
                style={{
                  padding: '15px',
                  display: 'grid',
                  gridTemplateColumns: '39px 1fr auto 17px',
                  gap: '10px',
                  alignItems: 'center',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {/* Moeda */}
                <Coin
                  coin={asset.code}
                  initial={asset.initial}
                  size="small"
                />

                {/* Código e Quantidade */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span
                    style={{
                      fontSize: 'max(var(--min-text), 11px)',
                      fontWeight: 700,
                      color: 'var(--text)',
                      lineHeight: 1.1,
                    }}
                  >
                    {asset.code}
                  </span>
                  <span
                    style={{
                      fontSize: 'max(var(--min-text), 8px)',
                      color: 'var(--muted)',
                      lineHeight: 1.1,
                    }}
                  >
                    {formattedTokenAmount}
                  </span>
                </div>

                {/* Valores em Dólar e Reais */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '3px',
                  }}
                >
                  <span
                    style={{
                      fontSize: 'max(var(--min-text), 11px)',
                      fontWeight: 700,
                      color: 'var(--text)',
                      lineHeight: 1.1,
                    }}
                  >
                    {formatUsd(asset.usdCents)}
                  </span>
                  <span
                    style={{
                      fontSize: 'max(var(--min-text), 8px)',
                      color: 'var(--muted)',
                      lineHeight: 1.1,
                    }}
                  >
                    {formatBrl(asset.brlCents)}
                  </span>
                </div>

                {/* Chevron */}
                <div style={{ color: 'var(--muted)', display: 'flex', justifyContent: 'flex-end' }}>
                  <Icon name="chevron" size={17} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cartão de Informação */}
      <InfoCard icon="info" iconSize={18} style={{ margin: 0 }}>
        {strings.wallet.disclaimer}
      </InfoCard>
    </div>
  );
};
