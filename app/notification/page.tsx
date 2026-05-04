'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';

type NotifType = 'bookmark' | 'payment';

interface Notification {
  id: number;
  type: NotifType;
  title: string;
  description: string;
  date: string;
  time: string;
  isRead: boolean;
}

const dummyNotifications: Notification[] = [
  {
    id: 1,
    type: 'bookmark',
    title: '121 Orang menambahkan properti kamu ke bookmark mereka!',
    description: 'Rumah keren nan megah di Kebayoran Baru, Jakarta Selatan · ramai',
    date: '1 April',
    time: '18:02',
    isRead: false,
  },
  {
    id: 2,
    type: 'payment',
    title: 'Yayy, pembayaran kamu berhasil!',
    description: 'Pembayaran kamu ad booster di kosan pelangi sudah diterima',
    date: '1 April',
    time: '18:02',
    isRead: false,
  },
  {
    id: 3,
    type: 'bookmark',
    title: '121 Orang menambahkan properti kamu ke bookmark mereka!',
    description: 'Rumah keren nan megah di Kebayoran Baru, Jakarta Selatan · ramai',
    date: '1 April',
    time: '18:02',
    isRead: true,
  },
  {
    id: 4,
    type: 'payment',
    title: 'Yayy, pembayaran kamu berhasil!',
    description: 'Pembayaran kamu ad booster di kosan pelangi sudah diterima',
    date: '1 April',
    time: '18:02',
    isRead: true,
  },
  {
    id: 5,
    type: 'bookmark',
    title: '121 Orang menambahkan properti kamu ke bookmark mereka!',
    description: 'Rumah keren nan megah di Kebayoran Baru, Jakarta Selatan · ramai',
    date: '1 April',
    time: '18:02',
    isRead: true,
  },
  {
    id: 6,
    type: 'payment',
    title: 'Yayy, pembayaran kamu berhasil!',
    description: 'Pembayaran kamu ad booster di kosan pelangi sudah diterima',
    date: '1 April',
    time: '18:02',
    isRead: true,
  },
  {
    id: 7,
    type: 'bookmark',
    title: '121 Orang menambahkan properti kamu ke bookmark mereka!',
    description: 'Rumah keren nan megah di Kebayoran Baru, Jakarta Selatan · ramai',
    date: '1 April',
    time: '18:02',
    isRead: true,
  },
  {
    id: 8,
    type: 'payment',
    title: 'Yayy, pembayaran kamu berhasil!',
    description: 'Pembayaran kamu ad booster di kosan pelangi sudah diterima',
    date: '1 April',
    time: '18:02',
    isRead: true,
  },
];

function BookmarkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PaymentIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>(dummyNotifications);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.container}>
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

          <div className={styles.list}>
            {notifications.length === 0 ? (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>🔔</span>
                <p>Belum ada notifikasi</p>
              </div>
            ) : (
              notifications.map((notif, index) => (
                <div key={notif.id}>
                  <div
                    className={`${styles.item} ${!notif.isRead ? styles.itemUnread : ''}`}
                    onClick={() => markRead(notif.id)}
                  >
                    <div
                      className={`${styles.iconWrap} ${
                        notif.type === 'bookmark' ? styles.iconBookmark : styles.iconPayment
                      }`}
                    >
                      {notif.type === 'bookmark' ? <BookmarkIcon /> : <PaymentIcon />}
                    </div>

                    <div className={styles.content}>
                      <p className={styles.notifTitle}>{notif.title}</p>
                      <p className={styles.notifDesc}>{notif.description}</p>
                    </div>

                    <div className={styles.meta}>
                      <span className={styles.date}>{notif.date}, {notif.time}</span>
                      {!notif.isRead && <span className={styles.dot} />}
                    </div>
                  </div>
                  {index < notifications.length - 1 && <hr className={styles.divider} />}
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}