'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { ToastMessage } from './ToastMessage';
import styles from './ToastMessage.module.css';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';
interface ToastAction { label: string; onClick: () => void; }
interface ToastItem { id: string; message: string; variant: ToastVariant; action?: ToastAction; }
interface ToastContextValue { showToast: (message: string, variant?: ToastVariant, action?: ToastAction) => void; }

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);
  const showToast = useCallback((message: string, variant: ToastVariant = 'info', action?: ToastAction) => {
    const id = `notice-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((current) => [...current.slice(-3), { id, message, variant, action }]);
  }, []);
  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.container} aria-live="polite" aria-relevant="additions">
        {toasts.map((toast) => (
          <ToastMessage key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
