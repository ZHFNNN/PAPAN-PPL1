'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';
import { formatPrice } from '@/lib/format-price';

type PropertyDetail = {
  id: string;
  title: string;
  address?: string | null;
  city?: string | null;
  district?: string | null;
  neighbourhood?: string | null;
  imageUrls?: string[];
  description: string | null;
  price: string;
  listingType: string;
  lat?: number | null;
  lng?: number | null;
  owner?: {
    name?: string | null;
    username?: string | null;
  };
  facilities: Array<{ code: string; name: string }>;
  createdAt: string;
};

type PropertyDetailClientProps = {
  propertyId: string;
};

type DisplayProperty = {
  id: string;
  title: string;
  kategori: string;
  price: string;
  biayaHidup: string;
  lokasi: string;
  luas: string;
  lantai: string;
  kt: string;
  km: string;
  fasilitas: string[];
  images: string[];
  description: string;
  lat: number | null;
  lng: number | null;
  ownerName: string;
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80';

function mapApiProperty(data: PropertyDetail): DisplayProperty {
  const lokasi = [data.address, data.neighbourhood, data.district, data.city]
    .filter((value) => Boolean(value && value.trim()))
    .join(', ');

  return {
    id: data.id,
    title: data.title,
    kategori: data.listingType === 'RENT' ? 'Properti Sewa' : data.listingType === 'SELL' ? 'Properti Jual' : 'Properti',
    price: formatPrice(data.price),
    biayaHidup: 'Estimasi biaya hidup: -',
    lokasi: lokasi || 'Lokasi belum tersedia',
    luas: '-',
    lantai: '-',
    kt: '-',
    km: '-',
    fasilitas: data.facilities.map((item) => item.name),
    images: data.imageUrls && data.imageUrls.length > 0 ? data.imageUrls : [FALLBACK_IMAGE],
    description: data.description ?? 'Tidak ada deskripsi.',
    lat: data.lat ?? null,
    lng: data.lng ?? null,
    ownerName: data.owner?.name ?? data.owner?.username ?? 'Pemilik Properti',
  };
}

export default function PropertyDetailClient({ propertyId }: PropertyDetailClientProps) {
  const router = useRouter();

  const [data, setData] = useState<PropertyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  // bookmark states
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const [descExpanded, setDescExpanded] = useState(false);

  // Fetch property data
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!propertyId) {
        setError('ID properti tidak tersedia.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/properties/${encodeURIComponent(propertyId)}`);
        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          const message = json.message ?? (res.status === 404
            ? 'Properti tidak ditemukan.'
            : 'Gagal memuat detail properti.');
          throw new Error(message);
        }

        if (!cancelled) {
          setData(json.data as PropertyDetail);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [propertyId]);

  // Cek status bookmark saat propertyId tersedia
  useEffect(() => {
    if (!propertyId) return;
    let cancelled = false;

    const checkBookmark = async () => {
      try {
        const res = await fetch(`/api/bookmarks/${encodeURIComponent(propertyId)}`);
        // 401 = belum login, skip saja tanpa error
        if (res.status === 401) return;
        if (!res.ok) return;
        const json = await res.json().catch(() => ({}));
        if (!cancelled) setBookmarked(Boolean(json.isBookmarked));
      } catch {
        // silent fail — fitur bookmark tidak krusial
      }
    };

    checkBookmark();
    return () => { cancelled = true; };
  }, [propertyId]);

  const prop = useMemo<DisplayProperty | null>(() => {
    if (data) return mapApiProperty(data);
    return null;
  }, [data]);

  useEffect(() => {
    setActiveImage(0);
    setDescExpanded(false);
  }, [prop?.id]);

  const handleShare = async () => {
    if (!prop) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: prop.title, url: window.location.href });
      } else {
        throw new Error('Share API tidak tersedia');
      }
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link berhasil disalin!');
    }
  };

  const handleBuy = () => {
    alert('Fitur pembelian akan segera hadir!');
  };

  const handleBookmark = async () => {
    if (bookmarkLoading || !propertyId) return;
    setBookmarkLoading(true);

    try {
      if (bookmarked) {
        // Hapus bookmark
        const res = await fetch(`/api/bookmarks/${encodeURIComponent(propertyId)}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        const json = await res.json().catch(() => ({}));
        if (res.status === 401) { router.push('/login'); return; }
        if (!res.ok) {
          alert(json.message ?? 'Gagal menghapus bookmark.');
          return;
        }
        setBookmarked(false);
      } else {
        // Tambah bookmark
        const res = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ propertyId }),
          credentials: 'include',
        });
        const json = await res.json().catch(() => ({}));
        if (res.status === 401) { router.push('/login'); return; }
        if (!res.ok) {
          alert(json.message ?? 'Gagal menyimpan bookmark.');
          return;
        }
        setBookmarked(true);
      }
    } catch {
      alert('Terjadi kesalahan saat memperbarui bookmark.');
    } finally {
      setBookmarkLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.loadingWrapper}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Memuat properti…</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!prop) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.loadingWrapper}>
          <p className={styles.loadingText}>{error ?? 'Properti tidak ditemukan.'}</p>
          <button className={styles.backBtn} onClick={() => router.push('/')}>
            ← Kembali ke Home
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const SHORT = 220;
  const deskripsi = prop.description;
  const displayDesc = descExpanded || deskripsi.length <= SHORT ? deskripsi : `${deskripsi.slice(0, SHORT)}…`;
  const activeImageSrc = prop.images[activeImage] ?? prop.images[0];

  const mapQuery = prop.lat && prop.lng
    ? `${prop.lat},${prop.lng}`
    : encodeURIComponent(prop.lokasi);
  const mapZoom = prop.lat && prop.lng ? 15 : 12;
  const mapSrc = `https://maps.google.com/maps?q=${mapQuery}&z=${mapZoom}&output=embed`;

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.contentArea}>
        <div className={styles.container}>
          <button className={styles.backBtn} onClick={() => router.back()}>
            ← Kembali
          </button>

          <div className={styles.topSection}>
            <div className={styles.galleryWrapper}>
              <div className={styles.mainImage}>
                <img src={activeImageSrc} alt={prop.title} />
              </div>
              <div className={styles.thumbnailColumn}>
                {prop.images.map((src, i) => (
                  <div
                    key={`${src}-${i}`}
                    className={`${styles.thumbnail} ${activeImage === i ? styles.thumbnailActive : ''}`}
                    onClick={() => setActiveImage(i)}
                  >
                    <img src={src} alt={`Foto ${i + 1}`} />
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.priceCard}>
              <p className={styles.priceLabel}>Harga</p>
              <p className={styles.priceValue}>{prop.price}</p>
              <p className={styles.priceEstimate}>{prop.biayaHidup}</p>

              <button className={styles.btnBuy} onClick={handleBuy}>
                Beli Sekarang
              </button>

              {/* Tombol Simpan/Hapus Bookmark */}
              <button
                className={`${styles.btnOutline} ${bookmarked ? styles.btnOutlineActive : ''}`}
                onClick={handleBookmark}
                disabled={bookmarkLoading}
              >
                {bookmarkLoading
                  ? '...'
                  : bookmarked
                    ? '✓ Hapus dari Simpanan'
                    : '🔖 Simpan'}
              </button>

              <button className={styles.btnOutline} onClick={handleShare}>
                Bagikan
              </button>

              <hr className={styles.divider} />

              <div className={styles.agentRow}>
                <div className={styles.agentAvatar}>👤</div>
                <div className={styles.agentInfo}>
                  <p className={styles.agentName}>{prop.ownerName}</p>
                  <p className={styles.agentRole}>Pemilik Properti</p>
                </div>
                <button className={styles.agentContactBtn}>Hubungi</button>
              </div>
            </div>
          </div>

          <h1 className={styles.propertyTitle}>{prop.title}</h1>
          <div className={styles.lokasi}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                fill="currentColor"
              />
            </svg>
            <span>{prop.lokasi}</span>
          </div>
          <div className={styles.chipsRow}>
            <span className={styles.chip}>Luas {prop.luas}</span>
            <span className={styles.chip}>{prop.km} Kamar Mandi</span>
            <span className={styles.chip}>{prop.kt} Kamar Tidur</span>
            {prop.fasilitas.map((facility) => (
              <span key={facility} className={styles.chip}>{facility}</span>
            ))}
            <span className={styles.chip}>{prop.lantai}</span>
          </div>

          <h2 className={styles.sectionTitle}>Deskripsi</h2>
          <p className={styles.descText}>{displayDesc}</p>
          {deskripsi.length > SHORT && (
            <button className={styles.readMoreBtn} onClick={() => setDescExpanded((prev) => !prev)}>
              {descExpanded ? 'Tampilkan lebih sedikit' : 'Baca selengkapnya'}
            </button>
          )}

          <div className={styles.mapSection}>
            <h2 className={styles.sectionTitle}>Lokasi</h2>
            <iframe
              title="Lokasi properti"
              src={mapSrc}
              className={styles.mapFrame}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}