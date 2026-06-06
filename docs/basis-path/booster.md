# Basis Path — `lib/booster.ts`

Logika paket *boost* properti: katalog paket, perhitungan tanggal
expiry, dan sisa hari aktif.

Source: [lib/booster.ts](../../lib/booster.ts)
Test: [tests/unit/booster.test.ts](../../tests/unit/booster.test.ts)

---

## 1. `getBoosterPackage`

### 1.1 Source

[lib/booster.ts:60-63](../../lib/booster.ts#L60-L63)

```ts
export function getBoosterPackage(packageId: string): BoosterPackage | null {
  const normalized = packageId.trim().toLowerCase();
  return BOOST_PACKAGES.find((item) => item.id === normalized) ?? null;  // d1 (predicate) + d2 (??)
}
```

### 1.2 Control Flow Graph

```
       [start]
          |
          v
       normalize = packageId.trim().toLowerCase()
          |
          v
       d1: ∃ item ∈ BOOST_PACKAGES, item.id === normalized?
          |              |
          yes            no
          |              |
          v              v
       return item    return null     (d2 → null)
          (P1)            (P2)
```

### 1.3 Cyclomatic Complexity

V(G) = **2** (predicate + nullish-coalescing)

### 1.4 Tabel Basis Path

| ID | Input | Jalur | Expected | Test ID |
|----|---|---|---|---|
| B1-1 | `"harian"` | P1 | package days=1 | `returns harian package for exact id` |
| B1-2 | `"  Mingguan  "` | trim + lowercase → P1 | package days=7 | `normalises whitespace and casing` |
| B1-3 | `"tahunan"` | P2 (not found) | `null` | `returns null for unknown id` |
| B1-4 | `""` | trim → "" → P2 | `null` | `returns null for empty string` |

Plus *contract test* terhadap konstanta `BOOST_PACKAGES`:
`BOOST_PACKAGES contains expected ids` memastikan tiga id yang
diiklankan (`harian`, `mingguan`, `bulanan`) memang ada.

---

## 2. `getBoostEndsAt`

### 2.1 Source

[lib/booster.ts:65-69](../../lib/booster.ts#L65-L69)

```ts
export function getBoostEndsAt(startsAt: Date, days: number): Date {
  const result = new Date(startsAt);
  result.setDate(result.getDate() + days);
  return result;
}
```

### 2.2 Cyclomatic Complexity

V(G) = **1** (tidak ada decision point — straight-line code).

### 2.3 Tabel Test (behavioral)

Karena V(G)=1, basis path hanya 1. Test tambahan dirancang dari
**equivalence partitioning** + **side-effect freedom**:

| ID | Input | Verifikasi | Test ID |
|----|---|---|---|
| B2-1 | start = 2026-01-01, days = 7 | end == 2026-01-08 | `adds the given number of days to startsAt` |
| B2-2 | sama | input `startsAt` tidak berubah (immutability) | `does not mutate the original startsAt` |
| B2-3 | start = 2026-01-31, days = 1 | end == 2026-02-01 (month rollover) | `handles month rollover correctly` |

---

## 3. `getRemainingDays`

### 3.1 Source

[lib/booster.ts:71-75](../../lib/booster.ts#L71-L75)

```ts
export function getRemainingDays(endDate: Date, now = new Date()): number {
  const diff = endDate.getTime() - now.getTime();
  if (diff <= 0) return 0;                          // d1
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
}
```

### 3.2 Control Flow Graph

```
       [start]
          |
          v
       diff = endDate - now
          |
          v
       d1: diff <= 0? ── yes ──► return 0     (P1)
          | no
          v
       return ceil(diff / 86_400_000)         (P2)
```

### 3.3 Cyclomatic Complexity

V(G) = **2**

### 3.4 Tabel Basis Path

| ID | now | endDate | Jalur | Expected | Test ID |
|----|---|---|---|---|---|
| B3-1 | 2026-05-25 | 2026-05-20 | P1 (past) | 0 | `returns 0 when endDate is in the past` |
| B3-2 | 2026-05-25 | 2026-05-25 | P1 (boundary diff == 0) | 0 | `returns 0 when endDate equals now (diff === 0)` |
| B3-3 | 2026-05-25 00:00 | 2026-05-25 12:00 | P2 (ceil fractional) | 1 | `returns ceil of fractional days` |
| B3-4 | 2026-05-25 | 2026-06-01 | P2 (whole) | 7 | `returns the exact number of whole days` |

---

## 4. Ringkasan Modul

| Fungsi | V(G) | # Test | Branch Coverage |
|---|---:|---:|---:|
| `getBoosterPackage` | 2 | 4 | 100% |
| `getBoostEndsAt` | 1 | 3 | 100% |
| `getRemainingDays` | 2 | 4 | 100% |
| Kontrak `BOOST_PACKAGES` | — | 1 | — |
| **Total modul** | — | **12** | **100%** |
