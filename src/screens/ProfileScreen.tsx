import React, { useState } from 'react';
import { TopBar } from '../components/TopBar';
import { Icon, IconName } from '../components/icons';
import { BottomSheet } from '../components/BottomSheet';
import { useToast } from '../components/Toast';
import { strings } from '../strings';
import { mockUser } from '../data/mock';
import { useTheme } from '../context/ThemeContext';

type SensitiveAction = 'disconnect' | 'logout' | null;

interface PreferenceItem {
  id: string;
  icon: IconName;
  title: string;
  subtitle?: string;
}

const PREFERENCES_ITEMS: PreferenceItem[] = [
  {
    id: 'wallets',
    icon: 'wallet',
    title: strings.profile.connectedWallets,
    subtitle: strings.profile.connectedWalletsSub,
  },
  {
    id: 'currency',
    icon: 'swap',
    title: strings.profile.preferredCurrency,
    subtitle: strings.profile.preferredCurrencySub,
  },
  {
    id: 'notifications',
    icon: 'bell',
    title: strings.profile.notifications,
    subtitle: strings.profile.notificationsSub,
  },
  {
    id: 'limits',
    icon: 'settings',
    title: strings.profile.paymentLimits,
    subtitle: strings.profile.paymentLimitsSub,
  },
  {
    id: 'help',
    icon: 'help',
    title: strings.profile.helpCenter,
  },
  {
    id: 'terms',
    icon: 'file',
    title: strings.profile.termsAndPrivacy,
  },
];

import { useWallet } from '../context/WalletContext';

export const ProfileScreen: React.FC = () => {
  const { showToast } = useToast();
  const { theme, setTheme } = useTheme();
  const { isConnected, openWalletSheet, disconnectWallet } = useWallet();
  const [biometryEnabled, setBiometryEnabled] = useState<boolean>(true);
  const [activeAction, setActiveAction] = useState<SensitiveAction>(null);

  const handleActionConfirm = async () => {
    const action = activeAction;
    setActiveAction(null);
    if (action === 'disconnect') {
      await disconnectWallet();
      showToast('Carteira desconectada');
    } else {
      showToast(strings.profile.actionSimulated);
    }
  };

  return (
    <div
      style={{
        padding: '0 20px 112px 20px',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* TopBar com Marca Compacta, Título "Perfil" e Ação Configurações */}
      <TopBar
        showBrand
        title={strings.profile.title}
        actionIcon="settings"
        actionAriaLabel="Configurações"
        onAction={() => showToast(strings.wallet.soonToast)}
      />

      {/* Cartão de Usuário */}
      <section
        style={{
          borderRadius: '18px',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--line)',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          marginBottom: '24px',
        }}
      >
        {/* Avatar com Iniciais */}
        <div
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '16px',
            backgroundColor: 'var(--profile-avatar-bg)',
            color: 'var(--accent)',
            fontSize: 'max(var(--min-text), 16px)',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {mockUser.initials}
        </div>

        {/* Informações da Conta */}
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, gap: '2px' }}>
          <span
            style={{
              fontSize: 'max(var(--min-text), 16px)',
              fontWeight: 700,
              color: 'var(--text)',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {mockUser.name}
          </span>
          <span
            style={{
              fontSize: 'max(var(--min-text), 11px)',
              fontWeight: 400,
              color: 'var(--muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {mockUser.email}
          </span>

          {/* Selo demonstrativo de conta */}
          <div style={{ marginTop: '4px' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: 'var(--profile-badge-bg)',
                color: 'var(--demo-badge-text)',
                fontSize: 'max(var(--min-text), 9px)',
                fontWeight: 600,
                letterSpacing: '0.04em',
              }}
            >
              {strings.profile.demoAccount}
            </span>
          </div>
        </div>
      </section>

      {/* Seção Segurança */}
      <section style={{ marginBottom: '24px' }}>
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
          {strings.profile.security}
        </div>

        <div
          style={{
            borderRadius: '17px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--line)',
            overflow: 'hidden',
          }}
        >
          {/* Linha 1: Biometria com Switch */}
          <div
            style={{
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ color: 'var(--profile-menu-icon)', flexShrink: 0 }}>
                <Icon name="shield" size={20} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span
                  style={{
                    fontSize: 'max(var(--min-text), 12px)',
                    fontWeight: 600,
                    color: 'var(--text)',
                  }}
                >
                  {strings.profile.biometry}
                </span>
                <span
                  style={{
                    fontSize: 'max(var(--min-text), 10px)',
                    color: 'var(--muted)',
                  }}
                >
                  {strings.profile.biometrySub}
                </span>
              </div>
            </div>

            {/* Switch acessível conforme especificação (40x23px, transição 200ms) */}
            <button
              type="button"
              role="switch"
              aria-checked={biometryEnabled}
              aria-label={strings.profile.biometry}
              onClick={() => setBiometryEnabled((prev) => !prev)}
              style={{
                width: '40px',
                height: '23px',
                borderRadius: '12px',
                backgroundColor: biometryEnabled ? 'var(--accent)' : 'var(--switch-track-off)',
                border: 'none',
                padding: '3px',
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                transition: 'background-color 200ms ease',
                flexShrink: 0,
                outline: 'none',
              }}
            >
              <span
                style={{
                  width: '17px',
                  height: '17px',
                  borderRadius: '50%',
                  backgroundColor: biometryEnabled ? 'var(--switch-thumb-on)' : 'var(--switch-thumb-off)',
                  transform: biometryEnabled ? 'translateX(17px)' : 'translateX(0)',
                  transition: 'transform 200ms ease, background-color 200ms ease',
                  display: 'block',
                }}
              />
            </button>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--line)' }} />

          {/* Linha 2: Segurança da conta */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => showToast(strings.wallet.soonToast)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                showToast(strings.wallet.soonToast);
              }
            }}
            style={{
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ color: 'var(--profile-menu-icon)', flexShrink: 0 }}>
                <Icon name="lock" size={20} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span
                  style={{
                    fontSize: 'max(var(--min-text), 12px)',
                    fontWeight: 600,
                    color: 'var(--text)',
                  }}
                >
                  {strings.profile.accountSecurity}
                </span>
                <span
                  style={{
                    fontSize: 'max(var(--min-text), 10px)',
                    color: 'var(--muted)',
                  }}
                >
                  {strings.profile.accountSecuritySub}
                </span>
              </div>
            </div>

            <div style={{ color: 'var(--muted)', flexShrink: 0 }}>
              <Icon name="chevron" size={16} />
            </div>
          </div>
        </div>
      </section>

      {/* Seção Preferências e Suporte */}
      <section style={{ marginBottom: '24px' }}>
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
          {strings.profile.preferencesAndSupport}
        </div>

        <div
          style={{
            borderRadius: '17px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--line)',
            overflow: 'hidden',
          }}
        >
          {/* Linha de Seleção de Aparência (Tema Escuro / Claro) */}
          <div
            style={{
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
              <div style={{ color: 'var(--profile-menu-icon)', flexShrink: 0 }}>
                <Icon name={theme === 'dark' ? 'moon' : 'sun'} size={20} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                <span
                  style={{
                    fontSize: 'max(var(--min-text), 12px)',
                    fontWeight: 600,
                    color: 'var(--text)',
                  }}
                >
                  {strings.profile.appearance}
                </span>
                <span
                  style={{
                    fontSize: 'max(var(--min-text), 10px)',
                    color: 'var(--muted)',
                  }}
                >
                  {theme === 'dark' ? strings.profile.themeDark : strings.profile.themeLight}
                </span>
              </div>
            </div>

            {/* Controle segmentado com role="radiogroup" */}
            <div
              role="radiogroup"
              aria-label={strings.profile.appearance}
              style={{
                display: 'inline-flex',
                backgroundColor: 'var(--rail-bg)',
                padding: '3px',
                borderRadius: '12px',
                gap: '3px',
              }}
            >
              <button
                type="button"
                role="radio"
                aria-checked={theme === 'dark'}
                onClick={() => setTheme('dark')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 11px',
                  borderRadius: '9px',
                  border: 'none',
                  backgroundColor: theme === 'dark' ? 'var(--surface-3)' : 'transparent',
                  color: theme === 'dark' ? 'var(--text)' : 'var(--muted)',
                  fontSize: 'max(var(--min-text), 10px)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: theme === 'dark' ? '0 2px 6px var(--segmented-shadow)' : 'none',
                  transition: 'all 180ms ease',
                  outline: 'none',
                  userSelect: 'none',
                }}
              >
                <Icon name="moon" size={13} />
                <span>{strings.profile.themeDark}</span>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={theme === 'light'}
                onClick={() => setTheme('light')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 11px',
                  borderRadius: '9px',
                  border: 'none',
                  backgroundColor: theme === 'light' ? 'var(--surface-3)' : 'transparent',
                  color: theme === 'light' ? 'var(--text)' : 'var(--muted)',
                  fontSize: 'max(var(--min-text), 10px)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: theme === 'light' ? '0 2px 6px var(--segmented-shadow)' : 'none',
                  transition: 'all 180ms ease',
                  outline: 'none',
                  userSelect: 'none',
                }}
              >
                <Icon name="sun" size={13} />
                <span>{strings.profile.themeLight}</span>
              </button>
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--line)' }} />

          {PREFERENCES_ITEMS.map((item, idx) => {
            const isWallets = item.id === 'wallets';
            const subtitle = isWallets
              ? isConnected
                ? strings.profile.connectedWalletsOne
                : strings.profile.connectedWalletsNone
              : item.subtitle;

            const handleClick = isWallets
              ? () => openWalletSheet()
              : () => showToast(strings.wallet.soonToast);

            return (
              <div key={item.id}>
                {idx > 0 && <div style={{ height: '1px', backgroundColor: 'var(--line)' }} />}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={handleClick}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleClick();
                    }
                  }}
                  style={{
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div style={{ color: 'var(--profile-menu-icon)', flexShrink: 0 }}>
                      <Icon name={item.icon} size={20} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                      <span
                        style={{
                          fontSize: 'max(var(--min-text), 12px)',
                          fontWeight: 600,
                          color: 'var(--text)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.title}
                      </span>
                      {subtitle && (
                        <span
                          style={{
                            fontSize: 'max(var(--min-text), 10px)',
                            color: 'var(--muted)',
                          }}
                        >
                          {subtitle}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ color: 'var(--muted)', flexShrink: 0 }}>
                    <Icon name="chevron" size={16} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Cartão de Ações Sensíveis (Desconectar carteira e Encerrar sessão) */}
      <section style={{ marginBottom: '24px' }}>
        <div
          style={{
            borderRadius: '17px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--line)',
            overflow: 'hidden',
          }}
        >
          {/* Desconectar carteira */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setActiveAction('disconnect')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setActiveAction('disconnect');
              }
            }}
            style={{
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              userSelect: 'none',
              color: 'var(--danger)',
            }}
          >
            <div style={{ flexShrink: 0 }}>
              <Icon name="logout" size={20} />
            </div>
            <span
              style={{
                fontSize: 'max(var(--min-text), 12px)',
                fontWeight: 600,
              }}
            >
              {strings.profile.disconnectWallet}
            </span>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--line)' }} />

          {/* Encerrar sessão */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setActiveAction('logout')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setActiveAction('logout');
              }
            }}
            style={{
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              userSelect: 'none',
              color: 'var(--danger)',
            }}
          >
            <div style={{ flexShrink: 0 }}>
              <Icon name="logout" size={20} />
            </div>
            <span
              style={{
                fontSize: 'max(var(--min-text), 12px)',
                fontWeight: 600,
              }}
            >
              {strings.profile.logout}
            </span>
          </div>
        </div>
      </section>

      {/* Rodapé informativo de segurança */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '7px',
          color: 'var(--muted)',
          fontSize: 'max(var(--min-text), 10px)',
          textAlign: 'center',
          paddingBottom: '16px',
        }}
      >
        <Icon name="shield" size={14} />
        <span>{strings.profile.neverAskSecret}</span>
      </div>

      {/* Bottom Sheet de Confirmação de Ação */}
      <BottomSheet
        isOpen={activeAction !== null}
        onClose={() => setActiveAction(null)}
        onConfirm={handleActionConfirm}
        title={strings.profile.confirmAction}
        description={
          activeAction === 'disconnect'
            ? strings.profile.disconnectConfirmText
            : strings.profile.logoutConfirmText
        }
        confirmLabel={
          activeAction === 'disconnect'
            ? strings.profile.disconnectWallet
            : strings.profile.logout
        }
      />
    </div>
  );
};
