'use client';

import { useEffect, useRef } from 'react';
import styles from './ConfirmDialog.module.css';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  errorText?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = 'Hapus',
  cancelText = 'Batal',
  loading = false,
  errorText,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    overlayRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      role="presentation"
      tabIndex={-1}
      onClick={() => {
        if (loading) return;
        onCancel();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && !loading) onCancel();
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <p className={styles.title}>{title}</p>
        <p className={styles.desc}>{description}</p>
        {errorText ? <p className={styles.error}>{errorText}</p> : null}
        <div className={styles.actions}>
          <button className={styles.btn} onClick={onCancel} disabled={loading}>
            {cancelText}
          </button>
          <button className={`${styles.btn} ${styles.btnDanger}`} onClick={onConfirm} disabled={loading}>
            {loading ? '...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
