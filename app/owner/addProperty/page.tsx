'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

type ListingType = 'JUAL' | 'SEWA' | 'KOSAN' | '';

type FormData = {
  title: string;
  address: string;
  price: string;
  description: string;
  listingType: ListingType;
  facilities: string[];
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const LISTING_TYPE_OPTIONS: { value: ListingType; label: string }[] = [
  { value: 'JUAL', label: 'Dijual' },
  { value: 'SEWA', label: 'Disewa' },
  { value: 'KOSAN', label: 'Kosan' },
];

export default function AddPropertyPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    title: '',
    address: '',
    price: '',
    description: '',
    listingType: '',
    facilities: [],
  });
  const [facilityInput, setFacilityInput] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleAddFacility = () => {
    const trimmed = facilityInput.trim();
    if (!trimmed) return;
    if (form.facilities.includes(trimmed)) {
      alert('Fasilitas sudah ditambahkan.');
      return;
    }
    setForm((prev) => ({ ...prev, facilities: [...prev.facilities, trimmed] }));
    setFacilityInput('');
  };

  const handleRemoveFacility = (index: number) => {
    setForm((prev) => ({
      ...prev,
      facilities: prev.facilities.filter((_, i) => i !== index),
    }));
  };

  const appendPhotoFiles = (files: File[]) => {
    if (!files.length) return;
    const validFiles = files.filter((f) => f.type.startsWith('image/'));
    if (!validFiles.length) return;
    const newPreviews = validFiles.map((f) => URL.createObjectURL(f));
    setPhotos((prev) => [...prev, ...validFiles]);
    setPhotoPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    appendPhotoFiles(files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files ?? []);
    appendPhotoFiles(files);
  };

  const handleRemovePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviews[index]);
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.title.trim()) newErrors.title = 'Nama properti wajib diisi.';
    if (!form.address.trim()) newErrors.address = 'Alamat wajib diisi.';
    if (!form.price.trim()) newErrors.price = 'Harga wajib diisi.';
    else if (isNaN(Number(form.price.replace(/[^0-9]/g, '')))) newErrors.price = 'Harga harus berupa angka.';
    if (!form.description.trim()) newErrors.description = 'Deskripsi wajib diisi.';
    if (!form.listingType) newErrors.listingType = 'Tipe listing wajib dipilih.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const priceNum = Number(form.price.replace(/[^0-9]/g, ''));

      // NOTE: Buat API route POST /api/owner/properties
      const res = await fetch('/api/owner/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          price: priceNum,
          listingType: form.listingType,
          address: form.address,
          facilities: form.facilities,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? 'Gagal menambahkan properti.');
      }

      router.push('/owner/dashboard');
    } catch (err: any) {
      setSubmitError(err.message ?? 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (val: string) => {
    const num = val.replace(/[^0-9]/g, '');
    if (!num) return '';
    return Number(num).toLocaleString('id-ID');
  };

  return (
    <div className={styles.contentArea}>
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Tambah Properti</h1>
        </div>

        <div className={styles.formCard}>
          {/* ── Kiri: Form Fields ── */}
          <div className={styles.formLeft}>
            {/* Nama Properti */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Nama Properti</label>
              <input
                className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
                placeholder="Masukkan nama properti"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
              />
              {errors.title && <p className={styles.errorText}>{errors.title}</p>}
            </div>

            {/* Alamat */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Alamat Lengkap</label>
              <input
                className={`${styles.input} ${errors.address ? styles.inputError : ''}`}
                placeholder="Masukkan alamat lengkap"
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
              {errors.address && <p className={styles.errorText}>{errors.address}</p>}
            </div>

            {/* Tipe Listing */}
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

            {/* Harga */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Harga</label>
              <div className={styles.priceWrapper}>
                <span className={styles.pricePrefix}>Rp</span>
                <input
                  className={`${styles.input} ${styles.priceInput} ${errors.price ? styles.inputError : ''}`}
                  placeholder="0"
                  value={formatPrice(form.price)}
                  onChange={(e) => handleChange('price', e.target.value.replace(/[^0-9]/g, ''))}
                />
              </div>
              {errors.price && <p className={styles.errorText}>{errors.price}</p>}
            </div>

            {/* Deskripsi */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Deskripsi</label>
              <textarea
                className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
                placeholder="Masukkan deskripsi properti"
                rows={4}
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
              {errors.description && <p className={styles.errorText}>{errors.description}</p>}
            </div>

            {/* Fasilitas */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Fasilitas</label>
              <div className={styles.facilityInputRow}>
                <input
                  className={styles.input}
                  placeholder="Masukkan fasilitas dari properti"
                  value={facilityInput}
                  onChange={(e) => setFacilityInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFacility(); } }}
                />
                <button
                  type="button"
                  className={styles.addFacilityBtn}
                  onClick={handleAddFacility}
                >
                  + Tambah
                </button>
              </div>
              {form.facilities.length > 0 && (
                <div className={styles.facilityTags}>
                  {form.facilities.map((f, i) => (
                    <span key={i} className={styles.facilityTag}>
                      {f}
                      <button
                        type="button"
                        className={styles.removeFacilityBtn}
                        onClick={() => handleRemoveFacility(i)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Kanan: Upload Foto ── */}
          <div className={styles.formRight}>
            <label className={styles.label}>Upload Foto-foto Properti</label>
            <label
              className={`${styles.uploadArea} ${isDragOver ? styles.uploadAreaDragOver : ''}`}
              htmlFor="photo-upload"
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {photoPreviews.length === 0 ? (
                <div className={styles.uploadPlaceholder}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="m21 15-5-5L5 21" />
                  </svg>
                  <p className={styles.uploadText}>Upload Foto Properti</p>
                  <p className={styles.uploadHint}>Klik atau drag & drop</p>
                </div>
              ) : (
                <div className={styles.photoGrid}>
                  {photoPreviews.map((src, i) => (
                    <div key={i} className={styles.photoThumb}>
                      <img src={src} alt={`foto-${i}`} className={styles.thumbImg} />
                      <button
                        type="button"
                        className={styles.removePhotoBtn}
                        onClick={(e) => { e.preventDefault(); handleRemovePhoto(i); }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <div className={styles.addMorePhoto}>
                    <span>+ Tambah</span>
                  </div>
                </div>
              )}
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              multiple
              className={styles.hiddenInput}
              onChange={handlePhotoChange}
            />
            <p className={styles.uploadCount}>
              {photos.length > 0 ? `${photos.length} foto dipilih` : 'Belum ada foto'}
            </p>
          </div>
        </div>

        {/* Error Banner */}
        {submitError && (
          <div className={styles.submitErrorBanner}>
            ⚠️ {submitError}
          </div>
        )}

        {/* Submit */}
        <button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className={styles.submittingState}>
              <span className={styles.btnSpinner} />
              Menyimpan...
            </span>
          ) : (
            'Tambah Properti'
          )}
        </button>
    </div>
  );
}