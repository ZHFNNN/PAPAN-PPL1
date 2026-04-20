'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { properties } from '@/lib/properties';
import styles from './page.module.css';

const CATEGORY_KEYWORDS: Record<'Rumah' | 'Apartemen' | 'Kosan', string[]> = {
  Rumah: ['rumah', 'home', 'house'],
  Apartemen: ['apartemen', 'apartment', 'apt'],
  Kosan: ['kos', 'kost', 'kosan', 'boarding'],
};

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/gi, ' ');
}

function getTokens(value: string) {
  return normalizeText(value)
    .split(/\s+/)
    .filter(Boolean);
}

function detectCategory(query: string) {
  const tokens = getTokens(query);

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS) as Array<[
    'Rumah' | 'Apartemen' | 'Kosan',
    string[],
  ]>) {
    if (tokens.some((token) => keywords.includes(token))) {
      return category;
    }
  }

  return null;
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q')?.trim() ?? '';

  const filtered = useMemo(() => {
    if (!q) return properties;
    const query = q.toLowerCase();
    return properties.filter((p) => {
      const text = `${p.title} ${p.lokasi} ${p.kategori} ${p.fasilitas.join(' ')}`.toLowerCase();
      return text.includes(query);
    });
  }, [q]);

  const recommendations = useMemo(() => {
    if (!q || filtered.length > 0) return [];

    const detectedCategory = detectCategory(q);
    const categoryTokens = new Set(
      Object.values(CATEGORY_KEYWORDS)
        .flat()
        .map((token) => token.toLowerCase()),
    );
    const queryTokens = getTokens(q).filter((token) => !categoryTokens.has(token));

    const candidates = detectedCategory
      ? properties.filter((property) => property.kategori === detectedCategory)
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
