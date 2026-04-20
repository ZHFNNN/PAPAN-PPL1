'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';

type EditForm = {
  name: string;
  username: string;
  phoneNumber: string;
};

type FormErrors = Partial<EditForm>;

export default function EditProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState<EditForm>({
    name: '',
    username: '',
    phoneNumber: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch current profile data untuk prefill form
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Gagal memuat profil.');
        }
        const data = await res.json();
        setForm({
          name: data.name ?? '',
          username: data.username ?? '',
          phoneNumber: data.phoneNumber ?? '',
        });
      } catch (err) {
        setServerError('Tidak dapat memuat data profil.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'Nama tidak boleh kosong.';
    } else if (form.name.trim().length < 2) {
      newErrors.name = 'Nama minimal 2 karakter.';
    }

    if (!form.username.trim()) {
      newErrors.username = 'Username tidak boleh kosong.';
    } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      newErrors.username = 'Username hanya boleh huruf, angka, dan underscore.';
    } else if (form.username.length < 3) {
      newErrors.username = 'Username minimal 3 karakter.';
    }

    if (!form.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Nomor handphone tidak boleh kosong.';
    } else if (!/^(\+62|62|0)[0-9]{8,13}$/.test(form.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Format nomor handphone tidak valid.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error saat user mulai mengetik
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setServerError(null);
    setSuccessMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    setServerError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.message || 'Gagal menyimpan perubahan.');
        return;
      }

      setSuccessMsg('Profil berhasil diperbarui!');
      setTimeout(() => {
        router.push('/profile');
      }, 1200);
    } catch (err) {
      setServerError('Terjadi kesalahan jaringan. Coba lagi nanti.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const fields: { key: keyof EditForm; label: string; placeholder: string; type?: string }[] = [
    { key: 'name', label: 'Nama Lengkap', placeholder: 'Masukkan nama lengkap' },
    { key: 'username', label: 'Username', placeholder: 'Masukkan username (huruf, angka, _)' },
    { key: 'phoneNumber', label: 'Nomor Handphone', placeholder: '08xx xxxx xxxx', type: 'tel' },
  ];

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.contentArea}>
        <div className={styles.container}>

          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Profile</h1>
          </div>

          {/* Back button */}
          <button
            className={styles.backBtn}
            onClick={() => router.push('/profile')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12L12 19M5 12L12 5"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
            Kembali ke Profil
          </button>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h1 className={styles.title}>Edit Profil</h1>
              <p className={styles.subtitle}>
                Perbarui informasi akun kamu di sini
              </p>
            </div>

            {isLoading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner} />
                <p>Memuat data...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form} noValidate>

                {/* Fields */}
                {fields.map(({ key, label, placeholder, type }) => (
                  <div key={key} className={styles.fieldGroup}>
                    <label htmlFor={key} className={styles.label}>
                      {label}
                    </label>
                    <input
                      id={key}
                      name={key}
                      type={type ?? 'text'}
                      value={form[key]}
                      onChange={handleChange}
                      placeholder={placeholder}
                      className={`${styles.input} ${errors[key] ? styles.inputError : ''}`}
                      disabled={isSaving}
                    />
                    {errors[key] && (
                      <p className={styles.errorMsg}>{errors[key]}</p>
                    )}
                  </div>
                ))}

                {/* Email — readonly, tidak bisa diubah */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Email</label>
                  <div className={styles.readonlyWrapper}>
                    <input
                      type="email"
                      className={`${styles.input} ${styles.inputReadonly}`}
                      disabled
                      placeholder="Email tidak dapat diubah"
                    />
                    <span className={styles.readonlyBadge}>Terkunci</span>
                  </div>
                  <p className={styles.helperText}>
                    Email tidak dapat diubah. Hubungi support jika diperlukan.
                  </p>
                </div>

                {/* Feedback messages */}
                {serverError && (
                  <div className={styles.alertError}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    {serverError}
                  </div>
                )}

                {successMsg && (
                  <div className={styles.alertSuccess}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {successMsg}
                  </div>
                )}

                {/* Actions */}
                <div className={styles.actions}>
                  <button
                    type="button"
                    onClick={() => router.push('/profile')}
                    className={styles.cancelBtn}
                    disabled={isSaving}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className={styles.saveBtn}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <span className={styles.btnSpinner} />
                        Menyimpan...
                      </>
                    ) : (
                      'Simpan Perubahan'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}