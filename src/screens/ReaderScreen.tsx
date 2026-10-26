import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';
import { TopBar } from '../components/TopBar';
import { Button } from '../components/Button';
import { Icon } from '../components/icons';
import { strings } from '../strings';
import { usePayment } from '../context/PaymentContext';
import { DEMO_MODE, CAMERA_MODE, SHOW_DIAGNOSTICS } from '../config';

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
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [cameraErrorName, setCameraErrorName] = useState<string | null>(null);
  const [gumStatus, setGumStatus] = useState<string>('aguardando');
  const [fps, setFps] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastScanTimeRef = useRef<number>(0);
  const fpsTrackerRef = useRef<{ count: number; lastTime: number }>({
    count: 0,
    lastTime: performance.now(),
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isRealMode = CAMERA_MODE === 'real';

  // Identifica decodificador disponível
  const activeDecoder =
    typeof window !== 'undefined' && 'BarcodeDetector' in window
      ? 'BarcodeDetector'
      : 'jsQR';

  // Reutiliza canvas para leitura de frames
  if (!canvasRef.current && typeof document !== 'undefined') {
    canvasRef.current = document.createElement('canvas');
  }

  // Para completamente o stream da câmera e limpa referências
  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('[NEXO PAY] Erro ao parar faixa da câmera:', e);
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
    setFps(0);
    fpsTrackerRef.current = { count: 0, lastTime: performance.now() };
  };

  // Garante que ao montar a tela, ela inicia no estado de permissão
  useEffect(() => {
    // Diagnóstico de iframe
    if (typeof window !== 'undefined') {
      const inIframe = window.self !== window.top;
      if (inIframe) {
        console.warn('[NEXO PAY] Aplicação em execução dentro de um iframe. A permissão da câmera depende de allow="camera" no contêiner pai.');
      }
    }

    setReaderState('permission');
    setStreamActive(false);

    return () => {
      stopCamera();
      setReaderState('permission');
    };
  }, []);

  // Monitora visibilidade da aba: ao ocultar, para tracks e volta para permissão
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.info('[NEXO PAY] Aba oculta detectada. Desligando câmera e resetando estado.');
        stopCamera();
        setReaderState('permission');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Solicita câmera dentro do toque direto do usuário
  const startCamera = async () => {
    setCameraErrorName(null);
    setIsStartingCamera(true);

    if (!navigator?.mediaDevices?.getUserMedia) {
      const errName = 'SecurityError';
      console.error(
        '[NEXO PAY] navigator.mediaDevices.getUserMedia indisponível. Contexto seguro (HTTPS) obrigatório.'
      );
      setCameraErrorName(errName);
      setGumStatus(errName);
      setIsStartingCamera(false);
      setReaderState('permission');
      return;
    }

    try {
      stopCamera();

      let stream: MediaStream | null = null;

      // 1. Tenta câmera traseira (environment)
      try {
        console.info('[NEXO PAY] Solicitando câmera com facingMode environment...');
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
      } catch (firstErr: any) {
        console.warn(
          '[NEXO PAY] Falha ao solicitar câmera traseira:',
          firstErr?.name,
          firstErr?.message
        );
        // Se falhou por restrição de câmera traseira, tenta com qualquer câmera (video: true)
        if (
          firstErr?.name === 'OverconstrainedError' ||
          firstErr?.name === 'ConstraintNotSatisfiedError' ||
          firstErr?.name === 'NotFoundError'
        ) {
          console.info('[NEXO PAY] Tentando fallback para qualquer câmera disponível (video: true)...');
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } else {
          throw firstErr;
        }
      }

      if (!stream) {
        throw new Error('Nenhum stream de mídia foi retornado pelo navegador.');
      }

      streamRef.current = stream;
      setGumStatus('ok');
      console.info('[NEXO PAY] getUserMedia concedido com sucesso. Conectando elemento de vídeo...');

      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;

        // Espera o evento 'playing' para confirmar que o vídeo começou a tocar
        await new Promise<void>((resolve) => {
          let hasResolved = false;
          const finish = () => {
            if (!hasResolved) {
              hasResolved = true;
              video.removeEventListener('playing', onPlaying);
              resolve();
            }
          };
          const onPlaying = () => {
            console.info('[NEXO PAY] Evento "playing" disparado pelo <video>.');
            finish();
          };

          video.addEventListener('playing', onPlaying, { once: true });

          video.play().catch((playErr) => {
            console.warn('[NEXO PAY] video.play() necessitou de recuperação:', playErr);
            finish();
          });

          // Timeout de contingência (3s) para não travar caso o evento demore
          setTimeout(finish, 3000);
        });
      }

      // Ativa o estado da câmera ativa somente DEPOIS que o vídeo está tocando
      setStreamActive(true);
      setReaderState('active');
      setIsStartingCamera(false);

      // Checa suporte a lanterna
      const track = stream.getVideoTracks()[0];
      if (track && typeof track.getCapabilities === 'function') {
        const capabilities: any = track.getCapabilities();
        if (capabilities && capabilities.torch) {
          setTorchSupported(true);
        }
      }

      // Inicia loop de leitura de frames
      startScanLoop();
    } catch (err: any) {
      const errName = err?.name || 'Error';
      console.error(
        '[NEXO PAY] Falha no acesso à câmera:',
        errName,
        err?.message || err
      );
      setCameraErrorName(errName);
      setGumStatus(errName);
      stopCamera();
      setReaderState('permission');
      setIsStartingCamera(false);
    }
  };

  // Processa frame ou imagem estática
  const decodeFrameOrImage = async (
    source: CanvasImageSource,
    width: number,
    height: number
  ): Promise<string | null> => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0 || height <= 0) return null;

    const maxDim = 640;
    const scale = Math.min(1, maxDim / Math.max(width, height));
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    ctx.drawImage(source, 0, 0, targetWidth, targetHeight);

    // 1. Tenta BarcodeDetector nativo
    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      try {
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        const barcodes = await detector.detect(canvas);
        if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
          return barcodes[0].rawValue;
        }
      } catch {
        // Fallback para jsQR
      }
    }

    // 2. Fallback universal jsQR
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

  // Loop de varredura com requestAnimationFrame limitado a ~12 leituras/segundo
  const startScanLoop = () => {
    fpsTrackerRef.current = { count: 0, lastTime: performance.now() };

    const scan = async () => {
      const video = videoRef.current;
      if (video && video.readyState >= 2 && !video.paused) {
        const now = performance.now();

        // Medição de FPS para diagnóstico
        fpsTrackerRef.current.count += 1;
        if (now - fpsTrackerRef.current.lastTime >= 1000) {
          setFps(fpsTrackerRef.current.count);
          fpsTrackerRef.current.count = 0;
          fpsTrackerRef.current.lastTime = now;
        }

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
    } catch (e) {
      console.warn('[NEXO PAY] Falha ao alternar lanterna:', e);
    }
  };

  // Galeria de imagens
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

  const handleAllowClick = () => {
    if (isRealMode) {
      startCamera();
    } else {
      setReaderState('active');
    }
  };

  const handleReview = () => {
    stopCamera();
    navigate('/pagar/revisar');
  };

  // Mensagem amigável de erro conforme o código de falha da API da câmera
  const getErrorMessage = (): string => {
    switch (cameraErrorName) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        return 'Permissão negada ou bloqueada no navegador. Permita o acesso à câmera nas configurações do site ou use a galeria.';
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        return 'Nenhuma câmera encontrada no aparelho. Conecte uma câmera ou use a galeria.';
      case 'NotReadableError':
      case 'TrackStartError':
        return 'A câmera já está sendo usada por outro app. Feche outros aplicativos e tente novamente.';
      case 'OverconstrainedError':
        return 'Restrições da câmera não suportadas. Use a galeria de imagens.';
      case 'SecurityError':
        return 'Contexto inseguro (requer HTTPS) ou política bloqueando a câmera.';
      default:
        return strings.pay.permissionDeniedHelper;
    }
  };

  // Título e subtítulo dinâmicos da tela
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
          setReaderState('permission');
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
        {/* Fundo simulado degradê (z-index 0) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--camera-gradient)',
            opacity: streamActive ? 0 : 0.8,
            filter: readerState === 'permission' ? 'blur(7px)' : 'none',
            transition: 'opacity 300ms ease, filter 300ms ease',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />

        {/* Elemento <video> SEMPRE presente no DOM (z-index 1) */}
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
            zIndex: 1,
            opacity: streamActive ? 1 : 0,
            transition: 'opacity 200ms ease',
            pointerEvents: 'none',
          }}
        />

        {/* Moldura central de 228x228 com cantos accent (z-index 2) */}
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
            pointerEvents: 'none',
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

        {/* Botão Lanterna (z-index 3) */}
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

        {cameraErrorName && readerState === 'permission' && (
          <p
            style={{
              margin: '8px 0 0',
              fontSize: 'max(var(--min-text), 10px)',
              color: 'var(--danger)',
              lineHeight: 1.4,
            }}
          >
            {getErrorMessage()}
          </p>
        )}
      </div>

      {/* Botões de Ação do Leitor */}
      <div style={{ marginTop: '4px', marginBottom: '15px' }}>
        {readerState === 'permission' && (
          <Button
            variant="primary"
            onClick={handleAllowClick}
            disabled={isStartingCamera}
          >
            {isStartingCamera
              ? strings.common.loading
              : isRealMode
              ? strings.pay.allowCamera
              : strings.pay.continueDemo}
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

      {/* Linha de diagnóstico discreta (obedece a SHOW_DIAGNOSTICS) */}
      {SHOW_DIAGNOSTICS && (
        <div
          style={{
            marginTop: '16px',
            textAlign: 'center',
            fontSize: '9px',
            color: 'var(--muted)',
            lineHeight: 1.4,
            userSelect: 'none',
            opacity: 0.75,
          }}
        >
          Diagnóstico: modo {CAMERA_MODE} | gUM: {gumStatus} | {fps} fps | {activeDecoder}
        </div>
      )}
    </div>
  );
};
