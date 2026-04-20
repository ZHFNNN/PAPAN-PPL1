'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { properties } from '@/lib/properties';
import styles from './page.module.css';

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
            <div className={styles.emptyState}>Tidak ada properti yang cocok.</div>
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
