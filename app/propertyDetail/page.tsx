'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import styles from './page.module.css';

interface Property {
  id: number;
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
}

export default function PropertyDetailPage() {
  const router = useRouter();
  const [prop, setProp] = useState<Property | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('selectedProperty');
    if (raw) {
      setProp(JSON.parse(raw));
    }
  }, []);

  const handleShare = async () => {
    try {
      await navigator.share({ title: prop?.title, url: window.location.href });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link berhasil disalin!');
    }
  };

  const handleBuy = () => {
    alert('Fitur pembelian akan segera hadir!');
  };

  if (!prop) {
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

  const thumbnails = prop.images.slice(1, 5);
  const deskripsi = `Hunian ${prop.kategori.toLowerCase()} seluas ${prop.luas} di kawasan ${prop.lokasi}. Properti ini menawarkan ${prop.kt} dan ${prop.km} dengan berbagai fasilitas unggulan termasuk ${prop.fasilitas.join(', ')}. Dengan ${prop.lantai}, hunian ini memberikan ruang yang luas dan nyaman bagi seluruh keluarga. Lokasi yang strategis menjadikannya pilihan ideal bagi mereka yang menginginkan kenyamanan urban dengan nuansa eksklusif.`;
  const SHORT = 220;
  const displayDesc = descExpanded ? deskripsi : deskripsi.slice(0, SHORT) + '…';

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.contentArea}>
        <div className={styles.container}>

          <button className={styles.backBtn} onClick={() => router.back()}>
            ← Kembali
          </button>

          {/* Gallery */}
          <div className={styles.galleryWrapper}>
            <div className={styles.mainImage}>
              <img src={prop.images[activeImage]} alt={prop.title} />
            </div>
            {thumbnails.length > 0 && (
              <div className={styles.thumbnailColumn}>
                {thumbnails.map((src, i) => (
                  <div
                    key={i}
                    className={`${styles.thumbnail} ${activeImage === i + 1 ? styles.thumbnailActive : ''}`}
                    onClick={() => setActiveImage(i + 1)}
                  >
                    <img src={src} alt={`Foto ${i + 2}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Main layout */}
          <div className={styles.mainLayout}>

            {/* Left */}
            <div className={styles.leftColumn}>
              <div className={styles.card}>
                <h1 className={styles.propertyTitle}>{prop.title}</h1>
                <div className={styles.lokasi}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor" />
                  </svg>
                  <span>{prop.lokasi}</span>
                </div>
                <div className={styles.chipsRow}>
                  <span className={styles.chip}>Luas {prop.luas}</span>
                  <span className={styles.chip}>{prop.km} Kamar Mandi</span>
                  <span className={styles.chip}>{prop.kt} Kamar Tidur</span>
                  {prop.fasilitas.map((f) => (
                    <span key={f} className={styles.chip}>{f}</span>
                  ))}
                  <span className={styles.chip}>{prop.lantai}</span>
                </div>
              </div>

              <div className={styles.card}>
                <h2 className={styles.sectionTitle}>Deskripsi</h2>
                <p className={styles.descText}>{displayDesc}</p>
                <button className={styles.readMoreBtn} onClick={() => setDescExpanded(p => !p)}>
                  {descExpanded ? 'Tampilkan lebih sedikit' : 'Baca selengkapnya'}
                </button>
              </div>

              <div className={styles.card}>
                <h2 className={styles.sectionTitle}>Lokasi</h2>
                <div className={styles.mapPlaceholder}>
                  <span>🗺️</span>
                  <span>{prop.lokasi}</span>
                </div>
              </div>
            </div>

            {/* Right */}
            <div className={styles.rightColumn}>
              <div className={styles.priceCard}>
                <p className={styles.priceLabel}>Harga</p>
                <p className={styles.priceValue}>{prop.price}</p>
                <p className={styles.priceEstimate}>{prop.biayaHidup}</p>

                <button className={styles.btnBuy} onClick={handleBuy}>Beli Sekarang</button>
                <button className={styles.btnOutline} onClick={() => setBookmarked(p => !p)}>
                  {bookmarked ? '✓ Disimpan' : 'Simpan'}
                </button>
                <button className={styles.btnOutline} onClick={handleShare}>Bagikan</button>

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