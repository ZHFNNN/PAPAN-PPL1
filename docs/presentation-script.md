# Naskah Presentasi — Whitebox Testing PAPAN

Script siap-baca untuk presentasi tugas akhir PPL (durasi target
**10–12 menit**). Tiap section di bawah = satu slide. Bagian
[bracketed] adalah aksi presenter, bukan dibaca.

> Tip: cetak halaman ini atau buka di tab kedua sambil presentasi.

---

## Slide 1 — Judul

```
+-----------------------------------------------------+
|                                                     |
|   Whitebox Testing pada Project PAPAN               |
|   Pendekatan Basis Path Testing                     |
|                                                     |
|   Tim PPL · 25 Mei 2026                             |
|                                                     |
+-----------------------------------------------------+
```

> "Selamat pagi/siang Bapak/Ibu dan teman-teman. Kami akan
> mempresentasikan hasil pengujian whitebox pada project akhir kami,
> sebuah platform rekomendasi properti bernama **PAPAN**. Fokus
> presentasi ini adalah pendekatan **Basis Path Testing** dan hasilnya."

---

## Slide 2 — Apa itu Whitebox Testing?

```
WHITEBOX                vs              BLACKBOX
-----------------                       -----------------
- Tahu source code                      - Hanya tahu spec
- Berdasarkan struktur                  - Berdasarkan I/O
- Coverage-driven                       - Behavior-driven
- Unit-level                            - Integration / E2E
- Metrik: statement, branch,
  path, cyclomatic complexity
```

> "Whitebox testing — atau structural testing — adalah pengujian yang
> mengharuskan tester paham struktur internal kode. Berbeda dengan
> blackbox yang hanya melihat input-output, di whitebox kita merancang
> test case berdasarkan **control flow graph** dari kode itu sendiri.
> Tujuannya: memastikan setiap jalur logika dilewati minimal sekali."

---

## Slide 3 — Empat Metrik Coverage

| Metrik | Definisi singkat |
|---|---|
| **Statement Coverage** | Tiap baris dieksekusi minimal 1× |
| **Branch Coverage** | Tiap `if/else` ditembus true & false |
| **Function Coverage** | Tiap fungsi pernah dipanggil |
| **Path Coverage** | Tiap jalur independen di CFG dilewati |

> "Untuk mengukur kecukupan pengujian, kami memakai empat metrik standar:
> statement, branch, function, dan path coverage. Yang paling kuat adalah
> **branch coverage**, karena dia memaksa kita menguji kedua sisi setiap
> percabangan logika."

---

## Slide 4 — Tools

```
  +--------------------+
  |   Vitest 2.1.9     |  ← test runner (Jest-compatible)
  +--------------------+
            |
  +--------------------+
  | @vitest/coverage-v8|  ← coverage engine (Node V8 native)
  +--------------------+
            |
  +--------------------+
  |  npm run coverage  |  ← satu perintah, semuanya
  +--------------------+
```

> "Stack pengujiannya: Vitest sebagai test runner — kompatibel dengan
> sintaks Jest tapi jauh lebih cepat dan native ESM. Coverage-nya
> memakai engine V8 langsung dari Node, tanpa instrumentation tambahan.
> Cukup `npm run coverage` untuk run + generate laporan HTML."

---

## Slide 5 — Scope: 5 Modul Pure Function

| Modul | Peran |
|---|---|
| `lib/dss/scoring.ts` | Algoritma rekomendasi (SAW-like) |
| `lib/dss/facility-mapping.ts` | Normalisasi fasilitas |
| `lib/format-price.ts` | Formatter harga (Rp / Jt / M) |
| `lib/booster.ts` | Paket boost properti |
| `lib/midtrans.ts` | Signature webhook pembayaran |

> "Kami memilih lima modul *pure function* — fungsi yang tidak menyentuh
> database, network, atau framework. Ini bukan kebetulan: whitebox
> testing paling efektif pada kode yang bisa diisolasi sepenuhnya. Kode
> yang memanggil DB atau API eksternal lebih cocok untuk **integration
> testing**."

---

## Slide 6 — Studi Kasus: `normalizeBudgetScore`

[Tampilkan source code dari [lib/dss/scoring.ts:7-29](../lib/dss/scoring.ts#L7-L29)]

```ts
function normalizeBudgetScore(price, min, max) {
  if (min == null || max == null) return 0.5;       // (1)
  if (price >= min && price <= max) return 1;       // (2)
  if (price < min) {                                // (3)
    if (min <= 0) return 0;                         // (4)
    return Math.max(0, 1 - (min - price) / min);
  }
  if (max <= 0) return 0;                           // (5)
  return Math.max(0, 1 - (price - max) / max);
}
```

> "Ini fungsi inti algoritma rekomendasi kami. Fungsinya: memberi skor
> antara 0 dan 1 untuk seberapa cocok harga properti dengan budget
> user. Ada **lima titik keputusan** — saya tandai (1) sampai (5). Inilah
> yang akan kita uji secara whitebox."

---

## Slide 7 — Control Flow Graph

```
        [start]
           |
           v
       (min==null v max==null)? --true--> return 0.5    (P1)
           | false
           v
       (price in [min,max])? --true--> return 1         (P2)
           | false
           v
       (price < min)? --true--> (min<=0)? --true--> 0   (P4)
           | false               | false
           |                     v
           |             1 - (min-price)/min            (P3)
           v
       (max<=0)? --true--> return 0                     (P6)
           | false
           v
       1 - (price-max)/max                              (P5)
```

> "Dari source code, kami gambar **Control Flow Graph**. Setiap diamond
> adalah keputusan, setiap kotak adalah aksi. Dari CFG ini kita bisa
> menghitung **cyclomatic complexity**, atau V(G), yaitu jumlah jalur
> independen yang harus diuji."

---

## Slide 8 — V(G) & Tabel Basis Path

```
V(G) = jumlah decision points + 1
     = 5 + 1
     = 6
```

| ID | price | min | max | Cabang ditembus | Expected |
|----|-----|-----|-----|---|----|
| P1 | 5jt | null | 10jt | (1) true → guard null | 0.5 |
| P2 | 5jt | 3jt | 7jt | (2) true → dalam range | 1 |
| P3 | 2jt | 3jt | 7jt | (3) true, (4) false | 0.6667 |
| P4 | -100 | 0 | 7jt | (3) true, (4) true | 0 |
| P5 | 10jt | 3jt | 7jt | (3) false, (5) false | 0.5714 |
| P6 | 5jt | -10jt | 0 | (3) false, (5) true | 0 |

> "Rumus McCabe: V(G) sama dengan jumlah decision point ditambah satu.
> Untuk fungsi ini hasilnya **enam**. Itu artinya kami butuh minimal
> enam test case yang masing-masing menembus jalur unik. Tabel ini
> menunjukkan kombinasi input dan jalur yang dilewatinya. Ditambah
> beberapa boundary case dan equivalence partition, totalnya **11 test
> case** untuk fungsi ini saja."

---

## Slide 9 — Demo Live

[Buka terminal, jalankan urutan ini]

```bash
npm test          # tunjukkan 70 tests pass dalam <1 detik
npm run coverage  # tunjukkan tabel coverage terminal
```

[Buka `coverage/index.html` di browser, klik `lib/dss/scoring.ts.html`]

> "Sekarang demo singkat. [Run `npm test`] — perhatikan 70 test case
> selesai dalam kurang dari satu detik. [Run `npm run coverage`] —
> dan inilah ringkasan coverage-nya. [Buka HTML report] — setiap
> baris yang hijau berarti tercover, kalau ada merah berarti ada jalur
> yang lolos. Kita lihat tidak ada yang merah."

---

## Slide 10 — Hasil Coverage

```
File              | Stmts | Branch | Funcs | Lines
------------------|-------|--------|-------|-------
booster.ts        |  100  |  100   |  100  |  100
format-price.ts   |  100  |  100   |  100  |  100
midtrans.ts       |  31.25|  100   |   40  |  31.25  *
facility-mapping  |  100  |  100   |  100  |  100
scoring.ts        |  100  |  100   |  100  |  100
```

```
70 / 70 tests passed
Branch coverage = 100%  on all in-scope modules
```

> "Hasil akhir: **70 dari 70 test lulus**, branch coverage 100% di semua
> modul scope. `midtrans.ts` statement-nya 31% karena ada fungsi
> `createMidtransSnapTransaction` yang melakukan HTTP call — itu sengaja
> tidak diuji karena masuk wilayah integration test, bukan whitebox."

---

## Slide 11 — Keterbatasan & Tindak Lanjut

| Tidak masuk scope | Tindak lanjut yang disarankan |
|---|---|
| Route handler `app/api/**` | Integration test pakai `supertest` + DB in-memory |
| `createMidtransSnapTransaction` | Contract test pakai `msw` / `nock` |
| React components | UI test pakai Playwright |
| NextAuth callbacks | Test pakai NextAuth test utils |

> "Kami transparan tentang batasan: ada bagian sistem yang **tidak**
> bisa diuji secara whitebox murni — terutama yang menyentuh DB,
> network, atau framework state. Untuk itu kami merekomendasikan
> peningkatan ke level integration testing dan UI testing di iterasi
> berikutnya."

---

## Slide 12 — Kesimpulan

```
✓ 70 test case dirancang dengan basis path testing
✓ 100% branch coverage tercapai
✓ Cyclomatic complexity dijadikan dasar jumlah minimum test
✓ Setup siap untuk CI (npm run coverage)
✓ Dokumentasi lengkap di docs/whitebox-testing.md

  Whitebox testing = bukti bahwa kode kami
  sudah diuji secara terstruktur, bukan asal jalan.
```

> "Kesimpulannya: whitebox testing pada project PAPAN tidak hanya
> 'bikin test'; kami merancangnya berdasarkan analisis struktural —
> CFG, cyclomatic complexity, basis path. Hasilnya jumlah test
> minimal tapi cakupannya 100%. Terima kasih, kami siap menerima
> pertanyaan."

---

## Q&A — Antisipasi Pertanyaan

| Pertanyaan dosen | Jawaban siap-pakai |
|---|---|
| "Kenapa tidak Jest?" | Vitest native ESM + TypeScript tanpa konfigurasi, run paralel, jauh lebih cepat. Sintaks 100% Jest-compatible. |
| "Cyclomatic complexity itu sebenarnya hitungnya bagaimana?" | Tiga cara setara: (1) `E - N + 2` dari CFG, (2) jumlah region tertutup + 1, (3) jumlah decision point + 1. Kami pakai cara ketiga karena paling praktis. |
| "Branch coverage 100% bukan berarti bug-free, kan?" | Betul. Branch coverage menjamin **tidak ada cabang yang lolos diuji**, tapi tidak menjamin tidak ada bug semantik (mis. rumus salah). Itu butuh review + property-based testing. |
| "Kenapa tidak mock Prisma untuk uji route handler?" | Mock DB rentan menutupi bug migration (mis. constraint, foreign key). Kami pilih integration test pakai DB beneran di iterasi berikutnya — lebih jujur. |
| "Berapa lama setup ini?" | < 30 menit setup + ~3 jam menulis 70 test case (dengan basis path table sebagai panduan). |
| "Bisa di-CI?" | Bisa. Tinggal tambahkan step `npm run coverage` di GitHub Actions yang sudah ada — lihat [README.md](../README.md). |

---

## Backup — Demo Fallback (jika internet/laptop lambat)

1. Screenshot terminal `npm run coverage` ✓ (lampirkan di slide 10)
2. Screenshot `coverage/index.html` view utama ✓
3. Screenshot detail satu file (mis. `lib/dss/scoring.ts.html`) ✓
4. Cetak [test-report.md](./test-report.md) untuk dibagikan.
