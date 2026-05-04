'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { formatPrice } from '@/lib/format-price';
import { type ApiProperty, type PropertyCardData, mapApiPropertyToCard } from '@/types/property';
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

const CATEGORY_PARAM_MAP: Record<'Rumah' | 'Apartemen' | 'Kosan', string> = {
  Rumah: 'RUMAH',
  Apartemen: 'APARTEMEN',
  Kosan: 'KOSAN',
};

function buildPropertiesUrl(params: Record<string, string | number | undefined | null>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  return query ? `/api/properties?${query}` : '/api/properties';
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q')?.trim() ?? '';

  const [items, setItems] = useState<PropertyCardData[]>([]);
  const [recommendations, setRecommendations] = useState<PropertyCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      setRecommendations([]);

      try {
        if (!q) {
          const res = await fetch(buildPropertiesUrl({ take: 24 }));
          const json = await res.json().catch(() => ({}));
          const data = Array.isArray(json.data) ? (json.data as ApiProperty[]) : [];
          if (!cancelled) {
            setItems(data.map(mapApiPropertyToCard));
          }
          return;
        }

        const res = await fetch(buildPropertiesUrl({ q, take: 60 }));
        const json = await res.json().catch(() => ({}));
        const data = Array.isArray(json.data) ? (json.data as ApiProperty[]) : [];
        const mapped = data.map(mapApiPropertyToCard);

        if (!cancelled) {
          setItems(mapped);
        }

        if (mapped.length === 0) {
          const detectedCategory = detectCategory(q);
          const categoryParam = detectedCategory ? CATEGORY_PARAM_MAP[detectedCategory] : null;
          const recRes = await fetch(buildPropertiesUrl({ category: categoryParam, take: 6 }));
          const recJson = await recRes.json().catch(() => ({}));
          const recData = Array.isArray(recJson.data) ? (recJson.data as ApiProperty[]) : [];
          if (!cancelled) {
            setRecommendations(recData.map(mapApiPropertyToCard));
          }
        }
      } catch {
        if (!cancelled) {
          setError('Gagal memuat pencarian.');
          setItems([]);
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
  }, [q]);

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.contentArea}>
        <div className={styles.container}>
          <h1 className={styles.title}>Hasil Pencarian</h1>
          <p className={styles.subtitle}>
            {q ? `Menampilkan hasil untuk "${q}"` : 'Masukkan kata kunci di search bar.'}
          </p>

          {isLoading ? (
            <div className={styles.emptyState}>Memuat pencarian...</div>
          ) : error ? (
            <div className={styles.emptyState}>{error}</div>
          ) : items.length === 0 ? (
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
                          <p className={styles.cardPrice}>{formatPrice(item.price)}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <div className={styles.grid}>
              {items.map((item) => (
                <article key={item.id} className={styles.card}>
                  <img src={item.images[0]} alt={item.title} className={styles.cardImage} />
                  <div className={styles.cardBody}>
                    <p className={styles.cardTitle}>{item.title}</p>
                    <p className={styles.cardLocation}>{item.lokasi}</p>
                    <p className={styles.cardPrice}>{formatPrice(item.price)}</p>
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