'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../HomePage.module.css';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { properties, Properti } from '../../../lib/properties';

type KategoriType = 'Apartemen' | 'Rumah' | 'Kosan';

function PropertyCard({ prop }: { prop: Properti }) {
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

function PropertySection({ title, data }: { title: string; data: Properti[] }) {
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
        {data.length === 0
          ? <p style={{ color: '#999', padding: '20px 0' }}>Tidak ada properti tersedia.</p>
          : data.map((p) => <PropertyCard key={p.id} prop={p} />)
        }
      </div>
    </section>
  );
}

export default function RumahPage() {                           // ← BEDA 1: nama fungsi
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const [charaX, setCharaX] = useState(50);

  const tabs: KategoriType[] = ['Apartemen', 'Rumah', 'Kosan'];
  const aktif: KategoriType = 'Rumah';                          // ← BEDA 2: nilai aktif

  const filtered = properties.filter((p) => p.kategori === aktif);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setCharaX(Math.min(Math.max(((e.clientX - rect.left) / rect.width) * 100, 5), 88));
  };

  const handleTabClick = (tab: KategoriType) => {
    if (tab === aktif) return;
    router.push(`/kategori/${tab.toLowerCase()}`);
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.hero} ref={heroRef} onMouseMove={handleMouseMove}>
        <img src="/images/bgHomeRumah.jpeg" alt="Hero" className={styles.heroBg} />
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
            Rumah                                               {/* ← BEDA 3: judul */}
          </h1>
          <p style={{ color: '#888', fontSize: 14, marginTop: 6 }}>
            Menampilkan {filtered.length} properti
          </p>
        </div>
        <PropertySection title="Rekomendasi" data={filtered} />
        <PropertySection title="Best Seller" data={filtered} />
      </div>
      <Footer />
    </div>
  );
}