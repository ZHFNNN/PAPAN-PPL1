'use client';

import { Suspense, useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';

/* ── Types ── */
type PropertyItem = {
  id: string;
  title: string;
  listingType: string;
  images: string[];
  coverImageUrl?: string | null;
  address?: string | null;
  neighbourhood?: string | null;
  district?: string | null;
  city?: string | null;
  price: number;
  fasilitas?: string[];
};

/* ── Helpers ── */
function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);
}

function formatListingType(type: string) {
  const n = type.trim().toUpperCase();
  if (n === 'RENT') return 'Sewa';
  if (n === 'SELL') return 'Jual';
  return type;
}

function formatLocation(item: PropertyItem) {
  return (
    [item.address, item.neighbourhood, item.district, item.city]
      .filter((v) => Boolean(v?.trim()))
      .join(', ') || 'Lokasi belum tersedia'
  );
}

/* ── Property Card (sama style kayak HomePage) ── */
function PropertyCard({ item, onOpen }: { item: PropertyItem; onOpen: () => void }) {
  const images = item.images?.length > 0 ? item.images : [item.coverImageUrl ?? '/images/bgHomeKosan.jpeg'];
  const [imgIndex, setImgIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isHovered || images.length <= 1) return;
    const id = setInterval(() => {
      setImgIndex((prev) => (prev + 1) % images.length);
    }, 1200);
    return () => clearInterval(id);
  }, [isHovered, images.length]);

  return (
    <article
      className={styles.card}
      role="button"
      tabIndex={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      {/* Image carousel */}
      <div className={styles.cardImageWrapper}>
        <div
          className={styles.cardImageTrack}
          style={{ transform: `translateX(-${imgIndex * 100}%)` }}
        >
          {images.map((src, i) => (
            <img key={i} src={src} alt={item.title} className={styles.cardImage} />
          ))}
        </div>
        {images.length > 1 && (
          <div className={styles.dots}>
            {images.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === imgIndex ? styles.dotActive : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setImgIndex(i);
                }}
              />
            ))}
          </div>
        )}
        <span className={styles.listingBadge}>{formatListingType(item.listingType)}</span>
      </div>

      {/* Card body */}
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{item.title}</h3>
        <p className={styles.cardPrice}>{formatPrice(item.price)}</p>

        <div className={styles.cardLokasi}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
              fill="currentColor"
            />
          </svg>
          <span>{formatLocation(item)}</span>
        </div>

        {item.fasilitas && item.fasilitas.length > 0 && (
          <>
            <hr className={styles.divider} />
            <div className={styles.cardFasilitas}>
              {item.fasilitas.slice(0, 4).map((f) => (
                <span key={f}>{f}</span>
              ))}
            </div>
          </>
        )}
      </div>
    </article>
  );
}

/* ── Skeleton Card ── */
function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonImage} />
      <div className={styles.skeletonBody}>
        <div className={styles.skeletonLine} style={{ width: '70%' }} />
        <div className={styles.skeletonLine} style={{ width: '45%', marginTop: 6 }} />
        <div className={styles.skeletonLine} style={{ width: '60%', marginTop: 10 }} />
      </div>
    </div>
  );
}

/* ── Main Content ── */
function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get('q')?.trim() ?? '';

  const [results, setResults] = useState<PropertyItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const fetchResults = useCallback(async (query: string) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`,
        { signal: abortRef.current.signal }
      );

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? 'Gagal mengambil data.');
      }

      const data = await res.json();
      setResults(Array.isArray(data.data) ? data.data : []);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!q) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    fetchResults(q);
  }, [q, fetchResults]);

  const openDetail = (id: string) => {
    router.push(`/propertyDetail/${encodeURIComponent(id)}`);
  };

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.contentArea}>
        <div className={styles.container}>
          {/* Header */}
          <h1 className={styles.title}>Hasil Pencarian</h1>
          <p className={styles.subtitle}>
            {q
              ? isLoading
                ? `Mencari "${q}"…`
                : `${results.length} properti ditemukan untuk "${q}"`
              : 'Masukkan kata kunci di search bar.'}
          </p>

          {/* Error */}
          {error && (
            <div className={styles.emptyState}>
              ⚠️ {error}
            </div>
          )}

          {/* Loading skeletons */}
          {isLoading && (
            <div className={styles.grid}>
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Empty */}
          {!isLoading && hasSearched && results.length === 0 && !error && (
            <div className={styles.emptyState}>
              Properti yang kamu cari tidak ditemukan.
              {q ? ` Coba kata kunci lain untuk "${q}".` : ''}
            </div>
          )}

          {/* Results */}
          {!isLoading && results.length > 0 && (
            <div className={styles.grid}>
              {results.map((item) => (
                <PropertyCard
                  key={item.id}
                  item={item}
                  onOpen={() => openDetail(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ── Export ── */
export default function SearchPage() {
  return (
    <Suspense fallback={<main style={{ padding: '7rem 1rem' }}>Memuat pencarian…</main>}>
      <SearchPageContent />
    </Suspense>
  );
}