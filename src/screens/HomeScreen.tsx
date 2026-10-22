import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brand } from '../components/Brand';
import { IconButton } from '../components/IconButton';
import { DemoBadge } from '../components/DemoBadge';
import { SectionTitle } from '../components/SectionTitle';
import { Coin } from '../components/Coin';
import { ActivityItem } from '../components/ActivityItem';
import { Icon } from '../components/icons';
import { strings } from '../strings';
import { mockUser, mockBalances, mockAssets, mockActivities } from '../data/mock';
import { formatBrl, formatUsd, formatToken } from '../lib/money';

export const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [balanceHidden, setBalanceHidden] = useState<boolean>(false);

  // Formatações dinâmicas
  const formattedUsd = balanceHidden
    ? strings.home.hiddenBalanceUsd
    : formatUsd(mockBalances.totalUsdCents);

  const formattedBrl = balanceHidden
    ? strings.home.hiddenBalanceBrl
    : `≈ ${formatBrl(mockBalances.estimatedBrlCents)}`;

  const recentActivities = mockActivities.slice(0, 3);

  return (
    <div
      className="nexo-screen nexo-screen--home"
      style={{
        padding: '20px 20px 112px',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        minHeight: '100%',
      }}
    >
      {/* 1. Cabeçalho (margem 4px topo, 0px lados, 22px base) */}
      <header
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginTop: '4px',
          marginBottom: '22px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Brand />
          <span
            style={{
              marginTop: '12px',
              fontSize: 'max(var(--min-text), 14px)',
              color: 'var(--muted)',
              fontWeight: 400,
              lineHeight: 1,
            }}
          >
            {strings.home.greeting}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          {/* Botão de notificações com badge pontilhado verde */}
          <IconButton
            icon="bell"
            badgeDot={true}
            aria-label={strings.home.notificationsAria}
            onClick={() => navigate('/perfil')}
          />

          {/* Avatar GM do perfil */}
          <button
            type="button"
            aria-label={strings.home.profileAria}
            onClick={() => navigate('/perfil')}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '14px',
              border: '1px solid var(--accent-border-25)',
              background: 'var(--avatar-home-gradient)',
              color: 'var(--accent)',
              fontSize: 'max(var(--min-text), 13px)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
              outline: 'none',
              flexShrink: 0,
              transition: 'transform 200ms ease',
            }}
          >
            {mockUser.initials}
          </button>
        </div>
      </header>

      {/* 2. Cartão de Saldo Principal */}
      <section
        className="nexo-card nexo-card--balance"
        style={{
          minHeight: '207px',
          padding: '22px',
          borderRadius: '24px',
          background: 'var(--balance-card-gradient)',
          border: '1px solid var(--balance-card-border)',
          boxShadow: '0 22px 45px var(--card-shadow)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        {/* Brilho de fundo no canto superior direito */}
        <div
          style={{
            position: 'absolute',
            right: '-60px',
            top: '-70px',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent)',
            opacity: 0.08,
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />

        {/* Linha: Saldo disponível + Botão alternar visibilidade */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <span
            style={{
              fontSize: 'max(var(--min-text), 13px)',
              color: 'var(--label-balance)',
              fontWeight: 400,
            }}
          >
            {strings.home.availableBalance}
          </span>

          <button
            type="button"
            aria-label={strings.home.hideBalanceAria}
            onClick={() => setBalanceHidden(!balanceHidden)}
            style={{
              background: 'none',
              border: 'none',
              padding: '4px',
              margin: '-4px',
              cursor: 'pointer',
              color: 'var(--muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              outline: 'none',
              transition: 'color 150ms ease',
            }}
          >
            <Icon name={balanceHidden ? 'eyeOff' : 'eye'} size={18} />
          </button>
        </div>

        {/* Valor do saldo principal em dólar */}
        <div
          style={{
            marginTop: '17px',
            fontSize: 'max(var(--min-text), 32px)',
            fontWeight: 700,
            letterSpacing: '-0.045em',
            color: 'var(--text)',
            lineHeight: 1.1,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {formattedUsd}
        </div>

        {/* Sub-valor em reais + cotação estimada */}
        <div
          style={{
            marginTop: '8px',
            display: 'flex',
            alignItems: 'baseline',
            gap: '8px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <span
            style={{
              fontSize: 'max(var(--min-text), 14px)',
              color: 'var(--balance-brl)',
              fontWeight: 400,
            }}
          >
            {formattedBrl}
          </span>
          <span
            style={{
              fontSize: 'max(var(--min-text), 10px)',
              color: 'var(--muted)',
              fontWeight: 400,
            }}
          >
            {strings.home.estimatedRate}
          </span>
        </div>

        {/* Rodapé fixado na base do cartão */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '15px',
            borderTop: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Indicador Carteira protegida com ponto brilhante */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent)',
                boxShadow: '0 0 8px var(--accent-dot-glow)',
                display: 'inline-block',
              }}
            />
            <span
              style={{
                fontSize: 'max(var(--min-text), 10px)',
                color: 'var(--muted)',
                fontWeight: 400,
              }}
            >
              {strings.home.protectedWallet}
            </span>
          </div>

          {/* Selo demonstrativo */}
          <DemoBadge />
        </div>
      </section>

      {/* 3. Ações rápidas (grade 1.25 / 1 / 1, espaço 10, margem 14/0/29) */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '1.25fr 1fr 1fr',
          gap: '10px',
          marginTop: '14px',
          marginBottom: '29px',
        }}
      >
        {/* Pagar com Pix (Ação primária destacada em accent) */}
        <button
          type="button"
          onClick={() => navigate('/pagar')}
          style={{
            minHeight: '102px',
            padding: '12px 8px',
            borderRadius: '18px',
            backgroundColor: 'var(--accent)',
            border: '1px solid var(--accent)',
            boxShadow: '0 12px 28px var(--accent-action-shadow)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '9px',
            cursor: 'pointer',
            textAlign: 'center',
            outline: 'none',
            userSelect: 'none',
            transition: 'transform 200ms ease, opacity 200ms ease',
          }}
          className="nexo-action-card nexo-action-card--primary"
        >
          <div
            style={{
              width: '37px',
              height: '37px',
              borderRadius: '12px',
              backgroundColor: 'var(--action-icon-bg-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--on-accent)',
            }}
          >
            <Icon name="scan" size={24} />
          </div>
          <span
            style={{
              fontSize: 'max(var(--min-text), 11px)',
              fontWeight: 600,
              color: 'var(--on-accent)',
              lineHeight: 1.2,
            }}
          >
            {strings.home.payWithPix}
          </span>
        </button>

        {/* Receber cripto */}
        <button
          type="button"
          onClick={() => navigate('/receber')}
          style={{
            minHeight: '102px',
            padding: '12px 8px',
            borderRadius: '18px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--line)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '9px',
            cursor: 'pointer',
            textAlign: 'center',
            outline: 'none',
            userSelect: 'none',
            transition: 'transform 200ms ease, background-color 200ms ease',
          }}
          className="nexo-action-card"
        >
          <div
            style={{
              width: '37px',
              height: '37px',
              borderRadius: '12px',
              backgroundColor: 'var(--accent-tint-8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)',
            }}
          >
            <Icon name="arrowDown" size={22} />
          </div>
          <span
            style={{
              fontSize: 'max(var(--min-text), 10px)',
              fontWeight: 600,
              color: 'var(--text)',
              lineHeight: 1.2,
            }}
          >
            {strings.home.receiveCrypto}
          </span>
        </button>

        {/* Adicionar fundos */}
        <button
          type="button"
          onClick={() => navigate('/adicionar-fundos')}
          style={{
            minHeight: '102px',
            padding: '12px 8px',
            borderRadius: '18px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--line)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '9px',
            cursor: 'pointer',
            textAlign: 'center',
            outline: 'none',
            userSelect: 'none',
            transition: 'transform 200ms ease, background-color 200ms ease',
          }}
          className="nexo-action-card"
        >
          <div
            style={{
              width: '37px',
              height: '37px',
              borderRadius: '12px',
              backgroundColor: 'var(--accent-tint-8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)',
            }}
          >
            <Icon name="plus" size={22} />
          </div>
          <span
            style={{
              fontSize: 'max(var(--min-text), 10px)',
              fontWeight: 600,
              color: 'var(--text)',
              lineHeight: 1.2,
            }}
          >
            {strings.home.addFunds}
          </span>
        </button>
      </section>

      {/* 4. Seus ativos */}
      <section style={{ marginBottom: '29px' }}>
        <SectionTitle
          title={strings.home.yourAssets}
          actionLabel={strings.home.viewWallet}
          onAction={() => navigate('/carteira')}
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '9px',
          }}
        >
          {mockAssets.map((asset) => (
            <div
              key={asset.code}
              onClick={() => navigate('/carteira/ativo')}
              className="nexo-asset-card"
              role="button"
              tabIndex={0}
              style={{
                padding: '12px 11px',
                borderRadius: '17px',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--line)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
                cursor: 'pointer',
                transition: 'transform 200ms ease, border-color 200ms ease',
                outline: 'none',
              }}
            >
              {/* Linha superior: Moeda e Códigos */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Coin coin={asset.code} initial={asset.initial} size="small" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
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
                      fontWeight: 400,
                      color: 'var(--muted)',
                      lineHeight: 1.1,
                    }}
                  >
                    {asset.name}
                  </span>
                </div>
              </div>

              {/* Linha inferior: Valor em dólar */}
              <div
                style={{
                  fontSize: 'max(var(--min-text), 9px)',
                  fontWeight: 700,
                  color: 'var(--asset-usd)',
                }}
              >
                {formatUsd(asset.usdCents)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Atividade recente */}
      <section>
        <SectionTitle
          title={strings.home.recentActivity}
          actionLabel={strings.home.viewAll}
          onAction={() => navigate('/atividade')}
        />

        <div
          className="nexo-card nexo-card--list"
          style={{
            borderRadius: '19px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--line)',
            overflow: 'hidden',
          }}
        >
          {recentActivities.map((act, index) => {
            // Formatação do valor principal (em R$ ou US$)
            let primaryStr = '';
            if (act.brlCents !== undefined) {
              const sign = act.isNegative ? '- ' : '+ ';
              primaryStr = `${sign}${formatBrl(act.brlCents)}`;
            } else if (act.usdCents !== undefined) {
              const sign = act.isNegative ? '- ' : '+ ';
              primaryStr = `${sign}${formatUsd(act.usdCents)}`;
            }

            // Formatação do valor secundário em cripto
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
                      margin: '0',
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
      </section>
    </div>
  );
};
