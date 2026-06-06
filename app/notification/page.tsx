'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';

type NotifType = 'bookmark' | 'payment' | 'general';

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
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(date);
}

// ICONS
function BookmarkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function PaymentIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M9 12l2 2 4-4M7.835 4.697..." 
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function NotificationPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // FETCH dari backend (punya kamu)
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/notifications');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // MARK ALL READ
  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

    await Promise.all(
      notifications.map(n =>
        fetch(`/api/admin/notifications/${n.id}/read`, { method: 'PATCH' })
      )
    );
  };

  // MARK SINGLE READ
  const markRead = async (notif: Notification) => {
    if (notif.isRead) return;

    setNotifications(prev =>
      prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n)
    );

    await fetch(`/api/admin/notifications/${notif.id}/read`, {
      method: 'PATCH',
    });
  };

  // MAPPING TYPE → ICON
  const getType = (type: string): NotifType => {
    if (type === 'BOOKMARK') return 'bookmark';
    if (type === 'PAYMENT') return 'payment';
    return 'general';
  };

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.container}>
          
          {/* HEADER */}
          <div className={styles.header}>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>Notification</h1>
              {unreadCount > 0 && (
                <span className={styles.badge}>{unreadCount}</span>
              )}
            </div>

            {unreadCount > 0 && (
              <button className={styles.markAllBtn} onClick={markAllRead}>
                Tandai semua sudah dibaca
              </button>
            )}
          </div>

          {/* LIST */}
          <div className={styles.list}>
            {loading ? (
              <p>Loading...</p>
            ) : notifications.length === 0 ? (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>🔔</span>
                <p>Belum ada notifikasi</p>
              </div>
            ) : (
              notifications.map((notif, index) => {
                const type = getType(notif.type);

                return (
                  <div key={notif.id}>
                    <div
                      className={`${styles.item} ${!notif.isRead ? styles.itemUnread : ''}`}
                      onClick={() => markRead(notif)}
                    >
                      {/* ICON */}
                      <div
                        className={`${styles.iconWrap} ${
                          type === 'bookmark'
                            ? styles.iconBookmark
                            : styles.iconPayment
                        }`}
                      >
                        {type === 'bookmark' ? <BookmarkIcon /> : <PaymentIcon />}
                      </div>

                      {/* CONTENT */}
                      <div className={styles.content}>
                        <p className={styles.notifTitle}>{notif.title}</p>
                        <p className={styles.notifDesc}>
                          {notif.message}
                        </p>
                      </div>

                      {/* META */}
                      <div className={styles.meta}>
                        <span className={styles.date}>
                          {formatDate(notif.createdAt)}
                        </span>
                        {!notif.isRead && <span className={styles.dot} />}
                      </div>
                    </div>

                    {index < notifications.length - 1 && (
                      <hr className={styles.divider} />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}