'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../HomePage.module.css';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { formatPrice } from '../../../lib/format-price';
import { type ApiProperty, type PropertyCardData, mapApiPropertyToCard } from '@/types/property';

type KategoriType = 'Apartemen' | 'Rumah' | 'Kosan';

const HOTSPOTS = [
  {
    id: 'apartemen',
    href: '/kategori/apartemen',
    img: '/images/apartOverlay.png',
    // area bangunan apartemen (kiri-tengah)
    left: 24, top: 18, width: 18, height: 72,
  },
  {
    id: 'rumah',
    href: '/kategori/rumah',
    img: '/images/rumahOverlay.png',
    // rumah tengah
    left: 44, top: 25, width: 16, height: 65,
  },
  {
    id: 'kosan',
    href: '/kategori/kosan',
    img: '/images/kosanOverlay.png',
    // kosan kanan
    left: 62, top: 18, width: 18, height: 72,
  },
] as const;

const HERO_HOVER_STORAGE_KEY = 'hero-hover-spot';

function PropertyCard({ prop }: { prop: PropertyCardData }) {
  const [imgIndex, setImgIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isHovered) return;
    const id = setInterval(() => {
      setImgIndex((prev) => (prev + 1) % prop.images.length);
    }, 1200);
    return () => clearInterval(id);
  }, [isHovered, prop.images.length]);

  return (
    <div
      className={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.cardImageWrapper}>
        <div
          className={styles.cardImageTrack}
          style={{ transform: `translateX(-${imgIndex * 100}%)` }}
        >
          {prop.images.map((src, i) => (
            <img key={i} src={src} alt={prop.title} className={styles.cardImage} />
          ))}
        </div>
        <div className={styles.dots}>
          {prop.images.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === imgIndex ? styles.dotActive : ''}`}
              onClick={() => setImgIndex(i)}
            />
          ))}
        </div>
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{prop.title}</h3>
        <p className={styles.cardPrice}>{formatPrice(prop.price)}</p>
        <p className={styles.cardBiaya}>{prop.biayaHidup}</p>
        <div className={styles.cardLokasi}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor" />
          </svg>
          <span>{prop.lokasi}</span>
        </div>
        <hr className={styles.divider} />
        <div className={styles.cardStats}>
          <span>{prop.luas}</span>
          <span>{prop.lantai}</span>
          <span>{prop.kt}</span>
          <span>{prop.km}</span>
        </div>
        <div className={styles.cardFasilitas}>
          {prop.fasilitas.map((f) => <span key={f}>{f}</span>)}
        </div>
      </div>
    </div>
  );
}

function PropertySection({
  title,
  data,
  isLoading,
  error,
}: {
  title: string;
  data: PropertyCardData[];
  isLoading: boolean;
  error: string | null;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 370 : -370, behavior: 'smooth' });
  };

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <div className={styles.arrowBtns}>
          <button className={styles.arrowBtn} onClick={() => scroll('left')}>&#8592;</button>
          <button className={styles.arrowBtn} onClick={() => scroll('right')}>&#8594;</button>
        </div>
      </div>
      <div className={styles.scrollTrack} ref={scrollRef}>
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={`skeleton-${i}`} className={styles.skeletonCard} aria-hidden>
              <div className={`${styles.skeletonImg} ${styles.skeletonShimmer}`} />
              <div className={styles.skeletonBody}>
                <div className={`${styles.skeletonLine} ${styles.skeletonShimmer} ${styles.lg} ${styles.w70}`} />
                <div className={`${styles.skeletonLine} ${styles.skeletonShimmer} ${styles.md} ${styles.w50}`} />
                <div className={`${styles.skeletonLine} ${styles.skeletonShimmer} ${styles.sm} ${styles.w60}`} />
                <div className={styles.skeletonRow}>
                  <span className={`${styles.skeletonPill} ${styles.skeletonShimmer}`} />
                  <span className={`${styles.skeletonPill} ${styles.skeletonShimmer}`} />
                  <span className={`${styles.skeletonPill} ${styles.skeletonShimmer}`} />
                </div>
              </div>
            </div>
          ))
        ) : error ? (
          <p style={{ color: '#999', padding: '20px 0' }}>{error}</p>
        ) : data.length === 0 ? (
          <p style={{ color: '#999', padding: '20px 0' }}>Tidak ada properti tersedia.</p>
        ) : (
          data.map((p) => <PropertyCard key={p.id} prop={p} />)
        )}
      </div>
    </section>
  );
}

export default function KosanPage() {                           // ← BEDA 1: nama fungsi
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const [charaX, setCharaX] = useState(50);
const [hoveredSpot, setHoveredSpot] = useState<string | null>(null);
  const [items, setItems] = useState<PropertyCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabs: KategoriType[] = ['Apartemen', 'Rumah', 'Kosan'];
  const aktif: KategoriType = 'Kosan';                          // ← BEDA 2: nilai aktif
  const aktifSpotId = aktif.toLowerCase();

  useEffect(() => {
    router.prefetch('/');
    router.prefetch('/kategori/apartemen');
    router.prefetch('/kategori/rumah');
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    const loadProperties = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/properties?category=KOSAN&take=120');
        const json = await res.json().catch(() => ({}));
        const data = Array.isArray(json.data) ? (json.data as ApiProperty[]) : [];
        if (!cancelled) {
          setItems(data.map(mapApiPropertyToCard));
        }
      } catch {
        if (!cancelled) {
          setError('Gagal memuat properti.');
          setItems([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadProperties();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedSpot = sessionStorage.getItem(HERO_HOVER_STORAGE_KEY);
    if (savedSpot && HOTSPOTS.some((spot) => spot.id === savedSpot)) {
      setHoveredSpot(savedSpot);
    }
    sessionStorage.removeItem(HERO_HOVER_STORAGE_KEY);
  }, []);

  const filtered = items;
  const countLabel = isLoading ? '...' : String(filtered.length);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setCharaX(Math.min(Math.max(((e.clientX - rect.left) / rect.width) * 100, 5), 88));
  };

  const navigateWithFade = (href: string) => {
    router.push(href);
  };

  const handleHotspotClick = (spot: (typeof HOTSPOTS)[number]) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(HERO_HOVER_STORAGE_KEY, spot.id);
    }

    if (spot.id === aktifSpotId) {
      router.push('/');
      return;
    }

    router.push(spot.href);
  };

  const handleTabClick = (tab: KategoriType) => {
    if (tab === aktif) {
      navigateWithFade('/');
      return;
    }
    navigateWithFade(`/kategori/${tab.toLowerCase()}`);
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <div
        className={`${styles.hero} ${styles.heroFadeIn}`}
        ref={heroRef}
        onMouseMove={handleMouseMove}
      >
        <img src="/images/bgHomeKosan.jpeg" alt="Hero" className={styles.heroBg} />
        
        {/* Foto kategori — fade in saat hover bangunan, sama persis posisi/ukuran heroBg */}
        {HOTSPOTS.map((spot) => (
          <img
            key={spot.id}
            src={spot.img}
            alt={spot.id}
            className={`${styles.heroBg} ${styles.heroBgOverlay} ${hoveredSpot === spot.id ? styles.heroBgOverlayVisible : ''}`}
          />
        ))}

        {/* Invisible hitbox per bangunan */}
        {HOTSPOTS.map((spot) => (
          <div
            key={spot.id}
            className={styles.hotspot}
            style={{
              left:   `${spot.left}%`,
              top:    `${spot.top}%`,
              width:  `${spot.width}%`,
              height: `${spot.height}%`,
            }}
            onMouseEnter={() => setHoveredSpot(spot.id)}
            onMouseLeave={() => setHoveredSpot(null)}
            onClick={() => handleHotspotClick(spot)}
            role="button"
            aria-label={`Lihat ${spot.id}`}
          />
        ))}
        
        <img src="/images/chara.png" alt="chara" className={styles.charaImg} style={{ left: `${charaX}%` }} />
        <div className={styles.tabsWrapper}>
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${tab === aktif ? styles.tabActive : ''}`}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.content}>
        <div style={{ paddingTop: 48 }}>
          <h1 style={{ fontSize: 'clamp(20px, 2.5vw, 30px)', fontWeight: 700, color: '#1a2332', margin: 0 }}>
            Kosan                                               {/* ← BEDA 3: judul */}
          </h1>
          <p style={{ color: '#888', fontSize: 14, marginTop: 6 }}>
            Menampilkan {countLabel} properti
          </p>
        </div>
        <PropertySection title="Rekomendasi" data={filtered} isLoading={isLoading} error={error} />
        <PropertySection title="Best Seller" data={filtered} isLoading={isLoading} error={error} />
      </div>
      <Footer />
    </div>
  );
}