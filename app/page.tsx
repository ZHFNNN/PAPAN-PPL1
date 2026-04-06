'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './HomePage.module.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// ─── Data dummy properti ───────────────────────────────────────────────────────
const properties = [
  {
    id: 1,
    title: 'Rumah keren nan megah',
    kategori: 'Rumah',
    price: 'Rp3.500.000.000',
    biayaHidup: 'Estimasi biaya hidup: 8 juta/bulan',
    lokasi: 'Kebayoran Baru, Jakarta Selatan',
    luas: '195m²',
    lantai: '2 Lantai',
    kt: '5KT',
    km: '7KM',
    fasilitas: ['Kolam Renang', 'Garasi 2 Mobil'],
    images: [
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=400&q=80',
    ],
  },
  {
    id: 2,
    title: 'Apartemen mewah tepi danau',
    kategori: 'Apartemen',
    price: 'Rp5.200.000.000',
    biayaHidup: 'Estimasi biaya hidup: 12 juta/bulan',
    lokasi: 'Depok, Jawa Barat',
    luas: '320m²',
    lantai: '3 Lantai',
    kt: '6KT',
    km: '5KM',
    fasilitas: ['Kolam Renang', 'Garasi 3 Mobil'],
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
    ],
  },
  {
    id: 3,
    title: 'Rumah minimalis modern',
    kategori: 'Rumah',
    price: 'Rp1.800.000.000',
    biayaHidup: 'Estimasi biaya hidup: 5 juta/bulan',
    lokasi: 'Tangerang Selatan, Banten',
    luas: '120m²',
    lantai: '1 Lantai',
    kt: '3KT',
    km: '2KM',
    fasilitas: ['Taman', 'Garasi 1 Mobil'],
    images: [
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=400&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&q=80',
    ],
  },
  {
    id: 4,
    title: 'Townhouse eksklusif',
    kategori: 'Kosan',
    price: 'Rp2.900.000.000',
    biayaHidup: 'Estimasi biaya hidup: 7 juta/bulan',
    lokasi: 'BSD City, Tangerang',
    luas: '210m²',
    lantai: '2 Lantai',
    kt: '4KT',
    km: '3KM',
    fasilitas: ['Kolam Renang', 'Taman'],
    images: [
      'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&q=80',
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=400&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80',
    ],
  },
  {
    id: 5,
    title: 'Kosan sangat asri perumahan',
    kategori: 'Kosan',
    price: 'Rp980.000.000',
    biayaHidup: 'Estimasi biaya hidup: 3 juta/bulan',
    lokasi: 'Bekasi, Jawa Barat',
    luas: '90m²',
    lantai: '2 Lantai',
    kt: '3KT',
    km: '2KM',
    fasilitas: ['Carport', 'Taman kecil'],
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
      'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&q=80',
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=400&q=80',
    ],
  },
  {
    id: 6,
    title: 'Apartemen heritage art deco',
    kategori: 'Apartemen',
    price: 'Rp4.100.000.000',
    biayaHidup: 'Estimasi biaya hidup: 10 juta/bulan',
    lokasi: 'Menteng, Jakarta Pusat',
    luas: '450m²',
    lantai: '2 Lantai',
    kt: '7KT',
    km: '6KM',
    fasilitas: ['Kolam Renang', 'Gazebo'],
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
      'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&q=80',
    ],
  },
];

type KategoriType = 'Apartemen' | 'Rumah' | 'Kosan';

function PropertyCard({ prop }: { prop: (typeof properties)[0] }) {
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
        <p className={styles.cardPrice}>{prop.price}</p>
        <p className={styles.cardBiaya}>{prop.biayaHidup}</p>

        <div className={styles.cardLokasi}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
              fill="currentColor"
            />
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
          {prop.fasilitas.map((f) => (
            <span key={f}>{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function PropertySection({ title }: { title: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'right' ? 370 : -370, behavior: 'smooth' });
    }
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
        {properties.map((p) => (
          <PropertyCard key={p.id} prop={p} />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const [kategori, setKategori] = useState<KategoriType>('Apartemen');

  const [charaX, setCharaX] = useState(50);
  const heroRef = useRef<HTMLDivElement>(null);

  const tabs: KategoriType[] = ['Apartemen', 'Rumah', 'Kosan'];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    setCharaX(Math.min(Math.max(xPercent, 5), 88));
  };

  return (
    <div className={styles.page}>
      <Navbar />

      {/* ── Hero ── */}
      <div
        className={styles.hero}
        ref={heroRef}
        onMouseMove={handleMouseMove}
      >
        <img src="/images/bgHome.jpeg" alt="Hero" className={styles.heroBg} />
        <img
          src="/images/chara.png"
          alt="chara"
          className={styles.charaImg}
          style={{ left: `${charaX}%` }}
        />

        {/* ── Tab bar DIDALAM hero, nempel di bawah ── */}
        <div className={styles.tabsWrapper}>
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${kategori === tab ? styles.tabActive : ''}`}
              onClick={() => setKategori(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Konten ── */}
      <div className={styles.content}>
        <PropertySection title="Rekomendasi" />
        <PropertySection title="Best Seller" />
      </div>
      <Footer />
    </div>
  );
}