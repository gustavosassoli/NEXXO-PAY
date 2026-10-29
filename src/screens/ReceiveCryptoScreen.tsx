import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { TopBar } from '../components/TopBar';
import { DemoBadge } from '../components/DemoBadge';
import { WarningCard } from '../components/WarningCard';
import { Icon } from '../components/icons';
import { strings } from '../strings';
import { CoinType } from '../components/Coin';
import { useWallet } from '../context/WalletContext';
import { getAsset } from '../config/assets';

type CryptoNetwork = 'Polygon' | 'Ethereum' | 'Arbitrum';

export const ReceiveCryptoScreen: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected, normalizedAddress } = useWallet();

  const [selectedAsset, setSelectedAsset] = useState<CoinType>('USDC');
  const [selectedNetwork, setSelectedNetwork] = useState<CryptoNetwork>('Polygon');
  const [copied, setCopied] = useState<boolean>(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const sampleAddress = '0x71A4C8D205FA3E7819B4C04F';
  const displayAddress = isConnected && normalizedAddress ? normalizedAddress : sampleAddress;

  const assetOptions: CoinType[] = ['USDC', 'USDT', 'ETH'];
  const networkOptions: { name: CryptoNetwork; enabled: boolean }[] = [
    { name: 'Polygon', enabled: true },
    { name: 'Ethereum', enabled: false },
    { name: 'Arbitrum', enabled: false },
  ];

  // Gera o QR Code real localmente via biblioteca qrcode
  useEffect(() => {
    if (isConnected && normalizedAddress) {
      QRCode.toDataURL(normalizedAddress, {
        width: 150,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => {
          console.warn('[ReceiveCryptoScreen] Erro ao gerar QR Code local:', err);
          setQrDataUrl(null);
        });
    } else {
      setQrDataUrl(null);
    }
  }, [isConnected, normalizedAddress]);

  const handleCopy = async () => {
    if (!isConnected || !normalizedAddress) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(normalizedAddress);
      }
    } catch {
      // Fallback gracioso
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
          {assetOptions.map((asset) => {
            const assetCfg = getAsset(asset);
            const isEnabled = assetCfg?.enabled ?? false;

            if (!isEnabled) {
              return (
                <button
                  key={asset}
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="nexo-segmented-btn"
                  style={{
                    opacity: 0.4,
                    cursor: 'not-allowed',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                  title={strings.common.comingSoon}
                >
                  <span>{asset}</span>
                  <span
                    style={{
                      fontSize: 'max(var(--min-text), 7px)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em',
                      padding: '1px 3px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--surface-3)',
                      color: 'var(--muted)',
                    }}
                  >
                    {strings.common.comingSoon}
                  </span>
                </button>
              );
            }

            return (
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
            );
          })}
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
            const isActive = selectedNetwork === net.name;
            const isEnabled = net.enabled;

            return (
              <button
                key={net.name}
                type="button"
                role="radio"
                aria-checked={isActive}
                disabled={!isEnabled}
                aria-disabled={!isEnabled}
                onClick={() => isEnabled && setSelectedNetwork(net.name)}
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
                  cursor: isEnabled ? 'pointer' : 'not-allowed',
                  opacity: isEnabled ? 1 : 0.45,
                  outline: 'none',
                  transition: 'all 180ms ease',
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                }}
              >
                <span>{net.name}</span>
                {!isEnabled && (
                  <span
                    style={{
                      fontSize: 'max(var(--min-text), 6.5px)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      padding: '1px 3px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--surface-3)',
                      color: 'var(--muted)',
                    }}
                  >
                    Breve
                  </span>
                )}
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
        {/* QR Code real da carteira (quando conectado) ou grid ilustrativo (quando desconectado) */}
        {isConnected && qrDataUrl ? (
          <div
            style={{
              width: '150px',
              height: '150px',
              borderRadius: '14px',
              backgroundColor: '#FFFFFF',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
            }}
          >
            <img
              src={qrDataUrl}
              alt="QR Code do endereço"
              style={{
                width: '100%',
                height: '100%',
                display: 'block',
                borderRadius: '8px',
              }}
            />
          </div>
        ) : (
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
        )}

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
            fontFamily: 'monospace',
          }}
        >
          {displayAddress}
        </div>

        {/* Botão Copiar Endereço (Desabilitado quando desconectado) */}
        <button
          type="button"
          onClick={handleCopy}
          disabled={!isConnected}
          aria-disabled={!isConnected}
          aria-label={copied ? strings.receive.addressCopied : strings.receive.copyAddress}
          style={{
            borderRadius: '12px',
            padding: '10px 14px',
            fontSize: 'max(var(--min-text), 9px)',
            fontWeight: 700,
            backgroundColor: isConnected ? 'var(--accent)' : 'var(--surface-3)',
            color: isConnected ? 'var(--on-accent)' : 'var(--muted)',
            border: isConnected ? 'none' : '1px solid var(--line)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: isConnected ? 'pointer' : 'not-allowed',
            opacity: isConnected ? 1 : 0.6,
            outline: 'none',
            transition: 'transform 180ms ease, opacity 180ms ease',
            userSelect: 'none',
          }}
        >
          <Icon name={copied ? 'check' : 'copy'} size={17} />
          <span>{copied ? strings.receive.addressCopied : strings.receive.copyAddress}</span>
        </button>
      </div>

      {/* Aviso de Segurança */}
      <WarningCard style={{ marginBottom: '14px' }}>
        <div>
          <div style={{ fontWeight: 650, marginBottom: '2px', color: 'var(--text)' }}>
            {strings.receive.warningTitle(selectedAsset, selectedNetwork)}
          </div>
          <div>{strings.receive.warningDesc}</div>
        </div>
      </WarningCard>

      {/* Nota de privacidade */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--muted)',
          fontSize: 'max(var(--min-text), 9px)',
          lineHeight: 1.4,
          padding: '0 4px',
        }}
      >
        <Icon name="shield" size={17} style={{ flexShrink: 0 }} />
        <span>{strings.receive.neverShareSecret}</span>
      </div>
    </div>
  );
};
