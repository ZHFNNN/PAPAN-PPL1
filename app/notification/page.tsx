'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

interface Notification {
  id: string;
  title: string;
  message: string;
  imageUrl: string | null;
  isRead: boolean;
  type: string;
  createdAt: string;
}

function formatDate(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta',
    }).format(date);
  }
  if (diffDays < 7) {
    return new Intl.DateTimeFormat('id-ID', { weekday: 'short', timeZone: 'Asia/Jakarta' }).format(date);
  }
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'short', timeZone: 'Asia/Jakarta',
  }).format(date);
}

export default function NotificationPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Notification | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      if (res.status === 401) { router.push('/login'); return; }
      const data = await res.json() as Notification[];
      setNotifications(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { void fetchNotifications(); }, [fetchNotifications]);

  const handleOpen = async (notif: Notification) => {
    setSelected(notif);
    if (!notif.isRead) {
      // Optimistic update
      setNotifications(prev =>
        prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n)
      );
      await fetch(`/api/notifications/${notif.id}/read`, { method: 'PATCH' });
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.back()}>← Kembali</button>
        <div className={styles.headerTitle}>
          <h1 className={styles.title}>Notifikasi</h1>
          {unreadCount > 0 && (
            <span className={styles.unreadBadge}>{unreadCount} belum dibaca</span>
          )}
        </div>
      </div>

      <div className={styles.layout}>
        {/* Inbox list */}
        <div className={`${styles.inbox} ${selected ? styles.inboxWithSelected : ''}`}>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p>Memuat notifikasi...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔔</div>
              <p className={styles.emptyText}>Belum ada notifikasi</p>
              <p className={styles.emptySubtext}>Notifikasi dari admin akan muncul di sini</p>
            </div>
          ) : (
            notifications.map(notif => (
              <button
                key={notif.id}
                className={`${styles.notifRow} ${!notif.isRead ? styles.notifUnread : ''} ${selected?.id === notif.id ? styles.notifSelected : ''}`}
                onClick={() => void handleOpen(notif)}
              >
                <div className={styles.notifDot}>
                  {!notif.isRead && <span className={styles.dot} />}
                </div>
                <div className={styles.notifMain}>
                  <div className={styles.notifTopRow}>
                    <span className={styles.notifSender}>PAPAN</span>
                    <span className={styles.notifDate}>{formatDate(notif.createdAt)}</span>
                  </div>
                  <p className={styles.notifTitle}>{notif.title}</p>
                  <p className={styles.notifPreview}>
                    {notif.message.slice(0, 100)}{notif.message.length > 100 ? '...' : ''}
                  </p>
                </div>
                {notif.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={notif.imageUrl} alt="" className={styles.notifThumb} />
                )}
              </button>
            ))
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className={styles.detailPanel}>
            <div className={styles.detailHeader}>
              <button className={styles.closeDetail} onClick={() => setSelected(null)}>✕</button>
              <h2 className={styles.detailTitle}>{selected.title}</h2>
              <p className={styles.detailMeta}>
                Dari: <strong>PAPAN Admin</strong> · {new Intl.DateTimeFormat('id-ID', {
                  day: 'numeric', month: 'long', year: 'numeric',
                  hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta',
                }).format(new Date(selected.createdAt))}
              </p>
            </div>
            {selected.imageUrl && (
              <div className={styles.detailImgWrap}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selected.imageUrl} alt="" className={styles.detailImg} />
              </div>
            )}
            <div className={styles.detailBody}>
              <p className={styles.detailMessage}>{selected.message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}