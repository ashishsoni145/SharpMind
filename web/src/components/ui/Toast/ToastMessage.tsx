'use client';

import React, { useEffect } from 'react';
import type { ToastVariant } from './ToastContext';
import styles from './ToastMessage.module.css';

interface ToastMessageProps {
  toast: { id: string; message: string; variant: ToastVariant; action?: { label: string; onClick: () => void } };
  onDismiss: (id: string) => void;
}

export function ToastMessage({ toast, onDismiss }: ToastMessageProps) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), 5000);
    return () => window.clearTimeout(timer);
  }, [onDismiss, toast.id]);

  return (
    <div className={`${styles.toast} ${styles[toast.variant]}`} role={toast.variant === 'error' ? 'alert' : 'status'}>
      <span className={styles.message}>{toast.message}</span>
      {toast.action && (
        <button type="button" className={styles.action} onClick={() => { toast.action?.onClick(); onDismiss(toast.id); }}>
          {toast.action.label}
        </button>
      )}
      <button type="button" className={styles.close} onClick={() => onDismiss(toast.id)} aria-label="Dismiss notification">
        <span aria-hidden="true">×</span>
      </button>
      <span className={styles.progress} aria-hidden="true" />
    </div>
  );
}
