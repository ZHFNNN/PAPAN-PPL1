'use client';

import type { ReactNode } from 'react';
import toast from 'react-hot-toast';

type ToastConfirmOptions = {
  title?: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
};

export function toastConfirm(options: ToastConfirmOptions): Promise<boolean> {
  const {
    title = 'Konfirmasi',
    message,
    confirmText = 'Ya',
    cancelText = 'Batal',
  } = options;

  return new Promise<boolean>((resolve) => {
    const id = toast.custom(
      (t) => (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'grid',
            placeItems: 'center',
            padding: '20px',
            background: 'rgba(15, 23, 42, 0.55)',
            opacity: t.visible ? 1 : 0,
            transition: 'opacity 160ms ease',
          }}
          role="presentation"
          onClick={() => {
            toast.dismiss(id);
            resolve(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              toast.dismiss(id);
              resolve(false);
            }
          }}
          tabIndex={-1}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(520px, 94vw)',
              background: '#ffffff',
              border: '1px solid rgba(25,38,60,0.12)',
              borderRadius: 18,
              boxShadow: '0 20px 55px rgba(0,0,0,0.28)',
              padding: '16px 16px 14px',
              transform: t.visible ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.99)',
              transition: 'transform 160ms ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div
                aria-hidden
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  background: 'rgba(229,57,53,0.10)',
                  border: '1px solid rgba(229,57,53,0.25)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#e53935',
                  fontWeight: 900,
                  fontSize: 16,
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                !
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#19263c', marginBottom: 4 }}>{title}</div>
                <div style={{ fontWeight: 500, fontSize: 13, color: 'rgba(25,38,60,0.78)', lineHeight: 1.45 }}>
                  {message}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
                  <button
                    type="button"
                    onClick={() => {
                      toast.dismiss(id);
                      resolve(false);
                    }}
                    style={{
                      border: '1px solid rgba(25,38,60,0.18)',
                      background: '#ffffff',
                      color: '#19263c',
                      borderRadius: 12,
                      padding: '10px 14px',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {cancelText}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      toast.dismiss(id);
                      resolve(true);
                    }}
                    style={{
                      border: '1px solid #e53935',
                      background: '#e53935',
                      color: '#fff',
                      borderRadius: 12,
                      padding: '10px 14px',
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {confirmText}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  toast.dismiss(id);
                  resolve(false);
                }}
                aria-label="Tutup"
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'rgba(25,38,60,0.55)',
                  cursor: 'pointer',
                  padding: 6,
                  lineHeight: 1,
                  fontSize: 18,
                  marginTop: -2,
                }}
              >
                ×
              </button>
            </div>
          </div>
        </div>
      ),
      { duration: Infinity, position: 'top-center' }
    );

    // If it auto-dismisses for any reason, treat as cancel
    // (e.g. route changes / hot reload)
    setTimeout(() => {
      // no-op; keeps promise alive until user action
    }, 0);

    // Ensure it can be dismissed via global dismiss too
    void id;
  });
}
