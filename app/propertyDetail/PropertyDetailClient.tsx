'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';
import { properties, type Properti } from '@/lib/properties';

type PropertyDetail = {
  id: string;
  title: string;
  address?: string | null;
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

function formatPrice(price: string) {
  const numeric = Number(price);
  if (Number.isNaN(numeric)) return price;
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(numeric);
}

export default function PropertyDetailClient({ propertyId }: PropertyDetailClientProps) {
  const router = useRouter();

  const [data, setData] = useState<PropertyDetail | null>(null);
  const [localData, setLocalData] = useState<Properti | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        {isLoading ? (
          <div className={styles.stateBox}>Memuat detail properti...</div>
        ) : error ? (
          <div className={styles.stateBox}>
            <p className={styles.errorText}>{error}</p>
            <button className={styles.backBtn} onClick={() => router.push('/')}>
              Kembali ke Home
            </button>
          </div>
        ) : localData ? (
          <div className={styles.detailGrid}>
            <section className={styles.heroCard}>
              <div
                className={styles.imagePlaceholder}
                style={{
                  backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.78), rgba(51,65,85,0.62)), url(${localData.images[0]})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <span>{localData.kategori}</span>
                <h1>{localData.title}</h1>
              </div>
            </section>

            <section className={styles.infoCard}>
              <div className={styles.topRow}>
                <div>
                  <p className={styles.label}>Harga</p>
                  <h2 className={styles.price}>{localData.price}</h2>
                </div>
                <button className={styles.backBtn} onClick={() => router.push('/')}>
                  Kembali
                </button>
              </div>

              <div className={styles.sectionBlock}>
                <p className={styles.label}>Lokasi</p>
                <p className={styles.description}>{localData.lokasi}</p>
              </div>

              <div className={styles.sectionBlock}>
                <p className={styles.label}>Deskripsi</p>
                <p className={styles.description}>{localData.biayaHidup}</p>
              </div>

              <div className={styles.sectionBlock}>
                <p className={styles.label}>Fasilitas</p>
                <div className={styles.facilityList}>
                  {localData.fasilitas.length > 0 ? (
                    localData.fasilitas.map((facility) => (
                      <span key={facility} className={styles.facilityTag}>
                        {facility}
                      </span>
                    ))
                  ) : (
                    <span className={styles.emptyFacility}>Belum ada fasilitas.</span>
                  )}
                </div>
              </div>
            </section>
          </div>
        ) : data ? (
          <div className={styles.detailGrid}>
            <section className={styles.heroCard}>
              <div
                className={styles.imagePlaceholder}
                style={
                  Array.isArray(data.imageUrls) && data.imageUrls.length > 0
                    ? {
                        backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.78), rgba(51,65,85,0.62)), url(${data.imageUrls[0]})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }
                    : undefined
                }
              >
                <span>{data.listingType}</span>
                <h1>{data.title}</h1>
              </div>
            </section>

            <section className={styles.infoCard}>
              <div className={styles.topRow}>
                <div>
                  <p className={styles.label}>Harga</p>
                  <h2 className={styles.price}>{formatPrice(data.price)}</h2>
                </div>
                <button className={styles.backBtn} onClick={() => router.push('/')}>
                  Kembali
                </button>
              </div>

              <div className={styles.sectionBlock}>
                <p className={styles.label}>Deskripsi</p>
                <p className={styles.description}>{data.description ?? 'Tidak ada deskripsi.'}</p>
              </div>

              <div className={styles.sectionBlock}>
                <p className={styles.label}>Lokasi</p>
                <p className={styles.description}>{data.address ?? 'Lokasi belum tersedia.'}</p>
              </div>

              <div className={styles.sectionBlock}>
                <p className={styles.label}>Fasilitas</p>
                <div className={styles.facilityList}>
                  {data.facilities.length > 0 ? (
                    data.facilities.map((facility) => (
                      <span key={facility.code} className={styles.facilityTag}>
                        {facility.name}
                      </span>
                    ))
                  ) : (
                    <span className={styles.emptyFacility}>Belum ada fasilitas.</span>
                  )}
                </div>
              </div>

              <div className={styles.sectionBlock}>
                <p className={styles.label}>Pemilik</p>
                <p className={styles.description}>
                  {data.owner?.name ?? data.owner?.username ?? 'Tidak diketahui'}
                </p>
              </div>
            </section>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
