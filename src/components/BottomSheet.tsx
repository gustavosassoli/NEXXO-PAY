import React, { useEffect, useRef } from 'react';
import { Icon } from './icons';
import { Button } from './Button';
import { strings } from '../strings';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = strings.profile.confirmAction,
  description,
  confirmLabel,
  cancelLabel = strings.common.cancel,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  // Armazena elemento focado antes de abrir e devolve foco ao fechar
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;

      // Travar rolagem do body enquanto o modal estiver aberto
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Focar no botão primário de ação após renderização
      const timer = setTimeout(() => {
        confirmBtnRef.current?.focus();
      }, 50);

      return () => {
        document.body.style.overflow = originalOverflow;
        clearTimeout(timer);
        previouslyFocusedElementRef.current?.focus();
      };
    }
  }, [isOpen]);

  // Tecla Escape para fechar
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }

      // Focus trap dentro do dialog
      if (e.key === 'Tab' && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-sheet-title"
      aria-describedby="confirm-sheet-desc"
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
      {/* Backdrop com blur e transição */}
      <div
        onClick={onClose}
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

      {/* Caixa do Bottom Sheet alinhada à moldura de 430 px */}
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
          padding: '10px 22px 25px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
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
            marginBottom: '23px',
          }}
          aria-hidden="true"
        />

        {/* Caixa de ícone de escudo em destaque */}
        <div
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '17px',
            backgroundColor: 'var(--warning-bg-8)',
            border: '1px solid var(--warning-border-20)',
            color: 'var(--warning)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}
        >
          <Icon name="shield" size={26} />
        </div>

        {/* Título */}
        <h3
          id="confirm-sheet-title"
          style={{
            margin: '0 0 10px 0',
            fontSize: 'max(var(--min-text), 18px)',
            fontWeight: 700,
            color: 'var(--text)',
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </h3>

        {/* Descrição */}
        <p
          id="confirm-sheet-desc"
          style={{
            margin: '0 0 24px 0',
            fontSize: 'max(var(--min-text), 11px)',
            lineHeight: 1.6,
            color: 'var(--muted)',
            maxWidth: '320px',
          }}
        >
          {description}
        </p>

        {/* Botão de confirmação de perigo */}
        <Button
          ref={confirmBtnRef}
          variant="danger"
          fullWidth
          onClick={onConfirm}
          style={{
            minHeight: '48px',
            borderRadius: '14px',
            fontSize: 'max(var(--min-text), 13px)',
            fontWeight: 650,
            marginBottom: '8px',
          }}
        >
          {confirmLabel}
        </Button>

        {/* Botão Cancelar */}
        <Button
          variant="ghost"
          fullWidth
          onClick={onClose}
          style={{
            minHeight: '42px',
            borderRadius: '14px',
            fontSize: 'max(var(--min-text), 12px)',
            color: 'var(--muted)',
          }}
        >
          {cancelLabel}
        </Button>
      </div>
    </div>
  );
};
