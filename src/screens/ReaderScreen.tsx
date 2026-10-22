import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';
import { TopBar } from '../components/TopBar';
import { Button } from '../components/Button';
import { Icon } from '../components/icons';
import { strings } from '../strings';
import { usePayment } from '../context/PaymentContext';
import { DEMO_MODE, CAMERA_MODE } from '../config';

declare global {
  interface Window {
    BarcodeDetector?: any;
  }
}

export const ReaderScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    readerState,
    setReaderState,
    handleScannedCode,
    simulateValidRead,
    testError,
  } = usePayment();

  const [flashlightOn, setFlashlightOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [permissionError, setPermissionError] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastScanTimeRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Garante a existência do canvas reutilizável para leitura de quadros
  if (!canvasRef.current && typeof document !== 'undefined') {
    canvasRef.current = document.createElement('canvas');
  }

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
    setFlashlightOn(false);
    setTorchSupported(false);
  };

  const startCamera = async () => {
    setPermissionError(false);
    if (!navigator?.mediaDevices?.getUserMedia) {
      setPermissionError(true);
      setReaderState('permission');
      return;
    }

    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      setStreamActive(true);
      setReaderState('active');

      // Verifica capacidade de lanterna (torch)
      const track = stream.getVideoTracks()[0];
      if (track && typeof track.getCapabilities === 'function') {
        const capabilities: any = track.getCapabilities();
        if (capabilities && capabilities.torch) {
          setTorchSupported(true);
        }
      }

      // Inicia loop de escaneamento
      startScanLoop();
    } catch (err) {
      stopCamera();
      setPermissionError(true);
      setReaderState('permission');
    }
  };

  // Processa uma imagem ou frame de vídeo para detectar QR Code
  const decodeFrameOrImage = async (
    source: CanvasImageSource,
    width: number,
    height: number
  ): Promise<string | null> => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0 || height <= 0) return null;

    // Escala máxima de 640px para manter leve e sem lentidão
    const maxDim = 640;
    const scale = Math.min(1, maxDim / Math.max(width, height));
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    ctx.drawImage(source, 0, 0, targetWidth, targetHeight);

    // 1. Tenta API nativa BarcodeDetector se disponível
    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      try {
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        const barcodes = await detector.detect(canvas);
        if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
          return barcodes[0].rawValue;
        }
      } catch {
        // Fallback para jsQR se BarcodeDetector falhar
      }
    }

    // 2. Fallback universal jsQR (Safari, Firefox, etc.)
    try {
      const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });
      if (code && code.data) {
        return code.data;
      }
    } catch {
      // ignore
    }

    return null;
  };

  const startScanLoop = () => {
    const scan = async () => {
      const video = videoRef.current;
      if (video && video.readyState >= 2 && !video.paused) {
        const now = performance.now();
        // Limita a ~12 scans por segundo (intervalo >= 80ms)
        if (now - lastScanTimeRef.current >= 80) {
          lastScanTimeRef.current = now;
          const qrCode = await decodeFrameOrImage(
            video,
            video.videoWidth,
            video.videoHeight
          );

          if (qrCode) {
            stopCamera();
            handleScannedCode(qrCode);
            return;
          }
        }
      }
      animationFrameRef.current = requestAnimationFrame(scan);
    };

    animationFrameRef.current = requestAnimationFrame(scan);
  };

  // Alterna lanterna
  const handleFlashlightToggle = async () => {
    if (!torchSupported || !streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      const nextState = !flashlightOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextState }],
      });
      setFlashlightOn(nextState);
    } catch {
      // ignore
    }
  };

  // Selecionar imagem da galeria
  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);
      const qrCode = await decodeFrameOrImage(img, img.naturalWidth, img.naturalHeight);
      if (qrCode) {
        stopCamera();
        handleScannedCode(qrCode);
      } else {
        setReaderState('unrecognized');
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setReaderState('unrecognized');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    img.src = objectUrl;
  };

  const handleContinueDemo = () => {
    if (CAMERA_MODE === 'real') {
      startCamera();
    } else {
      setReaderState('active');
    }
  };

  const handleReview = () => {
    stopCamera();
    navigate('/pagar/revisar');
  };

  // Cleanup de câmera e visibilitychange
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopCamera();
        if (CAMERA_MODE === 'real' && readerState === 'active') {
          setReaderState('permission');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopCamera();
    };
  }, [readerState]);

  // Título e subtítulo dinâmicos
  let stateTitle: string = strings.pay.permissionTitle;
  let stateSubtitle: string = strings.pay.permissionSubtitle;

  if (readerState === 'active') {
    stateTitle = strings.pay.activeTitle;
    stateSubtitle = strings.pay.activeSubtitle;
  } else if (readerState === 'identified') {
    stateTitle = strings.pay.identifiedTitle;
    stateSubtitle = strings.pay.identifiedSubtitle;
  } else if (readerState === 'invalid') {
    stateTitle = strings.pay.invalidTitle;
    stateSubtitle = strings.pay.invalidSubtitle;
  } else if (readerState === 'unrecognized') {
    stateTitle = strings.pay.unrecognizedTitle;
    stateSubtitle = strings.pay.unrecognizedSubtitle;
  }

  const isRealMode = CAMERA_MODE === 'real';

  return (
    <div
      className="nexo-screen nexo-screen--reader"
      style={{
        padding: '20px 20px calc(112px + env(safe-area-inset-bottom, 0px))',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        minHeight: '100%',
      }}
    >
      <TopBar
        title={strings.pay.title}
        showBack={true}
        onBack={() => {
          stopCamera();
          navigate('/');
        }}
        actionIcon="help"
        actionAriaLabel="Ajuda"
      />

      {/* Aviso demonstrativo superior (apenas se DEMO_MODE e modo simulated) */}
      {!isRealMode && DEMO_MODE && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            color: 'var(--warning)',
            fontSize: 'max(var(--min-text), 9px)',
            marginBottom: '15px',
            textAlign: 'center',
          }}
        >
          <Icon name="info" size={15} />
          <span>{strings.pay.disclaimer}</span>
        </div>
      )}

      {/* Área da Câmera (altura 385, raio 25, fundo var(--camera-bg)) */}
      <div
        className="nexo-camera-area"
        style={{
          height: '385px',
          borderRadius: '25px',
          backgroundColor: 'var(--camera-bg)',
          border: '1px solid var(--line)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {/* Elemento de vídeo da câmera real */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: streamActive ? 'block' : 'none',
          }}
        />

        {/* Fundo simulado da câmera quando stream desligado */}
        {!streamActive && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'var(--camera-gradient)',
              opacity: 0.8,
              filter: readerState === 'permission' ? 'blur(7px)' : 'none',
              transition: 'filter 300ms ease',
            }}
          />
        )}

        {/* Moldura central de 228x228 com cantos accent */}
        <div
          style={{
            width: '228px',
            height: '228px',
            borderRadius: '28px',
            border: '1px solid var(--camera-border)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
          }}
        >
          {/* 4 cantos da moldura */}
          <div
            style={{
              position: 'absolute',
              top: '-2px',
              left: '-2px',
              width: '45px',
              height: '45px',
              borderTop: '3px solid var(--accent)',
              borderLeft: '3px solid var(--accent)',
              borderTopLeftRadius: '24px',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '45px',
              height: '45px',
              borderTop: '3px solid var(--accent)',
              borderRight: '3px solid var(--accent)',
              borderTopRightRadius: '24px',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-2px',
              left: '-2px',
              width: '45px',
              height: '45px',
              borderBottom: '3px solid var(--accent)',
              borderLeft: '3px solid var(--accent)',
              borderBottomLeftRadius: '24px',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              width: '45px',
              height: '45px',
              borderBottom: '3px solid var(--accent)',
              borderRight: '3px solid var(--accent)',
              borderBottomRightRadius: '24px',
            }}
          />

          {/* Linha de varredura ativa */}
          {readerState === 'active' && <div className="nexo-scanner-line" />}

          {/* Código identificado: Círculo verde com check e halo */}
          {readerState === 'identified' && (
            <div
              style={{
                width: '66px',
                height: '66px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent)',
                color: 'var(--camera-check-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 0 12px var(--accent-halo)',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            >
              <Icon name="check" size={32} />
            </div>
          )}
        </div>

        {/* Botão Lanterna (pílula, 18px do fundo) */}
        <button
          type="button"
          onClick={handleFlashlightToggle}
          aria-label={strings.pay.flashlight}
          aria-disabled={!torchSupported}
          style={{
            position: 'absolute',
            bottom: '18px',
            borderRadius: '100px',
            border: '1px solid var(--camera-flashlight-border)',
            backgroundColor: flashlightOn
              ? 'var(--camera-flashlight-active-bg)'
              : 'var(--camera-flashlight-bg)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            color: flashlightOn ? 'var(--accent)' : 'var(--text)',
            fontSize: 'max(var(--min-text), 10px)',
            fontWeight: 500,
            padding: '8px 13px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: torchSupported ? 'pointer' : 'not-allowed',
            opacity: torchSupported ? 1 : 0.45,
            zIndex: 3,
            outline: 'none',
            transition: 'background-color 200ms ease, color 200ms ease, opacity 200ms ease',
          }}
        >
          <Icon name="flash" size={18} />
          <span>{strings.pay.flashlight}</span>
        </button>
      </div>

      {/* Textos abaixo da câmera */}
      <div
        style={{
          padding: '20px 20px 15px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 'max(var(--min-text), 16px)',
            fontWeight: 700,
            color: 'var(--text)',
          }}
        >
          {stateTitle}
        </h2>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 'max(var(--min-text), 11px)',
            color: 'var(--muted)',
            lineHeight: 1.4,
          }}
        >
          {stateSubtitle}
        </p>
        {permissionError && (
          <p
            style={{
              margin: '8px 0 0',
              fontSize: 'max(var(--min-text), 10px)',
              color: 'var(--danger)',
              lineHeight: 1.4,
            }}
          >
            {strings.pay.permissionDeniedHelper}
          </p>
        )}
      </div>

      {/* Botões de Ação do Leitor */}
      <div style={{ marginTop: '4px', marginBottom: '15px' }}>
        {readerState === 'permission' && (
          <Button variant="primary" onClick={handleContinueDemo}>
            {isRealMode ? strings.pay.allowCamera : strings.pay.continueDemo}
          </Button>
        )}

        {readerState === 'identified' && (
          <Button variant="primary" onClick={handleReview}>
            {strings.pay.reviewPayment}
          </Button>
        )}

        {(readerState === 'invalid' || readerState === 'unrecognized') && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {isRealMode ? (
              <Button variant="primary" onClick={startCamera}>
                Escanear novamente
              </Button>
            ) : DEMO_MODE ? (
              <>
                <Button
                  variant="secondary"
                  icon="scan"
                  onClick={simulateValidRead}
                  style={{ flex: 1 }}
                >
                  {strings.pay.simulateValidRead}
                </Button>
                <button
                  type="button"
                  onClick={testError}
                  aria-label={strings.pay.testError}
                  style={{
                    height: '51px',
                    borderRadius: '13px',
                    border: '1px solid var(--line)',
                    backgroundColor: 'var(--surface-2)',
                    color: 'var(--muted)',
                    fontSize: 'max(var(--min-text), 9px)',
                    fontWeight: 600,
                    padding: '0 11px',
                    cursor: 'pointer',
                    outline: 'none',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {strings.pay.testError}
                </button>
              </>
            ) : (
              <Button variant="primary" onClick={simulateValidRead}>
                {strings.pay.reviewPayment}
              </Button>
            )}
          </div>
        )}

        {readerState === 'active' && !isRealMode && DEMO_MODE && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Button
              variant="secondary"
              icon="scan"
              onClick={simulateValidRead}
              style={{ flex: 1 }}
            >
              {strings.pay.simulateValidRead}
            </Button>
            <button
              type="button"
              onClick={testError}
              aria-label={strings.pay.testError}
              style={{
                height: '51px',
                borderRadius: '13px',
                border: '1px solid var(--line)',
                backgroundColor: 'var(--surface-2)',
                color: 'var(--muted)',
                fontSize: 'max(var(--min-text), 9px)',
                fontWeight: 600,
                padding: '0 11px',
                cursor: 'pointer',
                outline: 'none',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {strings.pay.testError}
            </button>
          </div>
        )}
      </div>

      {/* Input oculto para selecionar imagem da galeria */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        aria-hidden="true"
      />

      {/* Alternativas (Inserir código Pix / Selecionar da galeria) */}
      <div
        style={{
          marginTop: '15px',
          borderTop: '1px solid var(--line)',
          paddingTop: '9px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}
      >
        {/* Linha 1: Inserir código Pix */}
        <div
          role="button"
          tabIndex={0}
          aria-label={strings.pay.enterPixCode}
          onClick={() => {
            // Se houver código simulado em clipboard ou prompt, podemos acionar leitura
            simulateValidRead();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              simulateValidRead();
            }
          }}
          style={{
            display: 'grid',
            gridTemplateColumns: '30px 1fr 20px',
            alignItems: 'center',
            gap: '8px',
            padding: '11px 3px',
            color: 'var(--muted)',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <Icon name="keyboard" size={20} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <span
              style={{
                fontSize: 'max(var(--min-text), 11px)',
                fontWeight: 600,
                color: 'var(--text)',
              }}
            >
              {strings.pay.enterPixCode}
            </span>
            <span
              style={{
                fontSize: 'max(var(--min-text), 9px)',
                color: 'var(--muted)',
              }}
            >
              {strings.pay.copyAndPaste}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Icon name="chevron" size={16} />
          </div>
        </div>

        {/* Linha 2: Selecionar da galeria */}
        <div
          role="button"
          tabIndex={0}
          aria-label={strings.pay.selectFromGallery}
          onClick={handleGalleryClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleGalleryClick();
            }
          }}
          style={{
            display: 'grid',
            gridTemplateColumns: '30px 1fr 20px',
            alignItems: 'center',
            gap: '8px',
            padding: '11px 3px',
            color: 'var(--muted)',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <Icon name="image" size={20} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <span
              style={{
                fontSize: 'max(var(--min-text), 11px)',
                fontWeight: 600,
                color: 'var(--text)',
              }}
            >
              {strings.pay.selectFromGallery}
            </span>
            <span
              style={{
                fontSize: 'max(var(--min-text), 9px)',
                color: 'var(--muted)',
              }}
            >
              {strings.pay.importImage}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Icon name="chevron" size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};
