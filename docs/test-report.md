# Test Report — Whitebox Testing Project PAPAN

Companion dari [test-plan.md](./test-plan.md). Berisi hasil eksekusi
aktual + interpretasi.

| Field | Value |
|---|---|
| Project | PAPAN |
| Branch | `dev` |
| Run date | 2026-05-25 |
| Tester | Tim PPL PAPAN |
| Test runner | Vitest 2.1.9 + `@vitest/coverage-v8` 2.1.9 |
| Command | `npm run coverage` |
| OS / Node | Windows 11 / Node 22.9.0 |

---

## 1. Executive Summary

> **Verdict: PASS.** 70 dari 70 test case lulus, branch coverage **100%**
> pada semua modul scope. Tidak ada flaky test pada 3 run berturut-turut.

| Metrik | Hasil |
|---|---|
| Total test case | **70** |
| Lulus | **70 (100%)** |
| Gagal | 0 |
| Skip | 0 |
| Durasi total run | < 1 detik |
| Branch coverage (modul scope) | **100%** |
| Statement coverage (modul scope, exclude OS-04) | **100%** |

## 2. Test Suite Breakdown

| Suite | File | Tests | Status |
|---|---|---|---|
| DSS scoring | [tests/unit/scoring.test.ts](../tests/unit/scoring.test.ts) | 24 | PASS |
| Facility mapping | [tests/unit/facility-mapping.test.ts](../tests/unit/facility-mapping.test.ts) | 14 | PASS |
| Format price | [tests/unit/format-price.test.ts](../tests/unit/format-price.test.ts) | 15 | PASS |
| Booster utilities | [tests/unit/booster.test.ts](../tests/unit/booster.test.ts) | 12 | PASS |
| Midtrans signature | [tests/unit/midtrans-signature.test.ts](../tests/unit/midtrans-signature.test.ts) | 5 | PASS |
| **Total** | | **70** | **PASS** |

## 3. Coverage Report (Terminal Output)

```
 RUN  v2.1.9 C:/Kuliah/Sem 6/PPL/PAPANGIT/PAPAN-PPL1
      Coverage enabled with v8

 ✓ tests/unit/scoring.test.ts             (24 tests)   6ms
 ✓ tests/unit/midtrans-signature.test.ts  (5 tests)    6ms
 ✓ tests/unit/facility-mapping.test.ts    (14 tests)   7ms
 ✓ tests/unit/booster.test.ts             (12 tests)   8ms
 ✓ tests/unit/format-price.test.ts        (15 tests)  28ms

 Test Files  5 passed (5)
      Tests  70 passed (70)
   Duration  ~880 ms

 % Coverage report from v8
-------------------|---------|----------|---------|---------|
File               | % Stmts | % Branch | % Funcs | % Lines |
-------------------|---------|----------|---------|---------|
All files          |  83.76  |   100    |  82.35  |  83.76  |
 lib                                                          
  booster.ts       |   100   |   100    |   100   |   100   |
  format-price.ts  |   100   |   100    |   100   |   100   |
  midtrans.ts      |  31.25  |   100    |   40    |  31.25  |  *
 lib/dss                                                      
  facility-mapping |   100   |   100    |   100   |   100   |
  scoring.ts       |   100   |   100    |   100   |   100   |
-------------------|---------|----------|---------|---------|
```

\* `midtrans.ts` statement coverage 31.25% bukan kegagalan: hanya satu
fungsi (`getMidtransSignatureKey`) yang masuk scope whitebox. Fungsi
`createMidtransSnapTransaction` (yang berisi `fetch()` ke API Midtrans)
sengaja **diabaikan** sesuai *Test Plan* bagian §3 (OS-04).

## 4. Per-Modul Verification

### 4.1 TI-01 — `lib/dss/scoring.ts`

| Fungsi | V(G) | # Test | Branch Cov | Hasil |
|---|---:|---:|---:|:---:|
| `normalizeBudgetScore` | 6 | 11 | 100% | PASS |
| `normalizeLocationScore` | 3 | 7 | 100% | PASS |
| `normalizeFacilityScore` | 2 | 5 | 100% | PASS |
| (kontrak `FIXED_CRITERIA_WEIGHTS`) | — | 1 | — | PASS |

Detail basis path: [basis-path/scoring.md](./basis-path/scoring.md).

### 4.2 TI-02 — `lib/dss/facility-mapping.ts`

| Fungsi | V(G) | # Test | Branch Cov | Hasil |
|---|---:|---:|---:|:---:|
| `inferFacilityCode` (+ `toCodeDirect`) | 5 | 8 | 100% | PASS |
| `resolveFacilityCodes` | 3 | 3 | 100% | PASS |
| `personalizationBooleanCodes` | 8 | 3 | 100% | PASS |

Detail basis path: [basis-path/facility-mapping.md](./basis-path/facility-mapping.md).

### 4.3 TI-03 — `lib/format-price.ts`

| Fungsi | V(G) | # Test | Branch Cov | Hasil |
|---|---:|---:|---:|:---:|
| `formatPrice` (+ helper `formatAbbreviated`) | 6 | 15 | 100% | PASS |

Detail basis path: [basis-path/format-price.md](./basis-path/format-price.md).

### 4.4 TI-04 — `lib/booster.ts`

| Fungsi | V(G) | # Test | Branch Cov | Hasil |
|---|---:|---:|---:|:---:|
| `getBoosterPackage` | 2 | 4 | 100% | PASS |
| `getBoostEndsAt` | 1 | 3 | 100% | PASS |
| `getRemainingDays` | 2 | 4 | 100% | PASS |
| (kontrak `BOOST_PACKAGES`) | — | 1 | — | PASS |

Detail basis path: [basis-path/booster.md](./basis-path/booster.md).

### 4.5 TI-05 — `lib/midtrans.ts` (`getMidtransSignatureKey`)

| Fungsi | V(G) | # Test | Branch Cov | Hasil |
|---|---:|---:|---:|:---:|
| `getMidtransSignatureKey` | 2 | 5 | 100% | PASS |

Detail basis path: [basis-path/midtrans-signature.md](./basis-path/midtrans-signature.md).

## 5. Defects Found During Testing

| ID | Severity | Modul | Deskripsi | Status |
|---|---|---|---|---|
| BUG-001 | Minor (test bug, bukan source bug) | `formatPrice` test | Asumsi awal `formatPrice("abc")` mengembalikan `"NaN"`. Aktualnya `Number("abc".replace(/[^0-9-]/g, "")) === 0`, jadi hasilnya `"Rp0"`. | Fixed — test diganti pakai `Number.NaN` langsung, dan ditambah test baru yang dokumentasikan perilaku string un-parseable. |

Tidak ditemukan bug pada source code yang diuji.

## 6. Refactor Catatan

Untuk memungkinkan unit test fungsi DSS, perlu satu refactor kecil:
fungsi `normalize*` semula didefinisikan **di dalam** route file
`app/api/recommendations/route.ts`. Next.js 16 hanya membolehkan export
HTTP method handler dari route file, jadi fungsi-fungsi tersebut tidak
bisa di-import langsung dari test.

**Solusi**: ekstrak ke module baru
[lib/dss/scoring.ts](../lib/dss/scoring.ts). Route file kemudian
hanya re-import — perilaku endpoint identik 100%.

Verifikasi tidak ada regresi:

- `npm run lint` → 0 error (warnings yang ada adalah pre-existing,
  tidak terkait refactor).
- `git diff app/api/recommendations/route.ts` → hanya menambahkan
  import dan menghapus deklarasi fungsi lokal.

## 7. Coverage Artifacts

Setelah `npm run coverage`, artifact berikut tersedia (tidak di-commit
karena ada di `.gitignore`):

| Artifact | Lokasi | Kegunaan |
|---|---|---|
| HTML report interaktif | `coverage/index.html` | Demo interaktif + screenshot slide. |
| LCOV report | `coverage/lcov.info` | Bisa diunggah ke Codecov/Coveralls. |
| JSON summary | `coverage/coverage-summary.json` | Konsumsi CI / script otomatis. |
| Per-file HTML | `coverage/lib/**/*.html` | Highlight baris yang tercover. |

## 8. Risks & Recommendations

| Risk | Recommendation |
|---|---|
| Route handler `app/api/**` belum diuji. | Tambahkan **integration test** pakai `supertest` + DB Prisma `SQLite memory` di follow-up. |
| `createMidtransSnapTransaction` melakukan HTTP call live. | Tambahkan **contract test** pakai `nock` atau `msw` untuk stub response Midtrans. |
| Belum ada UI test. | Pertimbangkan **Playwright** untuk happy path login → search → bookmark. |
| Coverage threshold belum di-enforce di CI. | Tambah `coverage.thresholds` di [vitest.config.ts](../vitest.config.ts) + step di workflow GitHub Actions yang sudah ada. |

## 9. Conclusion

Whitebox testing untuk lima modul inti project PAPAN **berhasil**
mencapai 100% branch coverage dengan 70 test case yang seluruhnya
lulus. Strategi *Basis Path Testing* berbasis Cyclomatic Complexity
membuktikan ekonomi: jumlah test yang dirancang minimal dan tetap
cukup untuk menjamin keberlanjutan semua jalur eksekusi.

Tindak lanjut yang disarankan: tingkatkan ke level *integration testing*
untuk route handler dan *contract testing* untuk integrasi Midtrans.
