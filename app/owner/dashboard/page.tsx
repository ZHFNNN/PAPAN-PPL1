'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { formatPrice } from '../../../lib/format-price';

type Property = {
  id: string;
  title: string;
  description: string | null;
  price: string;
  listingType: string;
  address?: string;
  imageUrls?: string[];
  views?: number;
  status?: string;
  createdAt: string;
};

type DashboardStats = {
  totalProperties: number;
  activeProperties: number;
  rentedRooms: number;
  soldProperties: number;
  totalRevenue: number;
};

type DashboardData = {
  stats: DashboardStats;
  properties: Property[];
};

const LISTING_TYPE_LABEL: Record<string, string> = {
  JUAL: 'Dijual',
  SEWA: 'Disewa',
  KOSAN: 'Kosan',
};

const STATUS_COLOR: Record<string, string> = {
  Aktif: styles.statusAktif,
  Nonaktif: styles.statusNonaktif,
  Terjual: styles.statusTerjual,
};

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className={styles.statCard}>
      <p className={styles.statTitle}>{title}</p>
      <p className={styles.statValue}>{value}</p>
    </div>
  );
}

export default function OwnerDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      // NOTE: Buat API route GET /api/owner/dashboard
      const res = await fetch('/api/owner/dashboard');
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Gagal memuat dashboard.');
      }
      const json: DashboardData = await res.json();
      setData(json);
    } catch (err) {
      setError('Tidak dapat memuat data dashboard. Coba lagi nanti.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [router]);

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus properti ini?')) return;
    setDeletingId(id);
    try {
      // NOTE: Buat API route DELETE /api/owner/properties/[id]
      const res = await fetch(`/api/owner/properties/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus properti.');
      // Refresh data
      await fetchDashboard();
    } catch (err) {
      alert('Gagal menghapus properti. Coba lagi.');
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };


  return (
    <div className={styles.contentArea}>
        {/* ── Header ── */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Dashboard</h1>
            <p className={styles.pageSubtitle}>Hai! Yuk cek properti-properti kamu!</p>
          </div>
          <button
            className={styles.addPropertyBtn}
            onClick={() => router.push('/owner/addProperty')}
          >
            + Tambah Properti
          </button>
        </div>

        {isLoading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Memuat dashboard...</p>
          </div>
        ) : error ? (
          <div className={styles.errorState}>
            <p>{error}</p>
            <button onClick={() => { setIsLoading(true); setError(null); fetchDashboard(); }} className={styles.retryBtn}>
              Coba Lagi
            </button>
          </div>
        ) : data ? (
          <>
            {/* ── Stats ── */}
            <div className={styles.statsGrid}>
              <StatCard title="Total Properti" value={data.stats.totalProperties} />
              <StatCard title="Properti Aktif" value={data.stats.activeProperties} />
              <StatCard title="Kamar Kosan Tersewa" value={data.stats.rentedRooms} />
              <StatCard title="Properti Terjual" value={data.stats.soldProperties} />
              <StatCard title="Total Pendapatan" value={formatPrice(data.stats.totalRevenue)} />
            </div>

            {/* ── Properties List ── */}
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Properti Saya</h2>
              <span className={styles.propertyCount}>{data.properties.length} Properti</span>
            </div>

            {data.properties.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🏠</div>
                <p className={styles.emptyTitle}>Belum Ada Properti</p>
                <p className={styles.emptyDesc}>Mulai tambahkan properti pertamamu sekarang.</p>
                <button
                  className={styles.emptyAddBtn}
                  onClick={() => router.push('/owner/addProperty')}
                >
                  + Tambah Properti
                </button>
              </div>
            ) : (
              <div className={styles.propertyList}>
                {data.properties.map((property) => (
                  <div key={property.id} className={styles.propertyCard}>
                    {/* Thumbnail placeholder */}
                    <div className={styles.propertyThumb}>
                      {Array.isArray(property.imageUrls) && property.imageUrls.length > 0 ? (
                        <img
                          src={property.imageUrls[0]}
                          alt={property.title}
                          className={styles.thumbImg}
                        />
                      ) : (
                        <div className={styles.thumbPlaceholder}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            <polyline points="9 22 9 12 15 12 15 22"/>
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className={styles.propertyInfo}>
                      <div className={styles.propertyTopRow}>
                        <h3 className={styles.propertyTitle}>{property.title}</h3>
                        <div className={styles.propertyBadges}>
                          <span className={styles.listingBadge}>
                            {LISTING_TYPE_LABEL[property.listingType] ?? property.listingType}
                          </span>
                          <span className={`${styles.statusBadge} ${STATUS_COLOR[property.status ?? 'Aktif'] ?? styles.statusAktif}`}>
                            {property.status ?? 'Aktif'}
                          </span>
                        </div>
                      </div>
                      <p className={styles.propertyPrice}>{formatPrice(property.price)}</p>
                      {property.address && (
                        <p className={styles.propertyAddress}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                          </svg>
                          {property.address}
                        </p>
                      )}
                      <p className={styles.propertyViews}>
                        {property.views ?? 0} Views
                      </p>
                    </div>

                    {/* Actions */}
                    <div className={styles.propertyActions}>
                      <button className={styles.boostBtn}>Boost</button>
                      <button
                        className={styles.editBtn}
                        onClick={() => router.push(`/owner/properties/${property.id}/edit`)}
                      >
                        Edit
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(property.id)}
                        disabled={deletingId === property.id}
                      >
                        {deletingId === property.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : null}
    </div>
  );
}