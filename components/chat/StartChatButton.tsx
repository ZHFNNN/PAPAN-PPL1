"use client";

// components/chat/StartChatButton.tsx
// Tombol "Hubungi Pemilik" di halaman detail properti
// Setelah kirim pesan pertama → redirect ke room chat

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./StartChatButton.module.css";

interface StartChatButtonProps {
  propertyId: string;
  ownerId: string;
	variant?: 'default' | 'light';
}

export default function StartChatButton({ propertyId, ownerId, variant = 'default' }: StartChatButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sembunyikan kalau user adalah owner-nya sendiri
  if (session?.user?.id === ownerId) return null;

  const buttonClassName = variant === 'light'
    ? `${styles.btn} ${styles.btnLight}`
    : styles.btn;

  const handleOpen = () => {
    if (!session) { router.push("/login"); return; }
    setShowModal(true);
  };

  const handleSend = async () => {
    if (!message.trim()) { setError("Pesan tidak boleh kosong"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ propertyId, initialMessage: message }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Gagal mengirim pesan");
      }
      const data = await res.json().catch(() => ({}));
      const conversationId: string | undefined = data?.id ?? data?.conversation?.id;
      if (!conversationId) {
        throw new Error("Response server tidak mengandung conversation id");
      }
      setShowModal(false);
      // Langsung masuk ke room chat
      router.push(`/chat/${conversationId}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleClose = () => { setShowModal(false); setMessage(""); setError(""); };

  return (
    <>
      <button className={buttonClassName} onClick={handleOpen}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        Hubungi Pemilik
      </button>

      {showModal && (
        <div className={styles.overlay} onClick={handleClose}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <h3 className={styles.modalTitle}>Kirim Pesan ke Pemilik</h3>
                <p className={styles.modalSub}>Pesan akan masuk ke kotak obrolan kamu</p>
              </div>
              <button className={styles.closeBtn} onClick={handleClose} aria-label="Tutup">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className={styles.modalHint}>
              Perkenalkan dirimu dan tanyakan apa yang ingin kamu ketahui tentang properti ini.
            </p>

            <textarea
              className={styles.textarea}
              placeholder="Contoh: Halo, saya tertarik dengan properti ini. Apakah masih tersedia? Terima kasih."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={4}
              autoFocus
            />

            {error && (
              <div className={styles.errorBox}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={handleClose} disabled={loading}>
                Batal
              </button>
              <button className={styles.sendBtn} onClick={handleSend} disabled={loading || !message.trim()}>
                {loading ? (
                  <>
                    <div className={styles.btnSpinner} />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                    Kirim & Mulai Chat
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}