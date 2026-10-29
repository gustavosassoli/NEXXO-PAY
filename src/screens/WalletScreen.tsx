import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { DemoBadge } from '../components/DemoBadge';
import { Coin } from '../components/Coin';
import { InfoCard } from '../components/InfoCard';
import { Icon } from '../components/icons';
import { strings } from '../strings';
import { mockBalances, getAssets } from '../data/mock';
import { formatBrl, formatUsd } from '../lib/money';
import { useToast } from '../components/Toast';
import { useWallet } from '../context/WalletContext';
import { getAsset } from '../config/assets';

export const WalletScreen: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    isConnected,
    isWrongNetwork,
    balanceUnits,
    balanceFormatted,
    balanceError,
    isBalanceStale,
    openWalletSheet,
  } = useWallet();
  const rawAssets = getAssets();

  // Garante que o USDC (único ativo habilitado no MVP) fique no topo da lista
  const assets = [...rawAssets].sort((a, b) => {
    if (a.code === 'USDC') return -1;
    if (b.code === 'USDC') return 1;
    return 0;
  });

  const handleAssetClick = (code: string) => {
    const assetCfg = getAsset(code);
    if (!assetCfg?.enabled) return;
    navigate(`/carteira/ativo?code=${code}`);
  };

  // Cálculo de patrimônio em USDC (1 USDC = 1 USD = 100 centavos)
  // Com rede incorreta, o saldo é bloqueado/zerado com aviso
  const usdcCents = isConnected && !isWrongNetwork ? Number(balanceUnits / 10000n) : 0;
  // Cotação de referência: 1 USDC = R$ 5,155
  const estimatedBrlCents = isConnected && !isWrongNetwork
    ? Number((BigInt(usdcCents) * 5155n + 500n) / 1000n)
    : 0;

  const displayTotalUsd = formatUsd(usdcCents);
  const displayTotalBrl = formatBrl(estimatedBrlCents);

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
          padding: '15px 0 20px',
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
          {displayTotalUsd}
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            marginBottom: !isConnected ? '14px' : '0',
          }}
        >
          <span
            style={{
              fontSize: 'max(var(--min-text), 10px)',
              color: 'var(--muted)',
            }}
          >
            ≈ {displayTotalBrl}
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

        {/* Aviso de carteira desconectada com clique para abrir o sheet */}
        {!isConnected && (
          <div
            role="button"
            tabIndex={0}
            onClick={openWalletSheet}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                openWalletSheet();
              }
            }}
            style={{
              marginTop: '12px',
              padding: '7px 14px',
              borderRadius: '12px',
              backgroundColor: 'var(--accent-tint-6)',
              border: '1px solid var(--accent-border-25)',
              color: 'var(--accent)',
              fontSize: 'max(var(--min-text), 10px)',
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              userSelect: 'none',
              maxWidth: '320px',
            }}
          >
            <Icon name="wallet" size={14} />
            <span>{strings.wallet.disconnectedNotice}</span>
          </div>
        )}

        {/* Aviso de rede incorreta */}
        {isConnected && isWrongNetwork && (
          <div
            role="button"
            tabIndex={0}
            onClick={openWalletSheet}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                openWalletSheet();
              }
            }}
            style={{
              marginTop: '12px',
              padding: '7px 14px',
              borderRadius: '12px',
              backgroundColor: 'var(--warning-bg-8)',
              border: '1px solid var(--warning-border-20)',
              color: 'var(--warning)',
              fontSize: 'max(var(--min-text), 10px)',
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              userSelect: 'none',
              maxWidth: '320px',
            }}
          >
            <Icon name="shield" size={14} />
            <span>{strings.walletSheet.wrongNetwork}: {strings.walletSheet.switchToPolygon}</span>
          </div>
        )}
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
          const assetCfg = getAsset(asset.code);
          const isEnabled = assetCfg?.enabled ?? false;

          let displayTokenAmount = '—';
          let displayUsd = '—';
          let displayBrl = '—';

          if (isEnabled) {
            displayTokenAmount = isConnected && !isWrongNetwork ? balanceFormatted : '0,00 USDC';
            displayUsd = isConnected && !isWrongNetwork ? displayTotalUsd : 'US$ 0,00';
            displayBrl = isConnected && !isWrongNetwork ? `≈ ${displayTotalBrl}` : '≈ R$ 0,00';
          }

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
                tabIndex={isEnabled ? 0 : -1}
                aria-disabled={!isEnabled}
                onClick={() => handleAssetClick(asset.code)}
                onKeyDown={(e) => {
                  if (isEnabled && (e.key === 'Enter' || e.key === ' ')) {
                    handleAssetClick(asset.code);
                  }
                }}
                className={`nexo-activity-item ${!isEnabled ? 'is-disabled' : ''}`}
                style={{
                  padding: '15px',
                  display: 'grid',
                  gridTemplateColumns: '39px 1fr auto auto',
                  gap: '10px',
                  alignItems: 'center',
                  cursor: isEnabled ? 'pointer' : 'default',
                  opacity: isEnabled ? 1 : 0.45,
                  outline: 'none',
                  userSelect: 'none',
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                    {!isEnabled && (
                      <span
                        style={{
                          fontSize: 'max(var(--min-text), 7px)',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.02em',
                          padding: '1px 4px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--surface-3)',
                          color: 'var(--muted)',
                        }}
                      >
                        {strings.common.comingSoon}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span
                      style={{
                        fontSize: 'max(var(--min-text), 8px)',
                        color: 'var(--muted)',
                        lineHeight: 1.1,
                      }}
                    >
                      {displayTokenAmount}
                    </span>
                    {isEnabled && isConnected && !isWrongNetwork && isBalanceStale && (
                      <span
                        style={{
                          fontSize: 'max(var(--min-text), 7px)',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.02em',
                          padding: '1px 3px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--warning-bg-8)',
                          color: 'var(--warning)',
                        }}
                      >
                        {strings.walletSheet.balanceStale}
                      </span>
                    )}
                  </div>
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
                    {displayUsd}
                  </span>
                  <span
                    style={{
                      fontSize: 'max(var(--min-text), 8px)',
                      color: 'var(--muted)',
                      lineHeight: 1.1,
                    }}
                  >
                    {displayBrl}
                  </span>
                </div>

                {/* Chevron para selecionáveis */}
                <div style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center' }}>
                  {isEnabled && <Icon name="chevron" size={16} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cartão de Informação */}
      <InfoCard icon="info" iconSize={18}>
        {strings.wallet.disclaimer}
      </InfoCard>
    </div>
  );
};
