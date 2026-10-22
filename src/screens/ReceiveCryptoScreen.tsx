import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { DemoBadge } from '../components/DemoBadge';
import { WarningCard } from '../components/WarningCard';
import { Icon } from '../components/icons';
import { strings } from '../strings';
import { CoinType } from '../components/Coin';

type CryptoNetwork = 'Polygon' | 'Ethereum' | 'Arbitrum';

export const ReceiveCryptoScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedAsset, setSelectedAsset] = useState<CoinType>('USDT');
  const [selectedNetwork, setSelectedNetwork] = useState<CryptoNetwork>('Polygon');
  const [copied, setCopied] = useState<boolean>(false);

  const address = '0x71A4C8D205FA3E7819B4C04F';
  const assetOptions: CoinType[] = ['USDT', 'USDC', 'ETH'];
  const networkOptions: CryptoNetwork[] = ['Polygon', 'Ethereum', 'Arbitrum'];

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(address);
      }
    } catch {
      // Fallback gracioso: o texto continua selecionável
    }
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1600);
  };

  return (
    <div
      className="nexo-screen nexo-screen--receive"
      style={{
        padding: '20px 20px 36px',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        minHeight: '100%',
      }}
    >
      <TopBar
        title={strings.receive.title}
        showBack={true}
        onBack={() => navigate('/carteira')}
      />

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
        <DemoBadge />
      </div>

      {/* Campo Criptoativo */}
      <div style={{ marginBottom: '16px' }}>
        <label
          style={{
            display: 'block',
            fontSize: 'max(var(--min-text), 10px)',
            fontWeight: 600,
            color: 'var(--text)',
            marginBottom: '8px',
          }}
        >
          {strings.receive.cryptoAsset}
        </label>
        <div
          role="radiogroup"
          aria-label={strings.receive.cryptoAsset}
          className="nexo-segmented"
        >
          {assetOptions.map((asset) => (
            <button
              key={asset}
              type="button"
              role="radio"
              aria-checked={selectedAsset === asset}
              className={`nexo-segmented-btn ${selectedAsset === asset ? 'is-active' : ''}`}
              onClick={() => setSelectedAsset(asset)}
            >
              {asset}
            </button>
          ))}
        </div>
      </div>

      {/* Campo Rede */}
      <div style={{ marginBottom: '18px' }}>
        <label
          style={{
            display: 'block',
            fontSize: 'max(var(--min-text), 10px)',
            fontWeight: 600,
            color: 'var(--text)',
            marginBottom: '8px',
          }}
        >
          {strings.receive.network}
        </label>
        <div
          role="radiogroup"
          aria-label={strings.receive.network}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '7px',
          }}
        >
          {networkOptions.map((net) => {
            const isActive = selectedNetwork === net;
            return (
              <button
                key={net}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => setSelectedNetwork(net)}
                style={{
                  height: '38px',
                  borderRadius: '12px',
                  fontSize: 'max(var(--min-text), 9px)',
                  fontWeight: isActive ? 600 : 400,
                  backgroundColor: isActive
                    ? 'var(--accent-tint-6)'
                    : 'var(--surface)',
                  border: isActive
                    ? '1px solid var(--accent-border-35)'
                    : '1px solid var(--line)',
                  color: isActive ? 'var(--accent)' : 'var(--muted)',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 180ms ease',
                  userSelect: 'none',
                }}
              >
                {net}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cartão do QR Code e Endereço */}
      <div
        className="nexo-card"
        style={{
          borderRadius: '22px',
          padding: '22px 18px 18px',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--line)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: '16px',
        }}
      >
        {/* QR Code gerado conforme a especificação: 150x150, fundo var(--qr-bg), 8x8 grid */}
        <div
          style={{
            width: '150px',
            height: '150px',
            borderRadius: '14px',
            backgroundColor: 'var(--qr-bg)',
            padding: '13px',
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            gap: '2px',
            boxSizing: 'border-box',
          }}
        >
          {Array.from({ length: 64 }, (_, i) => {
            const isFilled = (i * 7 + (i % 3)) % 5 < 2;
            return (
              <div
                key={i}
                style={{
                  borderRadius: '1px',
                  backgroundColor: isFilled ? 'var(--qr-dot)' : 'transparent',
                }}
              />
            );
          })}
        </div>

        {/* Título do endereço */}
        <div
          style={{
            marginTop: '16px',
            marginBottom: '4px',
            fontSize: 'max(var(--min-text), 11px)',
            fontWeight: 700,
            color: 'var(--text)',
            lineHeight: 1.2,
          }}
        >
          {strings.receive.receiveAddress}
        </div>

        {/* Hash do endereço */}
        <div
          style={{
            fontSize: 'max(var(--min-text), 9px)',
            color: 'var(--muted)',
            letterSpacing: '0.04em',
            wordBreak: 'break-all',
            marginBottom: '14px',
            userSelect: 'all',
          }}
        >
          {address}
        </div>

        {/* Botão Copiar Endereço */}
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? strings.receive.addressCopied : strings.receive.copyAddress}
          style={{
            borderRadius: '12px',
            padding: '10px 14px',
            fontSize: 'max(var(--min-text), 9px)',
            fontWeight: 700,
            backgroundColor: 'var(--accent)',
            color: 'var(--on-accent)',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
            outline: 'none',
            transition: 'transform 180ms ease, opacity 180ms ease',
            userSelect: 'none',
          }}
        >
          <Icon name={copied ? 'check' : 'copy'} size={17} />
          <span>{copied ? strings.receive.addressCopied : strings.receive.copyAddress}</span>
        </button>
      </div>

      {/* Cartão de Aviso */}
      <WarningCard>
        <div>
          <div style={{ fontWeight: 700, marginBottom: '2px' }}>
            {strings.receive.warningTitle(selectedAsset, selectedNetwork)}
          </div>
          <div>{strings.receive.warningDesc}</div>
        </div>
      </WarningCard>

      {/* Nota de rodapé de segurança */}
      <div
        style={{
          marginTop: '16px',
          textAlign: 'center',
          fontSize: 'max(var(--min-text), 8px)',
          color: 'var(--muted)',
        }}
      >
        {strings.receive.neverShareSecret}
      </div>
    </div>
  );
};
