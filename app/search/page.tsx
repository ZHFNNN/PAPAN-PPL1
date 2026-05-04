'use client';

import { Suspense, useMemo, useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { properties } from '@/lib/properties';
import styles from './page.module.css';

// ─── Types ───────────────────────────────────────────────────────────────────
type KategoriType = 'Rumah' | 'Apartemen' | 'Kosan';

type SortPrice = 'asc' | 'desc' | null;
type SortDistance = 'asc' | 'desc' | null;
type FilterKategori = KategoriType | null;

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORY_KEYWORDS: Record<KategoriType, string[]> = {
  Rumah: ['rumah', 'home', 'house'],
  Apartemen: ['apartemen', 'apartment', 'apt'],
  Kosan: ['kos', 'kost', 'kosan', 'boarding'],
};

// Target lokasi referensi (bisa diganti sesuai kebutuhan)
const TARGET_LOCATION = 'Bandung';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/gi, ' ');
}

function getTokens(value: string) {
  return normalizeText(value).split(/\s+/).filter(Boolean);
}

function detectCategory(query: string): KategoriType | null {
  const tokens = getTokens(query);
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS) as Array<[KategoriType, string[]]>) {
    if (tokens.some((token) => keywords.includes(token))) return category;
  }
  return null;
}

/** Extract numeric price from a formatted string like "Rp 2.500.000/bulan" */
function parsePrice(priceStr: string): number {
  const digits = priceStr.replace(/[^0-9]/g, '');
  return parseInt(digits, 10) || 0;
}

/**
 * Very naive "distance" score based on how many words in the property's lokasi
 * match the target location string. Higher = closer.
 * Replace with real geo-distance if you have lat/lng data.
 */
function distanceScore(lokasi: string, target: string): number {
  const lokasiTokens = getTokens(lokasi);
  const targetTokens = getTokens(target);
  return lokasiTokens.filter((t) => targetTokens.includes(t)).length;
}

// ─── Dropdown component ───────────────────────────────────────────────────────
interface DropdownProps {
  label: string;
  value: string | null;
  options: { label: string; value: string }[];
  onSelect: (value: string | null) => void;
  active: boolean;
}

function FilterDropdown({ label, value, options, onSelect, active }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? null;

  return (
    <div className={styles.filterChipWrapper} ref={ref}>
      <button
        className={`${styles.filterChip} ${active ? styles.filterChipActive : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        {active && (
          <span
            className={styles.filterChipClear}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(null);
              setOpen(false);
            }}
          >
            ✕
          </span>
        )}
        <span className={styles.filterChipLabel}>{label}</span>
        {active && selectedLabel && (
          <>
            <span className={styles.filterChipDivider}>|</span>
            <span className={styles.filterChipValue}>{selectedLabel}</span>
          </>
        )}
        <svg
          className={`${styles.filterChipArrow} ${open ? styles.filterChipArrowOpen : ''}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className={styles.filterDropdown}>
          {options.map((opt) => (
            <button
              key={opt.value}
              className={`${styles.filterDropdownItem} ${value === opt.value ? styles.filterDropdownItemSelected : ''}`}
              onClick={() => {
                onSelect(value === opt.value ? null : opt.value);
                setOpen(false);
              }}
              type="button"
            >
              {opt.label}
              {value === opt.value && <span className={styles.checkmark}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main content ─────────────────────────────────────────────────────────────
function SearchPageContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q')?.trim() ?? '';

  const [sortPrice, setSortPrice] = useState<SortPrice>(null);
  const [sortDistance, setSortDistance] = useState<SortDistance>(null);
  const [filterKategori, setFilterKategori] = useState<FilterKategori>(null);

  const priceOptions = [
    { label: 'Termurah', value: 'asc' },
    { label: 'Termahal', value: 'desc' },
  ];

  const distanceOptions = [
    { label: 'Terdekat', value: 'asc' },
    { label: 'Terjauh', value: 'desc' },
  ];

  const kategoriOptions: { label: string; value: KategoriType }[] = [
    { label: 'Rumah', value: 'Rumah' },
    { label: 'Apartemen', value: 'Apartemen' },
    { label: 'Kosan', value: 'Kosan' },
  ];

  // Check if any filter is active
  const hasActiveFilter = sortPrice !== null || sortDistance !== null || filterKategori !== null;

  function clearAllFilters() {
    setSortPrice(null);
    setSortDistance(null);
    setFilterKategori(null);
  }

  const filtered = useMemo(() => {
    let result = [...properties];

    // ── Text search: nama properti dan lokasi ──
    if (q) {
      const query = q.toLowerCase();
      result = result.filter((p) => {
        const text = `${p.title} ${p.lokasi}`.toLowerCase();
        return text.includes(query);
      });
    }

    // ── Kategori filter ──
    if (filterKategori) {
      result = result.filter((p) => p.kategori === filterKategori);
    }

    // ── Sorting: price takes priority over distance ──
    if (sortPrice) {
      result.sort((a, b) => {
        const diff = parsePrice(a.price) - parsePrice(b.price);
        return sortPrice === 'asc' ? diff : -diff;
      });
    } else if (sortDistance) {
      result.sort((a, b) => {
        const scoreA = distanceScore(a.lokasi, TARGET_LOCATION);
        const scoreB = distanceScore(b.lokasi, TARGET_LOCATION);
        // higher score = closer
        return sortDistance === 'asc' ? scoreB - scoreA : scoreA - scoreB;
      });
    }

    return result;
  }, [q, sortPrice, sortDistance, filterKategori]);

  const recommendations = useMemo(() => {
    if (!q || filtered.length > 0) return [];

    const detectedCategory = detectCategory(q);
    const categoryTokens = new Set(
      Object.values(CATEGORY_KEYWORDS).flat().map((t) => t.toLowerCase()),
    );
    const queryTokens = getTokens(q).filter((t) => !categoryTokens.has(t));

    const candidates = detectedCategory
      ? properties.filter((p) => p.kategori === detectedCategory)
      : properties;

    return [...candidates]
      .map((property) => {
        const searchableText = normalizeText(
          `${property.title} ${property.lokasi} ${property.kategori} ${property.fasilitas.join(' ')}`,
        );
        const score = queryTokens.reduce(
          (acc, token) => (searchableText.includes(token) ? acc + 1 : acc),
          0,
        );
        return { property, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((item) => item.property);
  }, [q, filtered.length]);

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.contentArea}>
        <div className={styles.container}>
          <h1 className={styles.title}>Hasil Pencarian</h1>
          <p className={styles.subtitle}>
            {q ? `Menampilkan hasil untuk "${q}"` : 'Masukkan kata kunci di search bar.'}
          </p>

          {/* ── Filter bar ── */}
          <div className={styles.filterBar}>
            <FilterDropdown
              label="Harga"
              value={sortPrice}
              options={priceOptions}
              onSelect={(v) => setSortPrice(v as SortPrice)}
              active={sortPrice !== null}
            />
            <FilterDropdown
              label="Jarak"
              value={sortDistance}
              options={distanceOptions}
              onSelect={(v) => setSortDistance(v as SortDistance)}
              active={sortDistance !== null}
            />
            <FilterDropdown
              label="Jenis Properti"
              value={filterKategori}
              options={kategoriOptions}
              onSelect={(v) => setFilterKategori(v as FilterKategori)}
              active={filterKategori !== null}
            />
            {hasActiveFilter && (
              <button className={styles.clearAllBtn} onClick={clearAllFilters} type="button">
                Hapus semua
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <>
              <div className={styles.emptyState}>
                Properti yang kamu cari tidak ada.
                {q ? ` Coba kata kunci lain untuk "${q}".` : ''}
              </div>

              {recommendations.length > 0 && (
                <section className={styles.recommendationSection}>
                  <h2 className={styles.recommendationTitle}>Rekomendasi properti mirip</h2>
                  <div className={styles.grid}>
                    {recommendations.map((item) => (
                      <article key={`rec-${item.id}`} className={styles.card}>
                        <img src={item.images[0]} alt={item.title} className={styles.cardImage} />
                        <div className={styles.cardBody}>
                          <p className={styles.cardTitle}>{item.title}</p>
                          <p className={styles.cardLocation}>{item.lokasi}</p>
                          <p className={styles.cardPrice}>{item.price}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <div className={styles.grid}>
              {filtered.map((item) => (
                <article key={item.id} className={styles.card}>
                  <img src={item.images[0]} alt={item.title} className={styles.cardImage} />
                  <div className={styles.cardBody}>
                    <p className={styles.cardTitle}>{item.title}</p>
                    <p className={styles.cardLocation}>{item.lokasi}</p>
                    <p className={styles.cardPrice}>{item.price}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<main className={styles.contentArea}>Memuat pencarian...</main>}>
      <SearchPageContent />
    </Suspense>
  );
}