'use client';

import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from '@/app/owner/addProperty/page.module.css';
import type { PickedLocation } from '@/components/MapPicker';

const MapPicker = lazy(() => import('@/components/MapPicker'));

type ListingType = 'JUAL' | 'SEWA' | '';
type PropertyCategory = 'RUMAH' | 'APARTEMEN' | 'KOSAN' | '';

type FormData = {
  title: string;
  address: string;
  locationLat: number | null;
  locationLng: number | null;
  locationCity: string;
  locationDistrict: string;
  locationNeighbourhood: string;
  price: string;
  description: string;
  listingType: ListingType;
  category: PropertyCategory;
  facilities: string[];
};

type FormErrors = Partial<Record<keyof FormData, string>>;

type FacilityOption = {
  code: string;
  name: string;
};

type PropertyResponse = {
  message?: string;
  title?: string;
  address?: string | null;
  city?: string | null;
  district?: string | null;
  neighbourhood?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  price?: string | number;
  description?: string | null;
  listingType?: string;
  category?: string;
  imageUrls?: string[];
  facilities?: Array<{ facility?: { code?: string } }>;
};

const LISTING_TYPE_OPTIONS: { value: ListingType; label: string }[] = [
  { value: 'JUAL', label: 'Dijual' },
  { value: 'SEWA', label: 'Disewa' },
];

const CATEGORY_OPTIONS: { value: PropertyCategory; label: string }[] = [
  { value: 'RUMAH', label: 'Rumah' },
  { value: 'APARTEMEN', label: 'Apartemen' },
  { value: 'KOSAN', label: 'Kosan' },
];

function normalizeLoadedCategory(value: unknown): PropertyCategory {
  if (typeof value !== 'string') return '';
  const normalized = value.trim().toUpperCase();
  if (normalized === 'RUMAH' || normalized === 'APARTEMEN' || normalized === 'KOSAN') {
    return normalized;
  }
  return '';
}

function normalizeLoadedListingType(value: unknown): ListingType {
  if (typeof value !== 'string') return '';
  const normalized = value.trim().toUpperCase();
  if (normalized === 'JUAL' || normalized === 'SELL') return 'JUAL';
  if (normalized === 'SEWA' || normalized === 'RENT' || normalized === 'KOSAN') return 'SEWA';
  return '';
}

function inferCategoryFromData(data: PropertyResponse): PropertyCategory {
  const byCategory = normalizeLoadedCategory(data.category);
  if (byCategory) return byCategory;

  const listing = typeof data.listingType === 'string' ? data.listingType.trim().toUpperCase() : '';
  if (listing === 'KOSAN') return 'KOSAN';

  return '';
}

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const propertyId = useMemo(() => String(params?.id ?? ''), [params]);

  const [form, setForm] = useState<FormData>({
    title: '',
    address: '',
    locationLat: null,
    locationLng: null,
    locationCity: '',
    locationDistrict: '',
    locationNeighbourhood: '',
    price: '',
    description: '',
    listingType: '',
    category: '',
    facilities: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [facilityOptions, setFacilityOptions] = useState<FacilityOption[]>([]);
  const [isLoadingFacilities, setIsLoadingFacilities] = useState(true);
  const [facilityLoadError, setFacilityLoadError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [newPhotoPreviews, setNewPhotoPreviews] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const uploadPhotosToCloudinary = async (files: File[]) => {
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/uploads/property', {
        method: 'POST',
        body: formData,
      });

      const uploadJson = await uploadRes.json().catch(() => ({}));
      if (!uploadRes.ok) {
        throw new Error(uploadJson.message ?? 'Gagal upload foto properti.');
      }

      const url = typeof uploadJson?.data?.url === 'string' ? uploadJson.data.url : '';
      if (!url) {
        throw new Error('URL foto dari Cloudinary tidak valid.');
      }

      uploadedUrls.push(url);
    }

    return uploadedUrls;
  };

  useEffect(() => {
    let cancelled = false;

    const loadFacilities = async () => {
      setIsLoadingFacilities(true);
      setFacilityLoadError(null);

      try {
        const res = await fetch('/api/facilities');
        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(json.message ?? 'Gagal memuat daftar fasilitas.');
        }

        const data = Array.isArray(json.data) ? (json.data as FacilityOption[]) : [];
        if (!cancelled) {
          setFacilityOptions(data);
        }
      } catch (err) {
        if (!cancelled) {
          setFacilityLoadError(err instanceof Error ? err.message : 'Gagal memuat daftar fasilitas.');
        }
      } finally {
        if (!cancelled) {
          setIsLoadingFacilities(false);
        }
      }
    };

    loadFacilities();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!propertyId) return;
      setIsLoading(true);
      setLoadError(null);

      try {
        const res = await fetch(`/api/owner/properties/${propertyId}`, { cache: 'no-store' });
        const data = (await res.json().catch(() => ({}))) as PropertyResponse;

        if (!res.ok) {
          throw new Error(data.message ?? 'Gagal memuat properti.');
        }

        const addressFromParts = [data.neighbourhood, data.district, data.city]
          .filter((value) => Boolean(value && value.trim()))
          .join(', ');

        if (cancelled) return;
        setForm({
          title: data.title ?? '',
          address: data.address ?? addressFromParts,
          locationLat: typeof data.latitude === 'number' ? data.latitude : null,
          locationLng: typeof data.longitude === 'number' ? data.longitude : null,
          locationCity: data.city ?? '',
          locationDistrict: data.district ?? '',
          locationNeighbourhood: data.neighbourhood ?? '',
          price: String(data.price ?? ''),
          description: data.description ?? '',
          listingType: normalizeLoadedListingType(data.listingType),
          category: inferCategoryFromData(data),
          facilities: Array.isArray(data.facilities)
            ? data.facilities
                .map((item) => item?.facility?.code)
                .filter((code): code is string => typeof code === 'string' && code.length > 0)
            : [],
        });
        setExistingImageUrls(Array.isArray(data.imageUrls) ? data.imageUrls : []);
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

  const toggleFacility = (code: string) => {
    setForm((prev) => {
      const selected = prev.facilities.includes(code);
      return {
        ...prev,
        facilities: selected ? prev.facilities.filter((item) => item !== code) : [...prev.facilities, code],
      };
    });
  };

  const handleLocationPicked = (loc: PickedLocation) => {
    const parts = [loc.neighbourhood, loc.district, loc.city].filter(Boolean);
    const shortName = parts.join(', ') || loc.displayName;

    setForm((prev) => ({
      ...prev,
      address: shortName,
      locationLat: loc.lat,
      locationLng: loc.lng,
      locationCity: loc.city,
      locationDistrict: loc.district,
      locationNeighbourhood: loc.neighbourhood,
    }));

    setErrors((prev) => ({ ...prev, address: undefined }));
  };

  const appendPhotoFiles = (files: File[]) => {
    if (!files.length) return;
    const validFiles = files.filter((f) => f.type.startsWith('image/'));
    if (!validFiles.length) return;
    const newPreviews = validFiles.map((f) => URL.createObjectURL(f));
    setNewPhotos((prev) => [...prev, ...validFiles]);
    setNewPhotoPreviews((prev) => [...prev, ...newPreviews]);
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

  const removeExistingImage = (index: number) => {
    setExistingImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewPhoto = (index: number) => {
    URL.revokeObjectURL(newPhotoPreviews[index]);
    setNewPhotos((prev) => prev.filter((_, i) => i !== index));
    setNewPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    return () => {
      newPhotoPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newPhotoPreviews]);

  const validate = () => {
    const next: FormErrors = {};

    if (!form.title.trim()) next.title = 'Nama properti wajib diisi.';
    if (!form.address.trim() || form.locationLat == null || form.locationLng == null) {
      next.address = 'Lokasi wajib dipilih lewat peta.';
    }
    if (!form.price.trim()) next.price = 'Harga wajib diisi.';
    else if (Number.isNaN(Number(form.price.replace(/[^0-9]/g, '')))) {
      next.price = 'Harga harus berupa angka.';
    }
    if (!form.description.trim()) next.description = 'Deskripsi wajib diisi.';
    if (!form.listingType) next.listingType = 'Tipe listing wajib dipilih.';
    if (!form.category) next.category = 'Kategori properti wajib dipilih.';
    if (existingImageUrls.length + newPhotos.length === 0) {
      next.facilities = 'Minimal harus ada 1 foto properti.';
    }

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
      const uploadedPhotoUrls = newPhotos.length > 0 ? await uploadPhotosToCloudinary(newPhotos) : [];
      const allImageUrls = [...existingImageUrls, ...uploadedPhotoUrls];

      const res = await fetch(`/api/owner/properties/${propertyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          price: Number(form.price.replace(/[^0-9]/g, '')),
          listingType: form.listingType,
          category: form.category,
          address: form.address,
          location: {
            lat: form.locationLat,
            lng: form.locationLng,
            city: form.locationCity,
            district: form.locationDistrict,
            neighbourhood: form.locationNeighbourhood,
          },
          imageUrls: allImageUrls,
          facilities: form.facilities,
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
    return (
      <div className={styles.contentArea}>
        <p className={styles.facilityHint}>Memuat data properti...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={styles.contentArea}>
        <div className={styles.submitErrorBanner}>⚠️ {loadError}</div>
      </div>
    );
  }

  return (
    <div className={styles.contentArea}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Edit Properti</h1>
      </div>

      <div className={styles.formCard}>
        <div className={styles.formLeft}>
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
            <label className={styles.label}>Lokasi Properti</label>
            <div
              className={`${styles.locationInput} ${errors.address ? styles.inputError : ''}`}
              onClick={() => setShowMap(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setShowMap(true);
                }
              }}
            >
              {form.address ? (
                <>
                  <span className={styles.locationIcon}>📍</span>
                  <span className={styles.locationValue}>{form.address}</span>
                  <button
                    type="button"
                    className={styles.changeLocationBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMap(true);
                    }}
                  >
                    Ganti
                  </button>
                </>
              ) : (
                <>
                  <span className={styles.locationPlaceholder}>Pilih lokasi di peta...</span>
                  <span className={styles.locationArrow}>→</span>
                </>
              )}
            </div>
            {errors.address && <p className={styles.errorText}>{errors.address}</p>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Kategori Properti</label>
            <div className={styles.listingTypeGroup}>
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleChange('category', opt.value)}
                  className={`${styles.listingTypeBtn} ${form.category === opt.value ? styles.listingTypeBtnActive : ''}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {errors.category && <p className={styles.errorText}>{errors.category}</p>}
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
              rows={4}
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Masukkan deskripsi properti"
            />
            {errors.description && <p className={styles.errorText}>{errors.description}</p>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Fasilitas</label>
            {isLoadingFacilities ? (
              <p className={styles.facilityHint}>Memuat daftar fasilitas...</p>
            ) : facilityLoadError ? (
              <p className={styles.errorText}>{facilityLoadError}</p>
            ) : (
              <div className={styles.facilityOptionGrid}>
                {facilityOptions.map((facility) => {
                  const selected = form.facilities.includes(facility.code);
                  return (
                    <button
                      key={facility.code}
                      type="button"
                      onClick={() => toggleFacility(facility.code)}
                      className={`${styles.facilityOptionBtn} ${selected ? styles.facilityOptionBtnActive : ''}`}
                    >
                      {facility.name}
                    </button>
                  );
                })}
              </div>
            )}
            {errors.facilities && <p className={styles.errorText}>{errors.facilities}</p>}
          </div>
        </div>

        <div className={styles.formRight}>
          <label className={styles.label}>Upload Foto-foto Properti</label>
          <label
            className={`${styles.uploadArea} ${isDragOver ? styles.uploadAreaDragOver : ''}`}
            htmlFor="photo-upload-edit"
            onDragOver={handleDragOver}
            onDragEnter={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {existingImageUrls.length + newPhotoPreviews.length === 0 ? (
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
                {existingImageUrls.map((src, i) => (
                  <div key={`existing-${i}`} className={styles.photoThumb}>
                    <img src={src} alt={`existing-${i}`} className={styles.thumbImg} />
                    <button
                      type="button"
                      className={styles.removePhotoBtn}
                      onClick={(e) => {
                        e.preventDefault();
                        removeExistingImage(i);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {newPhotoPreviews.map((src, i) => (
                  <div key={`new-${i}`} className={styles.photoThumb}>
                    <img src={src} alt={`new-${i}`} className={styles.thumbImg} />
                    <button
                      type="button"
                      className={styles.removePhotoBtn}
                      onClick={(e) => {
                        e.preventDefault();
                        removeNewPhoto(i);
                      }}
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
            id="photo-upload-edit"
            type="file"
            accept="image/*"
            multiple
            className={styles.hiddenInput}
            onChange={handlePhotoChange}
          />
          <p className={styles.uploadCount}>
            {existingImageUrls.length + newPhotos.length > 0
              ? `${existingImageUrls.length + newPhotos.length} foto dipilih`
              : 'Belum ada foto'}
          </p>
        </div>
      </div>

      {submitError && <div className={styles.submitErrorBanner}>⚠️ {submitError}</div>}

      <button className={styles.submitBtn} onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? (
          <span className={styles.submittingState}>
            <span className={styles.btnSpinner} />
            Menyimpan...
          </span>
        ) : (
          'Simpan Perubahan'
        )}
      </button>

      {showMap && (
        <Suspense
          fallback={
            <div className={styles.mapLoadingOverlay}>
              <div className={styles.mapLoadingSpinner} />
              <p>Memuat peta...</p>
            </div>
          }
        >
          <MapPicker onLocationPicked={handleLocationPicked} onClose={() => setShowMap(false)} />
        </Suspense>
      )}
    </div>
  );
}
