# Whitebox Testing — Project PAPAN

Dokumentasi lengkap pengujian whitebox untuk tugas akhir mata kuliah PPL.
Dokumen ini adalah **index** — silakan buka file terkait di bawah.

---

## Peta Dokumen

| Dokumen | Isi | Audiens |
|---|---|---|
| [test-plan.md](./test-plan.md) | Rencana pengujian formal (scope, approach, criteria) | Dosen / penguji |
| [test-report.md](./test-report.md) | Laporan eksekusi: hasil, metrik, kesimpulan | Dosen / penguji |
| [presentation-script.md](./presentation-script.md) | Naskah ngomong per slide presentasi | Presenter |
| [basis-path/scoring.md](./basis-path/scoring.md) | CFG + basis path untuk 3 fungsi DSS (`normalize*`) | Penyusun slide & lampiran |
| [basis-path/format-price.md](./basis-path/format-price.md) | CFG + basis path `formatPrice()` | idem |
| [basis-path/booster.md](./basis-path/booster.md) | CFG + basis path util booster (3 fungsi) | idem |
| [basis-path/facility-mapping.md](./basis-path/facility-mapping.md) | CFG + basis path mapping fasilitas (4 fungsi) | idem |
| [basis-path/midtrans-signature.md](./basis-path/midtrans-signature.md) | CFG + basis path `getMidtransSignatureKey()` | idem |

---

## Ringkasan Cepat (1 layar)

**Apa**: pengujian struktural berbasis Control Flow Graph (CFG) dan
*Basis Path Testing* — bukan hanya menguji input/output, tapi memastikan
**setiap jalur eksekusi internal** dilewati minimal sekali.

**Tools**: Vitest 2.x + `@vitest/coverage-v8` (lihat
[vitest.config.ts](../vitest.config.ts)).

**Cara jalankan**:

```bash
npm install
npm test          # jalankan 70 unit test
npm run coverage  # plus laporan coverage (HTML di coverage/index.html)
```

**Scope**: 5 modul pure-function di [lib/](../lib/) yang menjadi tulang
punggung logika bisnis:

| Modul | Tests | Statement | Branch |
|---|---|---|---|
| [lib/dss/scoring.ts](../lib/dss/scoring.ts) | 24 | 100% | 100% |
| [lib/dss/facility-mapping.ts](../lib/dss/facility-mapping.ts) | 14 | 100% | 100% |
| [lib/format-price.ts](../lib/format-price.ts) | 15 | 100% | 100% |
| [lib/booster.ts](../lib/booster.ts) | 12 | 100% | 100% |
| [lib/midtrans.ts](../lib/midtrans.ts) — `getMidtransSignatureKey` | 5 | 31% \* | 100% |

\* Statement coverage `midtrans.ts` rendah karena
`createMidtransSnapTransaction()` melakukan HTTP call ke Midtrans dan
sengaja **tidak** masuk scope whitebox (wilayah integration test).

**Total: 70 test case, semua lulus, branch coverage 100%** pada bagian
yang diuji.

---

## Yang Tidak Masuk Scope

Whitebox testing menuntut akses penuh ke internal sebuah unit kode.
Berikut yang **sengaja tidak** dimasukkan:

| Komponen | Alasan |
|---|---|
| Route handler `app/api/**` | Banyak panggilan Prisma → perlu mock DB, lebih cocok integration test. |
| NextAuth callbacks ([lib/auth.ts](../lib/auth.ts)) | Bergantung session JWT runtime; perlu test framework-aware. |
| React components | Wilayah UI testing (mis. Playwright / React Testing Library). |
| `createMidtransSnapTransaction()` | Melakukan `fetch()` ke API eksternal. |

Saran lanjutan (jika dosen menanyakan "kenapa tidak diuji"): lihat
bagian *Risks & Recommendations* di [test-report.md](./test-report.md).

---

## Catatan Versi

- Setup awal: **2026-05-25** (Atreus883, branch `dev`).
- Node.js: 22.9 (Vitest 2.x dipilih karena Vitest 4.x butuh ≥22.13).
- Next.js: 16.2.2 (App Router).
