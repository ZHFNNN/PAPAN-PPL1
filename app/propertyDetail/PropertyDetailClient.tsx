'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';
import { properties, type Properti } from '@/lib/properties';

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
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80';

function formatPrice(price: string) {
  const numeric = Number(price);
  if (Number.isNaN(numeric)) return price;
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(numeric);
}

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
  };
}

function mapLocalProperty(data: Properti): DisplayProperty {
  return {
    id: String(data.id),
    title: data.title,
    kategori: data.kategori,
    price: data.price,
    biayaHidup: data.biayaHidup,
    lokasi: data.lokasi,
    luas: data.luas,
    lantai: data.lantai,
    kt: data.kt,
    km: data.km,
    fasilitas: data.fasilitas,
    images: data.images.length > 0 ? data.images : [FALLBACK_IMAGE],
    description: `Hunian ${data.kategori.toLowerCase()} seluas ${data.luas} di kawasan ${data.lokasi}. Properti ini menawarkan ${data.kt} dan ${data.km} dengan berbagai fasilitas unggulan termasuk ${data.fasilitas.join(', ')}. Dengan ${data.lantai}, hunian ini memberikan ruang yang luas dan nyaman bagi seluruh keluarga. Lokasi yang strategis menjadikannya pilihan ideal bagi mereka yang menginginkan kenyamanan urban dengan nuansa eksklusif.`,
  };
}

export default function PropertyDetailClient({ propertyId }: PropertyDetailClientProps) {
  const router = useRouter();

  const [data, setData] = useState<PropertyDetail | null>(null);
  const [localData, setLocalData] = useState<Properti | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

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
          if (res.status === 404) {
            const numericId = Number(propertyId);
            const fallback = Number.isNaN(numericId) ? null : properties.find((item) => item.id === numericId) ?? null;

            if (fallback) {
              if (!cancelled) {
                setLocalData(fallback);
                setData(null);
                setError(null);
              }
              return;
            }
          }

          throw new Error(json.message ?? 'Gagal memuat detail properti.');
        }

        if (!cancelled) {
          setData(json.data as PropertyDetail);
          setLocalData(null);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
          setLocalData(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  const prop = useMemo<DisplayProperty | null>(() => {
    if (localData) return mapLocalProperty(localData);
    if (data) return mapApiProperty(data);
    return null;
  }, [data, localData]);

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

  const thumbnails = prop.images.slice(1, 5);
  const SHORT = 220;
  const deskripsi = prop.description;
  const displayDesc = descExpanded || deskripsi.length <= SHORT ? deskripsi : `${deskripsi.slice(0, SHORT)}…`;
  const activeImageSrc = prop.images[activeImage] ?? prop.images[0];

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.contentArea}>
        <div className={styles.container}>
          <button className={styles.backBtn} onClick={() => router.back()}>
            ← Kembali
          </button>

          <div className={styles.galleryWrapper}>
            <div className={styles.mainImage}>
              <img src={activeImageSrc} alt={prop.title} />
            </div>
            {thumbnails.length > 0 && (
              <div className={styles.thumbnailColumn}>
                {thumbnails.map((src, i) => (
                  <div
                    key={`${src}-${i}`}
                    className={`${styles.thumbnail} ${activeImage === i + 1 ? styles.thumbnailActive : ''}`}
                    onClick={() => setActiveImage(i + 1)}
                  >
                    <img src={src} alt={`Foto ${i + 2}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.mainLayout}>
            <div className={styles.leftColumn}>
              <div className={styles.card}>
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
                    <span key={facility} className={styles.chip}>
                      {facility}
                    </span>
                  ))}
                  <span className={styles.chip}>{prop.lantai}</span>
                </div>
              </div>

              <div className={styles.card}>
                <h2 className={styles.sectionTitle}>Deskripsi</h2>
                <p className={styles.descText}>{displayDesc}</p>
                {deskripsi.length > SHORT && (
                  <button className={styles.readMoreBtn} onClick={() => setDescExpanded((prev) => !prev)}>
                    {descExpanded ? 'Tampilkan lebih sedikit' : 'Baca selengkapnya'}
                  </button>
                )}
              </div>

              <div className={styles.card}>
                <h2 className={styles.sectionTitle}>Lokasi</h2>
                <div className={styles.mapPlaceholder}>
                  <span>🗺️</span>
                  <span>{prop.lokasi}</span>
                </div>
              </div>
            </div>

            <div className={styles.rightColumn}>
              <div className={styles.priceCard}>
                <p className={styles.priceLabel}>Harga</p>
                <p className={styles.priceValue}>{prop.price}</p>
                <p className={styles.priceEstimate}>{prop.biayaHidup}</p>

                <button className={styles.btnBuy} onClick={handleBuy}>
                  Beli Sekarang
                </button>
                <button className={styles.btnOutline} onClick={() => setBookmarked((prev) => !prev)}>
                  {bookmarked ? '✓ Disimpan' : 'Simpan'}
                </button>
                <button className={styles.btnOutline} onClick={handleShare}>
                  Bagikan
                </button>

                <hr className={styles.divider} />

                <div className={styles.agentRow}>
                  <div className={styles.agentAvatar}>👤</div>
                  <div className={styles.agentInfo}>
                    <p className={styles.agentName}>Budi Santoso</p>
                    <p className={styles.agentRole}>Pemilik Properti</p>
                  </div>
                  <button className={styles.agentContactBtn}>Hubungi</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
