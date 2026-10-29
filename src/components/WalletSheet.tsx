/**
 * NEXO PAY - Bottom Sheet de Conexão e Gestão da Carteira Web3
 */

import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './icons';
import { Button } from './Button';
import { strings } from '../strings';
import { useWallet } from '../context/WalletContext';
import { abbreviateAddress, getFriendlyWalletErrorMessage } from '../lib/wallet';
import { useToast } from './Toast';

export const WalletSheet: React.FC = () => {
  const {
    isConnected,
    isConnecting,
    isWrongNetwork,
    normalizedAddress,
    targetChainName,
    isWalletSheetOpen,
    closeWalletSheet,
    connectMetaMask,
    connectWalletConnect,
    disconnectWallet,
    switchToPolygon,
    balanceFormatted,
    isLoadingBalance,
    balanceError,
    isBalanceStale,
  } = useWallet();

  const { showToast } = useToast();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSwitching, setIsSwitching] = useState<boolean>(false);
  const [showConfirmDisconnect, setShowConfirmDisconnect] = useState<boolean>(false);

  const dialogRef = useRef<HTMLDivElement>(null);

  // Limpa mensagens ao abrir/fechar
  useEffect(() => {
    if (isWalletSheetOpen) {
      setErrorMessage(null);
      setShowConfirmDisconnect(false);
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isWalletSheetOpen]);

  // Tecla Escape para fechar
  useEffect(() => {
    if (!isWalletSheetOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeWalletSheet();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWalletSheetOpen, closeWalletSheet]);

  if (!isWalletSheetOpen) return null;

  const handleConnectMetaMask = async () => {
    setErrorMessage(null);
    try {
      await connectMetaMask();
      closeWalletSheet();
    } catch (err: unknown) {
      setErrorMessage(getFriendlyWalletErrorMessage(err));
    }
  };

  const handleConnectWalletConnect = async () => {
    setErrorMessage(null);
    try {
      await connectWalletConnect();
      closeWalletSheet();
    } catch (err: unknown) {
      setErrorMessage(getFriendlyWalletErrorMessage(err));
    }
  };

  const handleSwitchNetwork = async () => {
    setIsSwitching(true);
    setErrorMessage(null);
    try {
      await switchToPolygon();
    } catch (err: unknown) {
      setErrorMessage(getFriendlyWalletErrorMessage(err));
    } finally {
      setIsSwitching(false);
    }
  };

  const handleCopyAddress = async () => {
    if (!normalizedAddress) return;
    try {
      await navigator.clipboard.writeText(normalizedAddress);
      showToast(strings.walletSheet.addressCopied);
    } catch {
      // Fallback silencioso
    }
  };

  const handleExecuteDisconnect = async () => {
    await disconnectWallet();
    setShowConfirmDisconnect(false);
    closeWalletSheet();
    showToast('Carteira desconectada');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="wallet-sheet-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      {/* Backdrop com blur */}
      <div
        onClick={closeWalletSheet}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'var(--sheet-backdrop)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
        aria-hidden="true"
      />

      {/* Caixa do Bottom Sheet */}
      <div
        ref={dialogRef}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '430px',
          backgroundColor: 'var(--sheet-bg)',
          borderTopLeftRadius: '25px',
          borderTopRightRadius: '25px',
          borderTop: '1px solid var(--line)',
          borderLeft: '1px solid var(--line)',
          borderRight: '1px solid var(--line)',
          padding: '12px 20px 28px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -10px 40px var(--sheet-shadow)',
          animation: 'nexo-sheet-slide-up 240ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Puxador (handle) */}
        <div
          style={{
            width: '38px',
            height: '4px',
            backgroundColor: 'var(--sheet-handle)',
            borderRadius: '2px',
            margin: '0 auto 18px',
          }}
          aria-hidden="true"
        />

        {/* Confirmação de Desconexão (quando solicitada) */}
        {showConfirmDisconnect ? (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                backgroundColor: 'var(--danger-bg-8)',
                border: '1px solid var(--danger-border-20)',
                color: 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Icon name="shield" size={26} />
            </div>

            <h3
              style={{
                margin: '0 0 8px',
                fontSize: 'max(var(--min-text), 18px)',
                fontWeight: 700,
                color: 'var(--text)',
              }}
            >
              {strings.profile.disconnectWallet}
            </h3>

            <p
              style={{
                margin: '0 0 20px',
                fontSize: 'max(var(--min-text), 11px)',
                lineHeight: 1.5,
                color: 'var(--muted)',
              }}
            >
              {strings.profile.disconnectConfirmText}
            </p>

            <Button
              variant="danger"
              fullWidth
              onClick={handleExecuteDisconnect}
              style={{ marginBottom: '8px' }}
            >
              {strings.profile.disconnectWallet}
            </Button>

            <Button
              variant="ghost"
              fullWidth
              onClick={() => setShowConfirmDisconnect(false)}
            >
              {strings.common.cancel}
            </Button>
          </div>
        ) : isWrongNetwork ? (
          /* ESTADO (C): REDE INCORRETA */
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                backgroundColor: 'var(--warning-bg-8)',
                border: '1px solid var(--warning-border-20)',
                color: 'var(--warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Icon name="shield" size={26} />
            </div>

            <h3
              id="wallet-sheet-title"
              style={{
                margin: '0 0 8px',
                fontSize: 'max(var(--min-text), 18px)',
                fontWeight: 700,
                color: 'var(--text)',
              }}
            >
              {strings.walletSheet.wrongNetwork}
            </h3>

            <p
              style={{
                margin: '0 0 20px',
                fontSize: 'max(var(--min-text), 11px)',
                lineHeight: 1.5,
                color: 'var(--muted)',
              }}
            >
              {strings.walletSheet.wrongNetworkDesc}
            </p>

            {errorMessage && (
              <div
                style={{
                  fontSize: 'max(var(--min-text), 11px)',
                  color: 'var(--warning)',
                  marginBottom: '14px',
                  lineHeight: 1.4,
                }}
              >
                {errorMessage}
              </div>
            )}

            <Button
              variant="primary"
              fullWidth
              onClick={handleSwitchNetwork}
              disabled={isSwitching}
              style={{ marginBottom: '8px' }}
            >
              {isSwitching ? strings.walletSheet.switchingNetwork : strings.walletSheet.switchToPolygon}
            </Button>

            <Button
              variant="ghost"
              fullWidth
              onClick={() => setShowConfirmDisconnect(true)}
            >
              {strings.walletSheet.disconnectWallet}
            </Button>
          </div>
        ) : isConnecting ? (
          /* ESTADO (B): CONECTANDO */
          <div style={{ textAlign: 'center', padding: '24px 0 16px' }}>
            <div
              className="nexo-spinner"
              style={{ margin: '0 auto 20px', width: '36px', height: '36px' }}
            />

            <h3
              id="wallet-sheet-title"
              style={{
                margin: '0 0 8px',
                fontSize: 'max(var(--min-text), 17px)',
                fontWeight: 700,
                color: 'var(--text)',
              }}
            >
              {strings.walletSheet.connecting}
            </h3>

            <p
              style={{
                margin: '0 0 24px',
                fontSize: 'max(var(--min-text), 11px)',
                color: 'var(--muted)',
              }}
            >
              Confirme o acesso na tela da sua carteira para continuar.
            </p>

            <Button
              variant="ghost"
              fullWidth
              onClick={closeWalletSheet}
            >
              {strings.common.cancel}
            </Button>
          </div>
        ) : isConnected && normalizedAddress ? (
          /* ESTADO (D): CONECTADO */
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '18px',
              }}
            >
              <h3
                id="wallet-sheet-title"
                style={{
                  margin: 0,
                  fontSize: 'max(var(--min-text), 17px)',
                  fontWeight: 700,
                  color: 'var(--text)',
                }}
              >
                {strings.walletSheet.title}
              </h3>
              <button
                type="button"
                onClick={closeWalletSheet}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label={strings.common.close}
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            {/* Cartão de informações da carteira conectada */}
            <div
              className="nexo-card"
              style={{
                padding: '16px',
                borderRadius: '18px',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--line)',
                marginBottom: '18px',
              }}
            >
              {/* Rede */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                }}
              >
                <span style={{ fontSize: 'max(var(--min-text), 10px)', color: 'var(--muted)' }}>
                  Rede
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent)',
                    }}
                  />
                  <span
                    style={{
                      fontSize: 'max(var(--min-text), 12px)',
                      fontWeight: 600,
                      color: 'var(--text)',
                    }}
                  >
                    {targetChainName}
                  </span>
                </div>
              </div>

              {/* Endereço com botão copiar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                }}
              >
                <span style={{ fontSize: 'max(var(--min-text), 10px)', color: 'var(--muted)' }}>
                  Endereço
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 'max(var(--min-text), 12px)',
                      fontWeight: 600,
                      color: 'var(--text)',
                    }}
                  >
                    {abbreviateAddress(normalizedAddress)}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyAddress}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--muted)',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title={strings.walletSheet.copyAddress}
                  >
                    <Icon name="copy" size={15} />
                  </button>
                </div>
              </div>

              {/* Saldo real de USDC */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  paddingTop: '10px',
                  borderTop: '1px solid var(--line)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: 'max(var(--min-text), 10px)', color: 'var(--muted)' }}>
                    Saldo em USDC
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: 'max(var(--min-text), 13px)',
                        fontWeight: 700,
                        color: 'var(--accent)',
                      }}
                    >
                      {isLoadingBalance ? strings.common.loading : balanceFormatted}
                    </span>
                    {isBalanceStale && (
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

                {balanceError && (
                  <div
                    style={{
                      fontSize: 'max(var(--min-text), 9px)',
                      color: 'var(--warning)',
                      marginTop: '4px',
                      textAlign: 'right',
                    }}
                  >
                    {balanceError}
                  </div>
                )}
              </div>
            </div>

            {/* Botão de Desconectar */}
            <Button
              variant="danger"
              fullWidth
              onClick={() => setShowConfirmDisconnect(true)}
              style={{ marginBottom: '14px' }}
            >
              {strings.walletSheet.disconnectWallet}
            </Button>

            {/* Aviso de segurança */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: 'max(var(--min-text), 9px)',
                color: 'var(--muted)',
                lineHeight: 1.3,
                textAlign: 'center',
              }}
            >
              <Icon name="shield" size={14} />
              <span>{strings.walletSheet.neverAskSecret}</span>
            </div>
          </div>
        ) : (
          /* ESTADO (A): DESCONECTADO */
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <h3
                id="wallet-sheet-title"
                style={{
                  margin: 0,
                  fontSize: 'max(var(--min-text), 17px)',
                  fontWeight: 700,
                  color: 'var(--text)',
                }}
              >
                {strings.walletSheet.connectTitle}
              </h3>
              <button
                type="button"
                onClick={closeWalletSheet}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label={strings.common.close}
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <p
              style={{
                margin: '0 0 18px',
                fontSize: 'max(var(--min-text), 11px)',
                color: 'var(--muted)',
                lineHeight: 1.4,
              }}
            >
              Conecte sua carteira para utilizar o dólar digital (USDC) na rede Polygon.
            </p>

            {errorMessage && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--surface-3)',
                  border: '1px solid var(--line)',
                  fontSize: 'max(var(--min-text), 10px)',
                  color: 'var(--muted)',
                  marginBottom: '14px',
                  lineHeight: 1.4,
                  textAlign: 'center',
                }}
              >
                {errorMessage}
              </div>
            )}

            {/* Opção 1: MetaMask */}
            <button
              type="button"
              onClick={handleConnectMetaMask}
              className="nexo-card"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: '16px',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--line)',
                marginBottom: '10px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--surface-3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent)',
                    flexShrink: 0,
                  }}
                >
                  <Icon name="lock" size={20} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 'max(var(--min-text), 13px)',
                      fontWeight: 650,
                      color: 'var(--text)',
                      marginBottom: '2px',
                    }}
                  >
                    {strings.walletSheet.connectMetaMask}
                  </div>
                  <div style={{ fontSize: 'max(var(--min-text), 9px)', color: 'var(--muted)' }}>
                    Extensão do navegador ou aplicativo
                  </div>
                </div>
              </div>
              <Icon name="chevron" size={18} />
            </button>

            {/* Opção 2: Outra carteira (WalletConnect) */}
            <button
              type="button"
              onClick={handleConnectWalletConnect}
              className="nexo-card"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: '16px',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--line)',
                marginBottom: '20px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--surface-3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent)',
                    flexShrink: 0,
                  }}
                >
                  <Icon name="scan" size={20} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 'max(var(--min-text), 13px)',
                      fontWeight: 650,
                      color: 'var(--text)',
                      marginBottom: '2px',
                    }}
                  >
                    {strings.walletSheet.connectOther}
                  </div>
                  <div style={{ fontSize: 'max(var(--min-text), 9px)', color: 'var(--muted)' }}>
                    Conectar escaneando QR Code no celular
                  </div>
                </div>
              </div>
              <Icon name="chevron" size={18} />
            </button>

            {/* Nota de segurança */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: 'max(var(--min-text), 9px)',
                color: 'var(--muted)',
                lineHeight: 1.3,
                textAlign: 'center',
              }}
            >
              <Icon name="shield" size={14} />
              <span>{strings.walletSheet.neverAskSecret}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
