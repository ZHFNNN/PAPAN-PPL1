"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

const faqs = [
  {
    q: "Bagaimana cara mendapatkan rekomendasi properti?",
    a: "Setelah masuk sebagai pencari properti, Anda akan mengisi onboarding yang berisi preferensi seperti lokasi, budget, dan spesifikasi. Sistem DSS akan memproses data tersebut dan menampilkan properti dengan skor kecocokan yang dipersonalisasi untuk Anda.",
    tag: "Pencari",
  },
  {
    q: "Bagaimana cara mencari properti secara manual?",
    a: "Anda dapat menggunakan fitur search untuk memasukkan kata kunci atau menggunakan filter berdasarkan tipe properti, jenis transaksi, harga, dan lainnya untuk mempersempit hasil pencarian sesuai kebutuhan.",
    tag: "Pencari",
  },
  {
    q: "Bagaimana cara menambahkan properti sebagai pemilik?",
    a: "Masuk sebagai pemilik properti, lalu buka dashboard dan klik tombol Tambah Properti. Isi informasi yang diperlukan seperti detail properti, harga, lokasi, fasilitas, dan upload foto, kemudian publikasikan.",
    tag: "Pemilik",
  },
  {
    q: "Apakah platform ini aman digunakan?",
    a: "Platform dirancang dengan mempertimbangkan keamanan, namun pengguna tetap disarankan untuk tidak melakukan transaksi di luar platform, tidak membagikan data pribadi, dan selalu memverifikasi informasi sebelum melakukan pembayaran.",
    tag: "Keamanan",
  },
  {
    q: "Apa itu skor kecocokan DSS?",
    a: "Skor kecocokan adalah nilai dari 0 hingga 100% yang dihasilkan oleh sistem Decision Support System (DSS) berdasarkan seberapa dekat properti dengan preferensi yang Anda isi saat onboarding, mencakup lokasi, harga, spesifikasi, dan fasilitas.",
    tag: "Fitur",
  },
  {
    q: "Bagaimana cara meningkatkan visibilitas properti saya?",
    a: "Pemilik properti dapat menggunakan fitur Booster Iklan yang tersedia di dashboard. Fitur ini merupakan layanan premium berbayar yang akan menempatkan listing Anda di posisi lebih menonjol sehingga lebih banyak dilihat oleh pencari properti.",
    tag: "Pemilik",
  },
];

const tagStyle: Record<string, { bg: string; color: string }> = {
  Pencari:  { bg: "rgba(0, 12, 184, 0.08)",  color: "#000cb8" },
  Pemilik:  { bg: "rgba(13, 27, 53, 0.08)",  color: "#1a2332" },
  Keamanan: { bg: "rgba(0, 12, 184, 0.05)",  color: "#2a1a6e" },
  Fitur:    { bg: "rgba(27, 58, 107, 0.08)", color: "#1b3a6b" },
};

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [filter, setFilter] = useState<string | null>(null);

  const tags = Array.from(new Set(faqs.map((f) => f.tag)));
  const filtered = filter ? faqs.filter((f) => f.tag === filter) : faqs;

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroDeco} aria-hidden />
          <div className={styles.heroInner}>
            <span className={styles.heroBadge}>Bantuan</span>
            <h1 className={styles.heroTitle}>Frequently Asked Questions</h1>
            <p className={styles.heroSub}>
              Temukan jawaban cepat untuk pertanyaan yang paling sering diajukan.
            </p>
          </div>
        </section>

        {/* Filter chips */}
        <div className={styles.filterRow}>
          <button
            className={`${styles.chip} ${!filter ? styles.chipActive : ""}`}
            onClick={() => setFilter(null)}
          >
            Semua
          </button>
          {tags.map((t) => (
            <button
              key={t}
              className={`${styles.chip} ${filter === t ? styles.chipActive : ""}`}
              onClick={() => setFilter(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Accordion */}
        <div className={styles.accordionWrap}>
          {filtered.map((faq, i) => {
            const realIndex = faqs.indexOf(faq);
            const isOpen = openIndex === realIndex;
            const ts = tagStyle[faq.tag];
            return (
              <div
                key={realIndex}
                className={`${styles.item} ${isOpen ? styles.itemOpen : ""}`}
              >
                <button
                  className={styles.question}
                  onClick={() => setOpenIndex(isOpen ? null : realIndex)}
                  aria-expanded={isOpen}
                >
                  <span className={styles.qNum}>0{i + 1}</span>
                  <span className={styles.qText}>{faq.q}</span>
                  <span
                    className={styles.qTag}
                    style={{ background: ts.bg, color: ts.color }}
                  >
                    {faq.tag}
                  </span>
                  <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}>
                    &#8595;
                  </span>
                </button>
                <div
                  className={styles.answer}
                  style={{ maxHeight: isOpen ? "400px" : "0" }}
                >
                  <p className={styles.answerText}>{faq.a}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className={styles.cta}>
          <p className={styles.ctaText}>Masih punya pertanyaan?</p>
          <a href="/kontak" className={styles.ctaBtn}>Hubungi Kami</a>
        </div>
      </main>
      <Footer />
    </>
  );
}