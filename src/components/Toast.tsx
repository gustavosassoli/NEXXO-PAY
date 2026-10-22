import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface ToastContextType {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 2000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: 'calc(430px - 40px)',
            width: 'max-content',
            backgroundColor: 'var(--surface-3)',
            color: 'var(--text)',
            border: '1px solid var(--line)',
            boxShadow: '0 8px 24px var(--toast-shadow)',
            borderRadius: '14px',
            padding: '10px 18px',
            fontSize: 'max(var(--min-text), 11px)',
            fontWeight: 500,
            zIndex: 1000,
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          {toastMessage}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser utilizado dentro de ToastProvider');
  }
  return context;
};
