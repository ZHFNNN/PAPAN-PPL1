'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './HomePage.module.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { properties, type Properti } from '../lib/properties';

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

/* ── Property Card ── */
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

/* ── Property Section ── */
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

/* ── Discount Card ── */
function DiscountCard({ prop }: { prop: Properti & { discount: number; originalPrice: string } }) {
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
      className={styles.discountCard}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.discountBadge}>-{prop.discount}%</div>

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
        <div className={styles.discountPriceRow}>
          <p className={styles.discountOriginalPrice}>{prop.originalPrice}</p>
          <p className={styles.discountNewPrice}>{prop.price}</p>
        </div>
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

/* ── Discount Section ── */
function DiscountSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);
  const tickerItems = Array.from({ length: 5 });

  const discountProperties = properties.map((p, i) => ({
    ...p,
    discount: [15, 20, 10, 25, 30, 18][i % 6],
    originalPrice: p.price,
  }));

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const wrap = canvasEl.parentElement!;
    const ctx = canvasEl.getContext('2d')!;
    let raf: number;
    const resize = () => { canvasEl.width = wrap.offsetWidth; canvasEl.height = wrap.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    type Particle = { x:number;y:number;col:string;size:number;speedX:number;speedY:number;life:number;maxLife:number;type:'star'|'circle' };
    const particles: Particle[] = [];
    const COLORS = ['#FFD700','#FFB300','#FFF176','#FF6B6B','#B39DFF','#FFFFFF'];

    function spawn() {
      particles.push({
        x: Math.random() * canvasEl!.width,
        y: Math.random() * canvasEl!.height,
        col: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 1.2,
        speedY: -(Math.random() * 1.4 + 0.3),
        life: Math.random() * 90 + 60,
        maxLife: 0,
        type: Math.random() < 0.4 ? 'star' : 'circle',
      });
      particles[particles.length - 1].maxLife = particles[particles.length - 1].life;
    }

    function drawStar(cx:number,cy:number,r:number,col:string,alpha:number) {
      ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = col;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const inner = r * 0.4;
        if (i === 0) ctx.moveTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
        else ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
        const innerAngle = angle + (2 * Math.PI / 5) / 2;
        ctx.lineTo(cx + inner * Math.cos(innerAngle), cy + inner * Math.sin(innerAngle));
      }
      ctx.closePath(); ctx.fill(); ctx.restore();
    }

    function tick() {
      ctx.clearRect(0, 0, canvasEl!.width, canvasEl!.height);
      if (Math.random() < 0.35) spawn();
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.speedX; p.y += p.speedY; p.speedY += 0.018; p.life--;
        const alpha = (p.life / p.maxLife) * 0.85;
        if (p.type === 'star') {
          drawStar(p.x, p.y, p.size * 1.4, p.col, alpha);
        } else {
          ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = p.col;
          ctx.shadowColor = p.col; ctx.shadowBlur = p.size * 3;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
        if (p.life <= 0) particles.splice(i, 1);
      }
      raf = requestAnimationFrame(tick);
    }
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  const icons = ['😱', '🔥'];

  return (
    <section
      ref={sectionRef}
      className={`${styles.discountSection} ${visible ? styles.discountSectionVisible : ''}`}
    >
      <div className={styles.discountBg}>
        <canvas ref={canvasRef} className={styles.discountSparkCanvas} />
        <div className={styles.discountGlowLeft} />
        <div className={styles.discountGlowRight} />
        <div className={styles.discountGlowCenter} />

        <div className={styles.discountHeader}>
          <h2 className={styles.discountTicker} aria-label="Potongan Harga">
            <span className={styles.discountTickerGroup}>
              {tickerItems.map((_, i) => (
                <span key={`a-${i}`} className={styles.discountTickerItem}>
                  <span className={styles.discountPill}>
                    <span className={styles.discountFlashIcon}>{icons[i % 2]}</span>
                    <span className={styles.discountTitle}>Potongan Harga</span>
                  </span>
                </span>
              ))}
            </span>
            <span className={styles.discountTickerGroup} aria-hidden="true">
              {tickerItems.map((_, i) => (
                <span key={`b-${i}`} className={styles.discountTickerItem}>
                  <span className={styles.discountPill}>
                    <span className={styles.discountFlashIcon}>{icons[(i + 1) % 2]}</span>
                    <span className={styles.discountTitle}>Potongan Harga</span>
                  </span>
                </span>
              ))}
            </span>
          </h2>
        </div>

        <div className={styles.discountTrackWrap}>
          <div className={styles.discountTrack}>
            {discountProperties.map((p) => (
              <DiscountCard key={p.id} prop={p} />
            ))}
          </div>
        </div>

        <div className={`${styles.discountHeader} ${styles.discountHeaderBottom}`}>
          <h2 className={styles.discountTicker} aria-hidden="true">
            <span className={styles.discountTickerGroup}>
              {tickerItems.map((_, i) => (
                <span key={`c-${i}`} className={styles.discountTickerItem}>
                  <span className={styles.discountPill}>
                    <span className={styles.discountFlashIcon}>{icons[i % 2]}</span>
                    <span className={styles.discountTitle}>Potongan Harga</span>
                  </span>
                </span>
              ))}
            </span>
            <span className={styles.discountTickerGroup} aria-hidden="true">
              {tickerItems.map((_, i) => (
                <span key={`d-${i}`} className={styles.discountTickerItem}>
                  <span className={styles.discountPill}>
                    <span className={styles.discountFlashIcon}>{icons[(i + 1) % 2]}</span>
                    <span className={styles.discountTitle}>Potongan Harga</span>
                  </span>
                </span>
              ))}
            </span>
          </h2>
        </div>
      </div>
    </section>
  );
}

/* ── HomePage ── */
export default function HomePage() {
  const router = useRouter();

  const [charaX, setCharaX] = useState(50);
  const heroRef = useRef<HTMLDivElement>(null);
  const [hoveredSpot, setHoveredSpot] = useState<string | null>(null);

  const tabs: KategoriType[] = ['Apartemen', 'Rumah', 'Kosan'];

  useEffect(() => {
    router.prefetch('/kategori/apartemen');
    router.prefetch('/kategori/rumah');
    router.prefetch('/kategori/kosan');
  }, [router]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedSpot = sessionStorage.getItem(HERO_HOVER_STORAGE_KEY);
    if (savedSpot && HOTSPOTS.some((spot) => spot.id === savedSpot)) {
      setHoveredSpot(savedSpot);
    }
    sessionStorage.removeItem(HERO_HOVER_STORAGE_KEY);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    setCharaX(Math.min(Math.max(xPercent, 5), 88));
  };

  const navigateWithFade = (href: string) => {
    router.push(href);
  };

  const handleHotspotClick = (spot: (typeof HOTSPOTS)[number]) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(HERO_HOVER_STORAGE_KEY, spot.id);
    }
    router.push(spot.href);
  };

  return (
    <div className={styles.page}>
      <Navbar />

      {/* ── Hero ── */}
      <div
        className={`${styles.hero} ${styles.heroFadeIn}`}
        ref={heroRef}
        onMouseMove={handleMouseMove}
      >
        {/* Background default */}
        <img
          src="/images/bgHome.jpeg"
          alt="Hero"
          className={styles.heroBg}
        />

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

        <img
          src="/images/chara.png"
          alt="chara"
          className={styles.charaImg}
          style={{ left: `${charaX}%` }}
        />

        {/* Tab bar */}
        <div className={styles.tabsWrapper}>
          {tabs.map((tab) => (
            <button
              key={tab}
              className={styles.tab}
              onClick={() => navigateWithFade(`/kategori/${tab.toLowerCase()}`)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Konten ── */}
      <div className={styles.content}>
        <PropertySection title="Rekomendasi" />
        <DiscountSection />
        <PropertySection title="Best Seller" />
      </div>
      <Footer />
    </div>
  );
}