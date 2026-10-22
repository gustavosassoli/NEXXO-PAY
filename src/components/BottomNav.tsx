import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon, IconName } from './icons';
import { strings } from '../strings';

interface NavItemDef {
  key: string;
  label: string;
  icon: IconName;
  path: string;
}

const NAV_ITEMS: NavItemDef[] = [
  { key: 'inicio', label: strings.nav.home, icon: 'home', path: '/' },
  { key: 'carteira', label: strings.nav.wallet, icon: 'wallet', path: '/carteira' },
  { key: 'pagar', label: strings.nav.pay, icon: 'scan', path: '/pagar' },
  { key: 'atividade', label: strings.nav.activity, icon: 'activity', path: '/atividade' },
  { key: 'perfil', label: strings.nav.profile, icon: 'user', path: '/perfil' },
];

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveKey = (): string => {
    const p = location.pathname;
    if (p === '/' || p === '') return 'inicio';
    if (p.startsWith('/carteira')) return 'carteira';
    if (p.startsWith('/pagar')) return 'pagar';
    if (p.startsWith('/atividade')) return 'atividade';
    if (p.startsWith('/perfil')) return 'perfil';
    return '';
  };

  const activeKey = getActiveKey();

  return (
    <nav
      className="nexo-bottom-nav"
      aria-label="Navegação principal"
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        height: 'calc(82px + env(safe-area-inset-bottom, 0px))',
        padding:
          '10px calc(13px + env(safe-area-inset-right, 0px)) calc(15px + env(safe-area-inset-bottom, 0px)) calc(13px + env(safe-area-inset-left, 0px))',
        borderTop: '1px solid var(--line)',
        backgroundColor: 'var(--bottom-nav-bg)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        alignItems: 'flex-start',
        zIndex: 50,
        boxSizing: 'border-box',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = activeKey === item.key;
        const isPay = item.key === 'pagar';

        if (isPay) {
          return (
            <button
              key={item.key}
              type="button"
              className="nexo-bottom-nav-item nexo-bottom-nav-item--pay"
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                position: 'relative',
                color: 'var(--accent)',
              }}
            >
              {/* Elevated button box */}
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '17px',
                  backgroundColor: 'var(--accent)',
                  color: 'var(--on-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: 'translateY(-25px)',
                  boxShadow: '0 8px 25px var(--accent-pay-shadow)',
                  transition: 'transform 200ms ease',
                }}
              >
                <Icon name="scan" size={22} />
              </div>
              <span
                style={{
                  fontSize: 'max(var(--min-text), 9px)',
                  fontWeight: 600,
                  transform: 'translateY(-24px)',
                  color: 'var(--accent)',
                  lineHeight: 1,
                }}
              >
                {item.label}
              </span>
            </button>
          );
        }

        return (
          <button
            key={item.key}
            type="button"
            className={`nexo-bottom-nav-item ${isActive ? 'is-active' : ''}`}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              color: isActive ? 'var(--accent)' : 'var(--tab-inactive)',
              transition: 'color 180ms ease',
            }}
          >
            <div
              style={{
                height: '31px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name={item.icon} size={21} />
            </div>
            <span
              style={{
                fontSize: 'max(var(--min-text), 9px)',
                fontWeight: isActive ? 600 : 400,
                color: 'inherit',
                lineHeight: 1,
                marginTop: '1px',
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
