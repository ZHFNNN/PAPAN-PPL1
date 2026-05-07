'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import styles from './page.module.css';

type BookmarkedProperty = {
  id: string;
  title: string;
  location: string;
  price: number;
  coverImageUrl?: string | null;
  listingType: string;
};

// Dummy data – ganti dengan fetch API saat endpoint tersedia
const DUMMY_BOOKMARKS: BookmarkedProperty[] = [
  {
    id: '1',
    title: 'Rumah keren nan megah',
    location: 'Kebayoran Baru, Jakarta Selatan',
    price: 3500000000,
    coverImageUrl: '/images/rumah1.jpg',
    listingType: 'Rumah',
  },
  {
    id: '2',
    title: 'Kosan Phareab',
    location: 'Kebayoran Baru, Jakarta Selatan',
    price: 1200000,
    coverImageUrl: '/images/kosan1.jpg',
    listingType: 'Kosan',
  },
];

function formatRupiah(value: number): string {
  if (value >= 1_000_000_000) {
    const val = value / 1_000_000_000;
    return `Rp${val % 1 === 0 ? val : val.toFixed(1)} Miliar`;
  }
  if (value >= 1_000_000) {
    const val = value / 1_000_000;
    return `Rp${val % 1 === 0 ? val : val.toFixed(1)} Juta`;
  }
  return `Rp${value.toLocaleString('id-ID')}`;
}

function BookmarkCard({
  item,
  onRemove,
  onDetail,
  onSimilar,
}: {
  item: BookmarkedProperty;
  onRemove: (id: string) => void;
  onDetail: (id: string) => void;
  onSimilar: (id: string) => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={styles.card}>
      {/* Thumbnail */}
      <div className={styles.cardThumb}>
        {item.coverImageUrl && !imgError ? (
          <img
            src={item.coverImageUrl}
            alt={item.title}
            className={styles.cardImg}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={styles.cardImgFallback}>
            <span>🏠</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className={styles.cardInfo}>
        <p className={styles.cardTitle}>{item.title}</p>
        <p className={styles.cardLocation}>
          <span className={styles.locationIcon}>📍</span>
          {item.location}
        </p>
        <p className={styles.cardPrice}>{formatRupiah(item.price)}</p>
      </div>

      {/* Actions */}
      <div className={styles.cardActions}>
        <button
          className={styles.btnPrimary}
          onClick={() => onDetail(item.id)}
        >
          Beli Sekarang
        </button>
        <button
          className={styles.btnSecondary}
          onClick={() => onSimilar(item.id)}
        >
          Lihat properti serupa
        </button>
      </div>

      {/* Remove bookmark */}
      <button
        className={styles.removeBtn}
        onClick={() => onRemove(item.id)}
        title="Hapus dari bookmark"
      >
        ✕
      </button>
    </div>
  );
}

export default function BookmarkPage() {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkedProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: ganti dengan fetch('/api/bookmarks') saat endpoint tersedia
    const timer = setTimeout(() => {
      setBookmarks(DUMMY_BOOKMARKS);
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    // TODO: DELETE /api/bookmarks/:id
  };

  const handleDetail = (id: string) => {
    router.push(`/propertyDetail/${id}`);
  };

  const handleSimilar = (id: string) => {
    router.push(`/search?similar=${id}`);
  };

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.contentArea}>
        <div className={styles.container}>
          {/* Sidebar */}
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((prev) => !prev)}
          />

          {/* Main */}
          <div className={styles.mainContent}>
            {/* Header */}
            <div className={styles.pageHeader}>
              <span className={styles.headerIcon}>🔖</span>
              <div>
                <p className={styles.headerTitle}>Properti yang kamu tandai</p>
                <p className={styles.headerSubtitle}>
                  {bookmarks.length} properti tersimpan
                </p>
              </div>
            </div>

            {/* Content */}
            {isLoading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner} />
                <p>Memuat bookmark...</p>
              </div>
            ) : bookmarks.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyIcon}>🔖</p>
                <p className={styles.emptyTitle}>Belum ada bookmark</p>
                <p className={styles.emptyDesc}>
                  Tandai properti favoritmu agar mudah ditemukan kembali.
                </p>
                <button
                  className={styles.emptyBtn}
                  onClick={() => router.push('/')}
                >
                  Jelajahi Properti
                </button>
              </div>
            ) : (
              <div className={styles.cardList}>
                {bookmarks.map((item) => (
                  <BookmarkCard
                    key={item.id}
                    item={item}
                    onRemove={handleRemove}
                    onDetail={handleDetail}
                    onSimilar={handleSimilar}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}