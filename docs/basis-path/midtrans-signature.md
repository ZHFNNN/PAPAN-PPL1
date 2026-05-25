# Basis Path — `lib/midtrans.ts` (`getMidtransSignatureKey`)

Generator signature SHA-512 untuk verifikasi webhook Midtrans
(`POST /api/owner/boosts/webhook`). Signature memastikan bahwa
notifikasi pembayaran benar-benar berasal dari Midtrans.

> Hanya `getMidtransSignatureKey` yang masuk scope whitebox.
> `createMidtransSnapTransaction` melakukan `fetch()` ke endpoint
> Midtrans live, sehingga sengaja diabaikan (lihat
> [test-plan.md §3 OS-04](../test-plan.md)).

Source: [lib/midtrans.ts](../../lib/midtrans.ts)
Test: [tests/unit/midtrans-signature.test.ts](../../tests/unit/midtrans-signature.test.ts)

---

## 1. `getMidtransSignatureKey`

### 1.1 Source

[lib/midtrans.ts:33-67](../../lib/midtrans.ts#L33-L67)

```ts
function getMidtransServerKey() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {                                    // d1 (helper)
    throw new Error("MIDTRANS_SERVER_KEY belum dikonfigurasi.");
  }
  return serverKey;
}

export function getMidtransSignatureKey({
  orderId, statusCode, grossAmount,
}: { orderId: string; statusCode: string; grossAmount: string | number; }) {
  const serverKey = getMidtransServerKey();             // throws on d1
  return crypto
    .createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest("hex");
}
```

### 1.2 Control Flow Graph

```
       [start: getMidtransSignatureKey]
                  |
                  v
       getMidtransServerKey() called
                  |
                  v
       d1: process.env.MIDTRANS_SERVER_KEY truthy?
                  |             |
                  no            yes
                  |             |
                  v             v
         throw Error      return serverKey
            (P1)               |
                               v
                  crypto.sha512.update(...).digest("hex")
                               |
                               v
                       return hash hex                  (P2)
```

### 1.3 Cyclomatic Complexity

V(G) = **2** (d1 + 1)

### 1.4 Tabel Basis Path

| ID | Setup | Input | Jalur | Expected | Test ID |
|----|---|---|---|---|---|
| MS-1 | `delete env.MIDTRANS_SERVER_KEY` | sembarang | d1 false → P1 (throw) | throw `/MIDTRANS_SERVER_KEY/` | `throws when MIDTRANS_SERVER_KEY is not set` |
| MS-2 | env = DUMMY | orderId="ORDER-123", status="200", gross="100000" | d1 true → P2 | SHA-512 hex dari concat | `produces SHA-512 hex of concatenated fields` |
| MS-3 | env = DUMMY | input sama 2× | P2 deterministik | hash sama, length 128 | `is deterministic for identical inputs` |
| MS-4 | env = DUMMY | grossAmount `1000` (number) vs `"1000"` (string) | P2 (template literal coerce) | hash identik | `accepts grossAmount as number and produces the same hash as its string form` |
| MS-5 | env = DUMMY | ubah orderId / status / amount satu per satu | P2, sensitivitas input | 4 hash berbeda | `changes when any input changes` |

**Total: 5 test case** (≥ V(G) = 2) → branch coverage 100%.

### 1.5 Test Design Notes

- **Isolasi env**: setiap test pakai `beforeEach` untuk set
  `MIDTRANS_SERVER_KEY = "SB-Mid-server-DUMMYKEY"` dan `afterEach`
  untuk restore — biar tidak bocor ke test lain.
- **Tidak menyentuh secret asli**: dummy key dipakai supaya hash bisa
  diverifikasi independen tanpa membongkar `.env` production.
- **MS-2 (oracle test)**: hash di-recompute pakai `crypto.createHash`
  langsung di test, lalu dibandingkan dengan output fungsi. Ini
  *oracle equivalence test* — kita yakin output benar karena
  spesifikasi Midtrans memang SHA-512(concat).
- **MS-5 (sensitivity test)**: memastikan tidak ada *collision* tak
  sengaja akibat bug truncation/encoding.

---

## 2. Yang Tidak Diuji (dan Mengapa)

| Fungsi | Alasan dilewati |
|---|---|
| `getMidtransServerKey` | Diuji indirect via `getMidtransSignatureKey` (MS-1). |
| `getMidtransBaseUrl` | Hanya membaca env, tidak ada decision selain string ternary — trivial. |
| `getAuthorizationHeader` | Wrapper Base64 tanpa decision. |
| `createMidtransSnapTransaction` | Melakukan `fetch()` ke `https://app.sandbox.midtrans.com` atau production. Akan menyebabkan test bergantung jaringan + dapat memicu transaksi nyata di sandbox account. **Wilayah integration / contract testing.** |

Rekomendasi tindak lanjut: pakai `msw` (Mock Service Worker) untuk
stub HTTP layer, lalu uji `createMidtransSnapTransaction` di
integration test terpisah.

---

## 3. Ringkasan Modul

| Fungsi | V(G) | # Test | Branch Coverage |
|---|---:|---:|---:|
| `getMidtransSignatureKey` | 2 | 5 | 100% |
| `getMidtransServerKey` | 2 | (indirect via MS-1) | 100% |
| Lain-lain (lihat §2) | — | 0 (out of scope) | — |
| **Total modul (scope)** | — | **5** | **100% branch** |

**Catatan**: Statement coverage `lib/midtrans.ts` secara keseluruhan
tetap 31.25% karena `createMidtransSnapTransaction` punya banyak baris
yang tidak di-execute. Ini **diharapkan** dan didokumentasikan di
[test-plan.md §3](../test-plan.md).
