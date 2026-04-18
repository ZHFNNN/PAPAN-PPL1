"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

const sections = [
  {
    id: "login",
    title: "Login & Akses",
    step: "01",
    content:
      'Pengguna dapat langsung memilih peran saat masuk ke platform, yaitu sebagai pencari properti dengan tombol "Cari Properti" atau sebagai pemilik dengan tombol "Jual/Sewakan Properti". Saat ini sistem masih dalam mode demo sehingga pengguna dapat langsung masuk tanpa perlu memasukkan email dan password.',
  },
  {
    id: "onboarding",
    title: "Onboarding",
    step: "02",
    content:
      "Setelah masuk sebagai pencari properti, pengguna akan melalui proses onboarding yang terdiri dari tiga langkah, yaitu memilih tipe dan tujuan properti, menentukan lokasi serta budget, dan mengisi detail seperti jumlah kamar, luas, serta fasilitas. Data ini akan digunakan oleh sistem DSS untuk menghasilkan rekomendasi dengan skor kecocokan dari 0 hingga 100%.",
  },
  {
    id: "beranda",
    title: "Beranda",
    step: "03",
    content:
      "Pada halaman beranda, pengguna akan melihat daftar properti yang telah diurutkan berdasarkan tingkat kecocokan tertinggi dengan preferensi yang telah diisi. Setiap properti menampilkan informasi seperti harga, lokasi, spesifikasi, serta skor kecocokan beserta alasannya. Pengguna juga dapat menggunakan fitur pencarian, filter, dan pengurutan untuk menyesuaikan hasil.",
  },
  {
    id: "pencarian",
    title: "Pencarian Properti",
    step: "04",
    content:
      "Pengguna dapat mencari properti menggunakan search bar dengan kata kunci tertentu atau memanfaatkan filter berdasarkan tipe properti, jenis transaksi, dan opsi pengurutan seperti harga atau terbaru. Untuk melihat informasi lebih lengkap, pengguna dapat mengklik salah satu properti yang tersedia.",
  },
  {
    id: "detail",
    title: "Detail Properti",
    step: "05",
    content:
      "Halaman detail properti menyediakan informasi lengkap seperti foto, harga, skor kecocokan, spesifikasi, fasilitas, serta deskripsi properti dan informasi pemilik. Selain itu, pengguna juga dapat melakukan berbagai aksi seperti menghubungi pemilik, memulai chat, menyimpan properti ke favorit, atau membagikannya kepada orang lain.",
  },
  {
    id: "dashboard",
    title: "Dashboard Pemilik",
    step: "06",
    content:
      "Bagi pemilik properti, tersedia dashboard khusus yang menampilkan statistik seperti jumlah properti, jumlah views, dan inquiry. Pemilik dapat mengelola properti dengan menambah, mengedit, atau menghapus listing, serta menggunakan fitur booster untuk meningkatkan visibilitas. Selain itu, tersedia fitur verifikasi akun melalui upload KTP untuk meningkatkan kepercayaan pengguna lain.",
  },
  {
    id: "pembayaran",
    title: "Pembayaran",
    step: "07",
    content:
      "Fitur pembayaran digunakan untuk layanan premium seperti booster iklan. Pengguna dapat memilih berbagai metode pembayaran seperti kartu, transfer bank, e-wallet, atau minimarket. Setiap transaksi memiliki status seperti pending, berhasil, atau gagal yang dapat dipantau melalui sistem.",
  },
  {
    id: "tips",
    title: "Tips Singkat",
    step: "08",
    content:
      "Untuk pencari properti, disarankan mengisi preferensi secara lengkap, memanfaatkan filter, dan fokus pada properti dengan skor kecocokan tinggi. Bagi pemilik, penting untuk menggunakan foto berkualitas, menulis deskripsi yang jelas, menetapkan harga yang kompetitif, serta merespon calon pembeli dengan cepat. Selain itu, pengguna juga perlu menjaga keamanan dengan tidak melakukan transaksi sembarangan dan selalu memverifikasi informasi.",
  },
];

export default function PanduanPage() {
  const [activeId, setActiveId] = useState("login");
  const [visible, setVisible] = useState<Set<string>>(new Set());
  const refs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute("data-id")!;
          if (entry.isIntersecting) {
            setVisible((prev) => new Set([...prev, id]));
            setActiveId(id);
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    Object.values(refs.current).forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    refs.current[id]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroDeco} aria-hidden />
          <div className={styles.heroInner}>
            <span className={styles.heroBadge}>Dokumentasi</span>
            <h1 className={styles.heroTitle}>Panduan Penggunaan</h1>
            <p className={styles.heroSub}>
              Pelajari cara menggunakan platform PAPAN dari awal hingga mahir.
            </p>
          </div>
        </section>

        <div className={styles.layout}>
          <nav className={styles.toc}>
            <p className={styles.tocLabel}>Daftar Isi</p>
            <ul className={styles.tocList}>
              {sections.map((s) => (
                <li key={s.id}>
                  <button
                    className={`${styles.tocItem} ${activeId === s.id ? styles.tocActive : ""}`}
                    onClick={() => scrollTo(s.id)}
                  >
                    <span className={styles.tocStep}>{s.step}</span>
                    {s.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.content}>
            {sections.map((s, i) => (
              <div
                key={s.id}
                data-id={s.id}
                ref={(el) => { refs.current[s.id] = el; }}
                className={`${styles.card} ${visible.has(s.id) ? styles.cardVisible : ""}`}
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.cardStep}>{s.step}</span>
                  <h2 className={styles.cardTitle}>{s.title}</h2>
                </div>
                <p className={styles.cardText}>{s.content}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}