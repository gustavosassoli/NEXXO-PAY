import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { IconName } from '../components/icons';
import { DemoBadge } from '../components/DemoBadge';
import { strings } from '../strings';

interface PlaceholderScreenProps {
  title: string;
  showBack?: boolean;
  backPath?: string;
  showBrand?: boolean;
  actionIcon?: IconName;
  onAction?: () => void;
  showBottomPadding?: boolean;
}

export const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({
  title,
  showBack = false,
  backPath,
  showBrand = false,
  actionIcon,
  onAction,
  showBottomPadding = false,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <div
      className="nexo-screen"
      style={{
        padding: `20px 20px ${showBottomPadding ? '112px' : '36px'}`,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        boxSizing: 'border-box',
      }}
    >
      <TopBar
        title={title}
        showBack={showBack}
        onBack={handleBack}
        showBrand={showBrand}
        actionIcon={actionIcon}
        onAction={onAction}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          padding: '40px 20px',
          textAlign: 'center',
        }}
      >
        <DemoBadge style={{ marginBottom: '24px' }} />

        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent)',
            marginBottom: '16px',
          }}
        >
          <span style={{ fontSize: '24px' }}>🚧</span>
        </div>

        <h1
          style={{
            fontSize: 'max(var(--min-text), 20px)',
            fontWeight: 700,
            color: 'var(--text)',
            margin: '0 0 8px',
          }}
        >
          {strings.common.underConstruction}
        </h1>

        <p
          style={{
            fontSize: 'max(var(--min-text), 11px)',
            color: 'var(--muted)',
            margin: 0,
            maxWidth: '260px',
            lineHeight: 1.5,
          }}
        >
          {strings.common.underConstructionDesc}
        </p>
      </div>
    </div>
  );
};
