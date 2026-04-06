"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import styles from "./page.module.css";

// ─── Types ───────────────────────────────────────────────────────────────────

type KycStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED";

interface KycStatusResponse {
  kycStatus: KycStatus;
  submission: {
    nik: string;
    fullName: string;
    phoneNumber: string;
    province: string;
    cityOrRegency: string;
    district: string;
    rt: string;
    rw: string;
    postalCode: string;
    ktpImageUrl: string;
    selfieImageUrl: string;
    adminNotes?: string | null;
    createdAt: string;
  } | null;
}

type Step = 1 | 2 | 3;

interface FormData {
  nik: string;
  fullName: string;
  phoneNumber: string;
  province: string;
  cityOrRegency: string;
  district: string;
  rt: string;
  rw: string;
  postalCode: string;
  ktpImageUrl: string;
  selfieImageUrl: string;
}

interface FieldErrors {
  [key: string]: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STEPS = [
  { label: "Data Diri" },
  { label: "Alamat KTP" },
  { label: "Upload Foto" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── Upload Hook ─────────────────────────────────────────────────────────────

function useImageUpload(endpoint: string) {
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const trigger = () => inputRef.current?.click();

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("File harus berupa gambar (JPG/PNG/WEBP).");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 5 MB.");
        return;
      }

      setUploading(true);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch(endpoint, { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Upload gagal");
        setUrl(data.data.url);
        toast.success("Foto berhasil diunggah!");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload gagal");
      } finally {
        setUploading(false);
      }
    },
    [endpoint]
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // reset so same file can be re-selected
    e.target.value = "";
  };

  return { url, setUrl, uploading, trigger, onChange, inputRef };
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function VerifyPage() {
  const router = useRouter();

  // Status loading
  const [pageLoading, setPageLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState<KycStatus>("NONE");
  const [existingSubmission, setExistingSubmission] =
    useState<KycStatusResponse["submission"]>(null);

  // Multi-step form
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState<FormData>({
    nik: "",
    fullName: "",
    phoneNumber: "",
    province: "",
    cityOrRegency: "",
    district: "",
    rt: "",
    rw: "",
    postalCode: "",
    ktpImageUrl: "",
    selfieImageUrl: "",
  });

  const [errors, setErrors] = useState<FieldErrors>({});

  // Upload handlers
  const ktp = useImageUpload("/api/uploads/ktp");
  const selfie = useImageUpload("/api/uploads/selfie");

  // ── Fetch current KYC status ──────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/kyc/my-status");
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const data: KycStatusResponse = await res.json();
        setKycStatus(data.kycStatus);
        if (data.submission) {
          setExistingSubmission(data.submission);
          // Prefill form for re-submission after rejection
          if (data.kycStatus === "REJECTED") {
            const s = data.submission;
            setForm({
              nik: s.nik,
              fullName: s.fullName,
              phoneNumber: s.phoneNumber,
              province: s.province,
              cityOrRegency: s.cityOrRegency,
              district: s.district,
              rt: s.rt,
              rw: s.rw,
              postalCode: s.postalCode,
              ktpImageUrl: s.ktpImageUrl,
              selfieImageUrl: s.selfieImageUrl,
            });
            ktp.setUrl(s.ktpImageUrl);
            selfie.setUrl(s.selfieImageUrl);
          }
        }
      } catch {
        toast.error("Gagal memuat status verifikasi.");
      } finally {
        setPageLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync upload URLs into form
  useEffect(() => {
    setForm((prev) => ({ ...prev, ktpImageUrl: ktp.url }));
  }, [ktp.url]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, selfieImageUrl: selfie.url }));
  }, [selfie.url]);

  // ── Field helpers ─────────────────────────────────────────────────────────
  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // ── Validation per step ───────────────────────────────────────────────────
  const validate = (target: Step): boolean => {
    const errs: FieldErrors = {};

    if (target === 1) {
      if (!/^\d{16}$/.test(form.nik))
        errs.nik = "NIK harus tepat 16 digit angka.";
      if (form.fullName.trim().length < 3)
        errs.fullName = "Nama lengkap minimal 3 karakter.";
      if (form.phoneNumber.trim().length < 8)
        errs.phoneNumber = "Nomor HP minimal 8 karakter.";
    }

    if (target === 2) {
      if (form.province.trim().length < 2) errs.province = "Provinsi wajib diisi.";
      if (form.cityOrRegency.trim().length < 2)
        errs.cityOrRegency = "Kota/Kabupaten wajib diisi.";
      if (form.district.trim().length < 2)
        errs.district = "Kecamatan wajib diisi.";
      if (!/^\d{1,3}$/.test(form.rt)) errs.rt = "RT harus 1–3 digit angka.";
      if (!/^\d{1,3}$/.test(form.rw)) errs.rw = "RW harus 1–3 digit angka.";
      if (!/^\d{5}$/.test(form.postalCode))
        errs.postalCode = "Kode pos harus 5 digit.";
    }

    if (target === 3) {
      if (!form.ktpImageUrl) errs.ktpImageUrl = "Foto KTP wajib diunggah.";
      if (!form.selfieImageUrl) errs.selfieImageUrl = "Selfie wajib diunggah.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (validate(step)) setStep((s) => (s < 3 ? ((s + 1) as Step) : s));
  };

  const prevStep = () => setStep((s) => (s > 1 ? ((s - 1) as Step) : s));

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate(3)) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/kyc/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengirim data.");

      setSubmitted(true);
      setKycStatus("PENDING");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan server.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Drag & Drop ───────────────────────────────────────────────────────────
  const makeDrop =
    (handler: (f: File) => void) =>
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) handler(file);
    };

  // ─────────────────────────────────────────────────────────────────────────
  // Render helpers
  // ─────────────────────────────────────────────────────────────────────────

  const stepClass = (n: number) => {
    if (n < step) return `${styles.step} ${styles.stepDone}`;
    if (n === step) return `${styles.step} ${styles.stepActive}`;
    return styles.step;
  };

  const inputClass = (field: string) =>
    [styles.input, errors[field] ? styles.inputError : ""].join(" ").trim();

  const Field = ({
    id,
    label,
    placeholder,
    value,
    onChange,
    maxLength,
    required = true,
    className,
  }: {
    id: keyof FormData;
    label: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    maxLength?: number;
    required?: boolean;
    className?: string;
  }) => (
    <div className={`${styles.field}${className ? ` ${className}` : ""}`}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      <input
        id={id}
        className={inputClass(id)}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
      />
      {errors[id] && <p className={styles.errorMsg}>{errors[id]}</p>}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Loading skeleton
  // ─────────────────────────────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <div className={styles.root}>
        <div className={styles.loadingWrapper}>
          <div className={styles.skeleton} style={{ height: 60 }} />
          <div className={styles.skeleton} style={{ height: 80 }} />
          <div className={styles.skeleton} style={{ height: 320 }} />
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Status: PENDING
  // ─────────────────────────────────────────────────────────────────────────
  if (kycStatus === "PENDING" && !submitted) {
    return (
      <div className={styles.root}>
        <Toaster position="top-center" />
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => router.back()}>
            ← Kembali
          </button>
          <h1 className={styles.pageTitle}>Verifikasi Identitas</h1>
          <p className={styles.pageSubtitle}>
            Data kamu sedang ditinjau oleh tim kami.
          </p>
        </div>

        <div className={`${styles.statusBanner} ${styles.pending}`}>
          <div className={styles.statusIcon}>⏳</div>
          <div>
            <p className={styles.statusTitle}>Sedang Ditinjau</p>
            <p className={styles.statusDesc}>
              Pengajuan verifikasi kamu diterima pada{" "}
              {existingSubmission ? formatDate(existingSubmission.createdAt) : "—"}.
              Proses peninjauan biasanya memakan waktu 1×24 jam kerja.
            </p>
          </div>
        </div>

        <div className={styles.card}>
          <p className={styles.sectionTitle}>
            <span>✓</span> Ringkasan Pengajuan
          </p>
          {existingSubmission && (
            <div className={styles.grid2}>
              <div className={styles.field}>
                <span className={styles.label}>Nama Lengkap</span>
                <span>{existingSubmission.fullName}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>NIK</span>
                <span>{existingSubmission.nik}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Provinsi</span>
                <span>{existingSubmission.province}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Kota/Kabupaten</span>
                <span>{existingSubmission.cityOrRegency}</span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.actionRow}>
          <button className={styles.btnFull} onClick={() => router.push("/owner")}>
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Status: APPROVED
  // ─────────────────────────────────────────────────────────────────────────
  if (kycStatus === "APPROVED") {
    return (
      <div className={styles.root}>
        <Toaster position="top-center" />
        <div className={styles.successWrapper}>
          <div className={styles.successIcon}>🎉</div>
          <h2 className={styles.successTitle}>Akun Terverifikasi!</h2>
          <p className={styles.successDesc}>
            Identitasmu telah berhasil diverifikasi. Kamu sekarang bisa
            menambahkan properti dan menggunakan semua fitur PAPAN.
          </p>
          <button
            className={styles.btnFull}
            onClick={() => router.push("/owner/addProperty")}
          >
            Tambah Properti Sekarang
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Submitted success state
  // ─────────────────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className={styles.root}>
        <Toaster position="top-center" />
        <div className={styles.successWrapper}>
          <div className={styles.successIcon}>📬</div>
          <h2 className={styles.successTitle}>Pengajuan Terkirim!</h2>
          <p className={styles.successDesc}>
            Data verifikasimu telah kami terima dan sedang dalam proses
            peninjauan. Kami akan memberitahumu melalui notifikasi dalam 1×24
            jam kerja.
          </p>
          <button
            className={styles.btnFull}
            onClick={() => router.push("/owner")}
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FORM (NONE / REJECTED)
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className={styles.root}>
      <Toaster position="top-center" />

      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          ← Kembali
        </button>
        <h1 className={styles.pageTitle}>Verifikasi Identitas</h1>
        <p className={styles.pageSubtitle}>
          Lengkapi data dirimu agar bisa menjadi pemilik properti terverifikasi.
        </p>
      </div>

      {/* Rejected banner */}
      {kycStatus === "REJECTED" && existingSubmission && (
        <div className={`${styles.statusBanner} ${styles.rejected}`}>
          <div className={styles.statusIcon}>❌</div>
          <div>
            <p className={styles.statusTitle}>Pengajuan Ditolak</p>
            <p className={styles.statusDesc}>
              Pengajuanmu sebelumnya ditolak. Silakan perbaiki data dan coba
              lagi.
            </p>
            {existingSubmission.adminNotes && (
              <p className={styles.adminNotes}>
                <strong>Catatan Admin:</strong> {existingSubmission.adminNotes}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Steps */}
      <div className={styles.steps}>
        {STEPS.map((s, i) => (
          <div key={i} className={stepClass(i + 1)}>
            <div className={styles.stepCircle}>
              {i + 1 < step ? "✓" : i + 1}
            </div>
            <span className={styles.stepLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Step 1: Data Diri ── */}
      {step === 1 && (
        <div className={styles.card}>
          <p className={styles.sectionTitle}>
            <span>1</span> Data Diri Sesuai KTP
          </p>
          <div className={styles.grid2}>
            <Field
              id="nik"
              label="NIK (16 digit)"
              placeholder="Contoh: 3273010101900001"
              value={form.nik}
              onChange={set("nik")}
              maxLength={16}
              className={styles.gridFull}
            />
            <Field
              id="fullName"
              label="Nama Lengkap"
              placeholder="Sesuai KTP"
              value={form.fullName}
              onChange={set("fullName")}
              className={styles.gridFull}
            />
            <Field
              id="phoneNumber"
              label="Nomor HP"
              placeholder="Contoh: 08123456789"
              value={form.phoneNumber}
              onChange={set("phoneNumber")}
              maxLength={20}
            />
          </div>
        </div>
      )}

      {/* ── Step 2: Alamat ── */}
      {step === 2 && (
        <div className={styles.card}>
          <p className={styles.sectionTitle}>
            <span>2</span> Alamat Sesuai KTP
          </p>
          <div className={styles.grid2}>
            <Field
              id="province"
              label="Provinsi"
              placeholder="Contoh: Jawa Barat"
              value={form.province}
              onChange={set("province")}
            />
            <Field
              id="cityOrRegency"
              label="Kota / Kabupaten"
              placeholder="Contoh: Kota Bandung"
              value={form.cityOrRegency}
              onChange={set("cityOrRegency")}
            />
            <Field
              id="district"
              label="Kecamatan"
              placeholder="Contoh: Coblong"
              value={form.district}
              onChange={set("district")}
            />
            <Field
              id="postalCode"
              label="Kode Pos"
              placeholder="Contoh: 40132"
              value={form.postalCode}
              onChange={set("postalCode")}
              maxLength={5}
            />
            <Field
              id="rt"
              label="RT"
              placeholder="Contoh: 003"
              value={form.rt}
              onChange={set("rt")}
              maxLength={3}
            />
            <Field
              id="rw"
              label="RW"
              placeholder="Contoh: 007"
              value={form.rw}
              onChange={set("rw")}
              maxLength={3}
            />
          </div>
        </div>
      )}

      {/* ── Step 3: Upload Foto ── */}
      {step === 3 && (
        <div className={styles.card}>
          <p className={styles.sectionTitle}>
            <span>3</span> Upload Foto Identitas
          </p>
          <div className={styles.uploadGrid}>
            {/* KTP */}
            <div className={styles.uploadBox}>
              <span className={styles.uploadLabel}>
                Foto KTP <span className={styles.required}>*</span>
              </span>
              <div
                className={[
                  styles.uploadArea,
                  errors.ktpImageUrl ? styles.uploadAreaError : "",
                ].join(" ")}
                onClick={ktp.trigger}
                onDragOver={(e) => e.preventDefault()}
                onDrop={makeDrop(ktp.handleFile)}
              >
                {ktp.url ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ktp.url} alt="KTP" className={styles.uploadPreview} />
                    <button className={styles.changeBtn} onClick={(e) => { e.stopPropagation(); ktp.trigger(); }}>
                      Ganti
                    </button>
                  </>
                ) : (
                  <div className={styles.uploadPlaceholder}>
                    <span className={styles.uploadIcon}>🪪</span>
                    <span className={styles.uploadText}>Klik atau seret foto KTP</span>
                    <span className={styles.uploadHint}>JPG / PNG, maks. 5 MB</span>
                  </div>
                )}
                {ktp.uploading && (
                  <div className={styles.uploadingOverlay}>
                    <div className={styles.spinner} />
                    <span className={styles.uploadingText}>Mengunggah…</span>
                  </div>
                )}
              </div>
              <input
                ref={ktp.inputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={ktp.onChange}
              />
              {errors.ktpImageUrl && (
                <p className={styles.errorMsg}>{errors.ktpImageUrl}</p>
              )}
            </div>

            {/* Selfie */}
            <div className={styles.uploadBox}>
              <span className={styles.uploadLabel}>
                Selfie + KTP <span className={styles.required}>*</span>
              </span>
              <div
                className={[
                  styles.uploadArea,
                  errors.selfieImageUrl ? styles.uploadAreaError : "",
                ].join(" ")}
                onClick={selfie.trigger}
                onDragOver={(e) => e.preventDefault()}
                onDrop={makeDrop(selfie.handleFile)}
              >
                {selfie.url ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selfie.url} alt="Selfie" className={styles.uploadPreview} />
                    <button className={styles.changeBtn} onClick={(e) => { e.stopPropagation(); selfie.trigger(); }}>
                      Ganti
                    </button>
                  </>
                ) : (
                  <div className={styles.uploadPlaceholder}>
                    <span className={styles.uploadIcon}>🤳</span>
                    <span className={styles.uploadText}>Klik atau seret foto selfie</span>
                    <span className={styles.uploadHint}>Pegang KTP di samping wajah</span>
                  </div>
                )}
                {selfie.uploading && (
                  <div className={styles.uploadingOverlay}>
                    <div className={styles.spinner} />
                    <span className={styles.uploadingText}>Mengunggah…</span>
                  </div>
                )}
              </div>
              <input
                ref={selfie.inputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={selfie.onChange}
              />
              {errors.selfieImageUrl && (
                <p className={styles.errorMsg}>{errors.selfieImageUrl}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className={styles.actionRow}>
        {step > 1 ? (
          <button className={styles.btnSecondary} onClick={prevStep} disabled={submitting}>
            ← Sebelumnya
          </button>
        ) : (
          <button className={styles.btnSecondary} onClick={() => router.back()}>
            Batal
          </button>
        )}

        {step < 3 ? (
          <button className={styles.btnPrimary} onClick={nextStep}>
            Selanjutnya →
          </button>
        ) : (
          <button
            className={styles.btnPrimary}
            onClick={handleSubmit}
            disabled={submitting || ktp.uploading || selfie.uploading}
          >
            {submitting ? "Mengirim…" : "Kirim Verifikasi ✓"}
          </button>
        )}
      </div>
    </div>
  );
}