'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from './page.module.css';

type ListingType = 'JUAL' | 'SEWA' | 'KOSAN' | '';

type FormData = {
  title: string;
  price: string;
  description: string;
  listingType: ListingType;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const LISTING_TYPE_OPTIONS: { value: Exclude<ListingType, ''>; label: string }[] = [
  { value: 'JUAL', label: 'Dijual' },
  { value: 'SEWA', label: 'Disewa' },
  { value: 'KOSAN', label: 'Kosan' },
];

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const propertyId = useMemo(() => String(params?.id ?? ''), [params]);

  const [form, setForm] = useState<FormData>({
    title: '',
    price: '',
    description: '',
    listingType: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!propertyId) return;
      setIsLoading(true);
      setLoadError(null);

      try {
        const res = await fetch(`/api/owner/properties/${propertyId}`);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.message ?? 'Gagal memuat properti.');
        }

        if (cancelled) return;
        setForm({
          title: data.title ?? '',
          price: String(data.price ?? ''),
          description: data.description ?? '',
          listingType: (data.listingType as ListingType) ?? '',
        });
      } catch (err: any) {
        if (!cancelled) setLoadError(err.message ?? 'Gagal memuat properti.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const next: FormErrors = {};

    if (!form.title.trim()) next.title = 'Nama properti wajib diisi.';
    if (!form.price.trim()) next.price = 'Harga wajib diisi.';
    else if (Number.isNaN(Number(form.price.replace(/[^0-9]/g, '')))) {
      next.price = 'Harga harus berupa angka.';
    }
    if (!form.description.trim()) next.description = 'Deskripsi wajib diisi.';
    if (!form.listingType) next.listingType = 'Tipe listing wajib dipilih.';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const formatPrice = (val: string) => {
    const num = val.replace(/[^0-9]/g, '');
    if (!num) return '';
    return Number(num).toLocaleString('id-ID');
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`/api/owner/properties/${propertyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          price: Number(form.price.replace(/[^0-9]/g, '')),
          listingType: form.listingType,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message ?? 'Gagal menyimpan perubahan.');
      }

      router.push('/owner/dashboard');
    } catch (err: any) {
      setSubmitError(err.message ?? 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className={styles.stateText}>Memuat data properti...</div>;
  }

  if (loadError) {
    return (
      <div className={styles.stateWrapper}>
        <p className={styles.errorText}>{loadError}</p>
        <button className={styles.secondaryBtn} onClick={() => router.push('/owner/dashboard')}>
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className={styles.contentArea}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Edit Properti</h1>
      </div>

      <div className={styles.formCard}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Nama Properti</label>
          <input
            className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Masukkan nama properti"
          />
          {errors.title && <p className={styles.errorText}>{errors.title}</p>}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Tipe Listing</label>
          <div className={styles.listingTypeGroup}>
            {LISTING_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleChange('listingType', opt.value)}
                className={`${styles.listingTypeBtn} ${form.listingType === opt.value ? styles.listingTypeBtnActive : ''}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {errors.listingType && <p className={styles.errorText}>{errors.listingType}</p>}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Harga</label>
          <div className={styles.priceWrapper}>
            <span className={styles.pricePrefix}>Rp</span>
            <input
              className={`${styles.input} ${styles.priceInput} ${errors.price ? styles.inputError : ''}`}
              value={formatPrice(form.price)}
              onChange={(e) => handleChange('price', e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="0"
            />
          </div>
          {errors.price && <p className={styles.errorText}>{errors.price}</p>}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Deskripsi</label>
          <textarea
            className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
            rows={5}
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Masukkan deskripsi properti"
          />
          {errors.description && <p className={styles.errorText}>{errors.description}</p>}
        </div>

        {submitError && <p className={styles.errorText}>{submitError}</p>}

        <div className={styles.actionRow}>
          <button className={styles.secondaryBtn} onClick={() => router.push('/owner/dashboard')}>
            Batal
          </button>
          <button className={styles.primaryBtn} onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  );
}
