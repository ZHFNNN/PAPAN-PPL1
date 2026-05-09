'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';

type BookmarkedProperty = {
  id: string;
  title: string;
  address?: string | null;
  neighbourhood?: string | null;
  district?: string | null;
  city?: string | null;
  price: number;
  coverImageUrl?: string | null;
  listingType: string;
};

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

function formatLocation(item: BookmarkedProperty): string {
  return (
    [item.neighbourhood, item.district, item.city]
      .filter((v) => Boolean(v?.trim()))
      .join(', ') || item.address || 'Lokasi belum tersedia'
  );
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
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await fetch(`/api/bookmarks/${item.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      onRemove(item.id);
    } catch {
      setRemoving(false);
    }
  };

  return (
    <div className={styles.card}>
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

      <div className={styles.cardInfo}>
        <p className={styles.cardTitle}>{item.title}</p>
        <p className={styles.cardLocation}>
          <span className={styles.locationIcon}>📍</span>
          {formatLocation(item)}
        </p>
        <p className={styles.cardPrice}>{formatRupiah(item.price)}</p>
      </div>

      <div className={styles.cardActions}>
        <button className={styles.btnPrimary} onClick={() => onDetail(item.id)}>
          Lihat Detail
        </button>
        <button className={styles.btnSecondary} onClick={() => onSimilar(item.id)}>
          Properti Serupa
        </button>
      </div>

      <button
        className={styles.removeBtn}
        onClick={handleRemove}
        disabled={removing}
        title="Hapus dari bookmark"
      >
        ✕
      </button>
    </div>
  );
}

export default function BookmarkPage() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<BookmarkedProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/bookmarks', {
          credentials: 'include',
          cache: 'no-store',
        });
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(json.message ?? 'Gagal memuat bookmark.');
          return;
        }
        setBookmarks(Array.isArray(json.data) ? json.data : []);
      } catch {
        setError('Terjadi kesalahan saat memuat bookmark.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [router]);

  const handleRemove = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.contentArea}>
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.pageHeader}>
            <div>
              <p className={styles.headerTitle}>Properti yang kamu tandai</p>
              <p className={styles.headerSubtitle}>
                {isLoading ? '...' : `${bookmarks.length} properti tersimpan`}
              </p>
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p>Memuat bookmark...</p>
            </div>
          ) : error ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyIcon}>⚠️</p>
              <p className={styles.emptyTitle}>Terjadi kesalahan</p>
              <p className={styles.emptyDesc}>{error}</p>
            </div>
          ) : bookmarks.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyIcon}>🔖</p>
              <p className={styles.emptyTitle}>Belum ada bookmark</p>
              <p className={styles.emptyDesc}>
                Tandai properti favoritmu agar mudah ditemukan kembali.
              </p>
              <button className={styles.emptyBtn} onClick={() => router.push('/')}>
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
                  onDetail={(id) => router.push(`/propertyDetail/${id}`)}
                  onSimilar={(id) => router.push(`/search?similar=${id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}