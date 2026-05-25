# Test Plan — Whitebox Testing Project PAPAN

> Disusun mengikuti adaptasi ringkas struktur **IEEE Std 829** untuk
> kebutuhan tugas akhir mata kuliah PPL. Bukan dokumen formal organisasi.

| Field | Value |
|---|---|
| Project | PAPAN — Property Recommendation Platform |
| Branch | `dev` |
| Repo root | `c:\Kuliah\Sem 6\PPL\PAPANGIT\PAPAN-PPL1` |
| Test type | Whitebox / Structural Testing (Unit level) |
| Plan version | 1.0 |
| Prepared at | 2026-05-25 |
| Prepared by | Tim PPL PAPAN |

---

## 1. Introduction

Dokumen ini mendefinisikan rencana pengujian *whitebox* untuk lima modul
inti project PAPAN. Tujuan utamanya: **memvalidasi struktur internal**
(control flow, decision logic, dan branch) dari fungsi-fungsi pure yang
menjadi tulang punggung sistem rekomendasi, formatter harga, paket boost,
dan signature pembayaran.

## 2. Test Items

Modul yang masuk scope:

| ID | File | Fungsi yang Diuji |
|---|---|---|
| TI-01 | [lib/dss/scoring.ts](../lib/dss/scoring.ts) | `normalizeBudgetScore`, `normalizeLocationScore`, `normalizeFacilityScore`, `FIXED_CRITERIA_WEIGHTS` |
| TI-02 | [lib/dss/facility-mapping.ts](../lib/dss/facility-mapping.ts) | `inferFacilityCode`, `resolveFacilityCodes`, `personalizationBooleanCodes`, `PERSONALIZATION_LABEL_TO_CODE` |
| TI-03 | [lib/format-price.ts](../lib/format-price.ts) | `formatPrice` (+ helper internal `formatAbbreviated`) |
| TI-04 | [lib/booster.ts](../lib/booster.ts) | `getBoosterPackage`, `getBoostEndsAt`, `getRemainingDays`, `BOOST_PACKAGES` |
| TI-05 | [lib/midtrans.ts](../lib/midtrans.ts) | `getMidtransSignatureKey` |

## 3. Features Out of Scope

| ID | Komponen | Alasan |
|---|---|---|
| OS-01 | Semua route handler di `app/api/**` | Mengakses Prisma; perlu mocking DB → wilayah integration test. |
| OS-02 | [lib/auth.ts](../lib/auth.ts) (NextAuth callbacks) | Bergantung framework runtime. |
| OS-03 | React components (`app/**/page.tsx`, `components/**`) | Wilayah UI testing. |
| OS-04 | `createMidtransSnapTransaction()` di [lib/midtrans.ts](../lib/midtrans.ts) | Melakukan `fetch()` ke API Midtrans eksternal. |
| OS-05 | Prisma client ([lib/prisma.ts](../lib/prisma.ts)), Cloudinary, Mailer | Wrapper tipis library third-party. |

## 4. Approach

Strategi whitebox yang dipakai (gabungan, untuk kekuatan saling melengkapi):

1. **Statement Coverage** — minimal setiap statement dieksekusi sekali.
2. **Branch Coverage** — setiap cabang `if/else`, ternary, `||/&&`
   short-circuit dilalui ke true dan false.
3. **Basis Path Testing** (McCabe) — hitung *cyclomatic complexity*
   V(G) untuk tiap fungsi, lalu rancang test case agar jumlahnya ≥ V(G)
   dan mencakup jalur independen.
4. **Boundary Value Analysis** — di titik perbatasan (`price == min`,
   `price == max`, `0`, batas BILLION/MILLION) sebagai penguat.
5. **Equivalence Partitioning** — di kasus ekstrim (nilai sangat besar /
   negatif jauh dari range).

Detail penghitungan V(G) dan tabel basis path per fungsi tersedia di
`docs/basis-path/*.md`.

## 5. Item Pass / Fail Criteria

Sebuah test item dianggap **PASS** jika:

- Seluruh assertion-nya hijau (`expect(...).toBe(...)` lulus).
- Branch coverage modul = **100%**.
- Statement coverage modul ≥ **95%** (kecuali untuk fungsi yang
  diidentifikasi *Out of Scope* di bagian 3).
- Tidak ada *flaky test* (3 run berturut-turut hasilnya sama).

Sebuah test item dianggap **FAIL** jika salah satu kriteria di atas
tidak terpenuhi.

## 6. Suspension Criteria & Resumption Requirements

- **Suspend** jika ditemukan bug yang menghalangi modul untuk berfungsi
  (mis. `lib/dss/scoring.ts` throw saat di-import).
- **Resume** setelah bug di-fix dan branch yang terdampak ditambahkan
  test case regresi.

## 7. Test Deliverables

| ID | Deliverable | Lokasi |
|---|---|---|
| D-01 | Test plan (dokumen ini) | [docs/test-plan.md](./test-plan.md) |
| D-02 | Test report | [docs/test-report.md](./test-report.md) |
| D-03 | Basis path tables (5 modul) | [docs/basis-path/](./basis-path/) |
| D-04 | Source test cases | [tests/unit/*.test.ts](../tests/unit/) |
| D-05 | Coverage report (HTML) | `coverage/index.html` (regenerate dgn `npm run coverage`) |
| D-06 | Coverage report (JSON summary) | `coverage/coverage-summary.json` |
| D-07 | Script presentasi | [docs/presentation-script.md](./presentation-script.md) |

## 8. Test Environment

| Komponen | Spesifikasi |
|---|---|
| OS | Windows 11 Home Single Language 10.0.26200 |
| Shell | PowerShell 5.1 |
| Node.js | v22.9.0 |
| Package manager | npm 10.8.3 |
| Test runner | Vitest **2.1.9** |
| Coverage provider | `@vitest/coverage-v8` 2.1.9 |
| TypeScript | 5.x |
| Target frameworks | Next.js 16.2.2, React 19.2.4, Prisma 6.19.3 |

> Catatan kompatibilitas: Vitest 4.x butuh Node ≥22.13 sedangkan
> environment mahasiswa Node 22.9, sehingga dipilih Vitest 2.x yang
> stabil di Node 22.9.

## 9. Responsibilities

| Role | PIC | Tanggung Jawab |
|---|---|---|
| Test designer | Tim PPL | Menyusun basis path & test case. |
| Test implementer | Tim PPL | Mengetik test ke `tests/unit/*.test.ts`. |
| Reviewer | Anggota lain | Cross-check tabel basis path vs implementasi. |
| Presenter | Tim PPL | Demo di hadapan dosen. |

## 10. Schedule

| Tanggal | Aktivitas |
|---|---|
| 2026-05-25 | Setup Vitest, ekstrak fungsi pure ke `lib/dss/scoring.ts`. |
| 2026-05-25 | Tulis 70 test case lintas 5 modul. |
| 2026-05-25 | Run coverage, verify ≥95% statement & 100% branch. |
| 2026-05-26 | Susun dokumen presentasi & lampiran basis path. |
| TBD | Presentasi tugas akhir di kelas. |

## 11. Risks & Contingencies

| Risk | Likelihood | Mitigation |
|---|---|---|
| Vitest version mismatch dengan Node | Medium | Lock di Vitest 2.x di `package.json`. |
| Coverage threshold di-relax oleh tim | Low | Tambah `coverage.thresholds` di [vitest.config.ts](../vitest.config.ts) jika perlu enforce di CI. |
| Refactor route handler kebablasan | Low | Hanya `lib/dss/scoring.ts` yang diekstrak; route hanya re-import. |
| Demo gagal di laptop dosen | Low | Sediakan screenshot `coverage/index.html` sebagai backup. |

## 12. Approvals

| Role | Nama | Tanda Tangan | Tanggal |
|---|---|---|---|
| Penyusun | _________ | _________ | _________ |
| Reviewer | _________ | _________ | _________ |
| Dosen Pengampu | _________ | _________ | _________ |
