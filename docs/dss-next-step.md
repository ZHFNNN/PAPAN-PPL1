# DSS Step 2 (Implemented)

Tahap ini menambahkan endpoint rekomendasi backend awal:

- Endpoint: `GET /api/recommendations`
- Input: data personalisasi user yang sudah tersimpan
- Output: daftar properti dengan skor rekomendasi + breakdown skor
- Metode: SAW-like weighted scoring versi awal

## Kriteria v1

- `budget` (weight `0.40`)
- `location` (weight `0.25`)
- `facilities` (weight `0.35`)

Total weight = 1.0

## Catatan Implementasi v1

- Belum menggunakan tabel fasilitas relasional.
- Kecocokan fasilitas sementara dihitung dari keyword pada `title` + `description` properti.
- Endpoint ini aman dipakai untuk validasi flow backend dulu.

## Tahap 3 (Implemented)

Normalisasi schema Prisma untuk DSS sudah ditambahkan:

1. Master fasilitas: `Facility`
2. Relasi fasilitas properti: `PropertyFacility`
3. Relasi preferensi fasilitas user: `UserPreferenceFacility`
4. Bobot kriteria per user: `UserCriteriaWeight`
5. Enum kriteria DSS: `DssCriteria`

File terkait:

- `prisma/schema.prisma`
- `prisma/migrations/20260419170000_add_dss_normalized_models/migration.sql`
- `prisma/seed.ts` (seed default facility master)

## Tahap 4 (Implemented)

Sinkronisasi endpoint API ke tabel relasional sudah dilakukan:

1. `POST /api/personalisasi` sekarang menyimpan preferensi fasilitas user ke `UserPreferenceFacility`.
2. `POST /api/owner/properties` sekarang menyimpan fasilitas properti ke `PropertyFacility`.
3. `PATCH /api/owner/properties/[id]` sekarang dapat mengganti fasilitas properti via `PropertyFacility`.
4. `GET /api/recommendations` sekarang menghitung skor fasilitas dari relasi tabel (dengan fallback booleans lama agar tetap kompatibel).

File terkait:

- `app/api/personalisasi/route.ts`
- `app/api/owner/properties/route.ts`
- `app/api/owner/properties/[id]/route.ts`
- `app/api/recommendations/route.ts`
- `lib/dss/facility-mapping.ts`

## Rencana Tahap 5 (Setelah Konfirmasi)

Bobot rekomendasi sekarang dikunci di backend agar alurnya tetap sederhana dan adil:

- Budget: `0.4`
- Location: `0.3`
- Facilities: `0.3`

Gender tetap disimpan di personalisasi user, tetapi tidak dijadikan bobot utama supaya hasil ranking fokus ke preferensi properti yang paling relevan.

Agar hasil DSS lebih akurat dan siap scale:

1. Tambah field data properti yang mendukung location scoring yang lebih akurat (bukan dari title/description saja).
2. Integrasi booster sebagai komponen skor terpisah (misalnya `boosterScore`) yang hanya mempengaruhi ranking akhir, bukan menggantikan kecocokan user.
3. Kalau nanti dibutuhkan, bobot fixed bisa ditinjau ulang berdasarkan uji user, bukan diubah oleh user.

Dengan desain ini, query filter + ranking akan lebih robust daripada format array/string tunggal di satu kolom.
