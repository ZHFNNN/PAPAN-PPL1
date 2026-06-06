# Basis Path — `lib/dss/scoring.ts`

Modul DSS (Decision Support System) — algoritma rekomendasi properti
berbasis *Simple Additive Weighting* (SAW-like). Tiga fungsi normalisasi
dianalisis di sini.

Source: [lib/dss/scoring.ts](../../lib/dss/scoring.ts)
Test: [tests/unit/scoring.test.ts](../../tests/unit/scoring.test.ts)

---

## 1. `normalizeBudgetScore`

### 1.1 Source

[lib/dss/scoring.ts:7-29](../../lib/dss/scoring.ts#L7-L29)

```ts
export function normalizeBudgetScore(
  price: number,
  min: number | null,
  max: number | null,
): number {
  if (min == null || max == null) return 0.5;            // d1
  if (price >= min && price <= max) return 1;            // d2
  if (price < min) {                                     // d3
    if (min <= 0) return 0;                              // d4
    return Math.max(0, 1 - (min - price) / min);
  }
  if (max <= 0) return 0;                                // d5
  return Math.max(0, 1 - (price - max) / max);
}
```

### 1.2 Control Flow Graph

```
            [start]
               |
               v
          d1: (min==null v max==null)? ── yes ──► return 0.5         (P1)
               | no
               v
          d2: (price >= min && price <= max)? ── yes ──► return 1    (P2)
               | no
               v
          d3: (price < min)? ── yes ──► d4: (min <= 0)? ── yes ──► 0 (P4)
               | no                       | no
               |                          v
               |                Math.max(0, 1 - (min-price)/min)     (P3)
               v
          d5: (max <= 0)? ── yes ──► return 0                        (P6)
               | no
               v
          Math.max(0, 1 - (price-max)/max)                           (P5)
```

### 1.3 Cyclomatic Complexity

| Cara | Hitungan |
|---|---|
| Decision point + 1 | 5 if + 1 = **6** |
| E − N + 2 | E=12, N=8 → **6** |

V(G) = **6** → minimal 6 test case untuk basis path coverage.

### 1.4 Tabel Basis Path

| ID | price | min | max | Jalur ditembus | Expected | Test ID |
|----|---|---|---|---|---|---|
| P1a | 5_000_000 | `null` | 10_000_000 | d1 (min null) | 0.5 | `P1: returns 0.5 when min is null` |
| P1b | 5_000_000 | 1_000_000 | `null` | d1 (max null) | 0.5 | `P1b: returns 0.5 when max is null` |
| P2 | 5_000_000 | 3_000_000 | 7_000_000 | d2 inside range | 1 | `P2: returns 1 when price is inside [min, max]` |
| P3 | 2_000_000 | 3_000_000 | 7_000_000 | d3 yes, d4 no | ≈ 0.6667 | `P3: returns partial score when price is below min` |
| P4 | -100 | 0 | 7_000_000 | d3 yes, d4 yes | 0 | `P4: returns 0 when min <= 0 and price < min` |
| P5 | 10_000_000 | 3_000_000 | 7_000_000 | d3 no, d5 no | ≈ 0.5714 | `P5: returns partial score when price is above max` |
| P6 | 5_000_000 | -10_000_000 | 0 | d3 no, d5 yes | 0 | `P6: returns 0 when max <= 0 and price > max` |

### 1.5 Tambahan: Boundary + Equivalence

| Kategori | Input | Expected | Test ID |
|---|---|---|---|
| Boundary (price == min) | 3M / 3M / 7M | 1 | `P2b (boundary)` |
| Boundary (price == max) | 7M / 3M / 7M | 1 | `P2c (boundary)` |
| Equivalence (ekstrim bawah) | -100M / 3M / 7M | 0 (clamp) | `P3 (extreme)` |
| Equivalence (ekstrim atas) | 100M / 3M / 7M | 0 (clamp) | `P5 (extreme)` |

**Total: 11 test case** (≥ V(G) = 6) → branch coverage 100%.

---

## 2. `normalizeLocationScore`

### 2.1 Source

[lib/dss/scoring.ts:31-52](../../lib/dss/scoring.ts#L31-L52)

```ts
export function normalizeLocationScore(
  locationPref: string | null,
  text: string,
): number {
  if (!locationPref || !locationPref.trim()) return 0.5;  // d1
  const tokens = locationPref.toLowerCase().split(",")
                   .map(t => t.trim()).filter(Boolean);
  if (tokens.length === 0) return 0.5;                    // d2
  const hitCount = tokens.filter(t => text.includes(t)).length;  // d3 (predicate)
  return hitCount / tokens.length;
}
```

### 2.2 Cyclomatic Complexity

V(G) = **3** (d1 OR + d2 + filter predicate)

### 2.3 Tabel Basis Path

| ID | locationPref | text | Jalur | Expected | Test ID |
|----|---|---|---|---|---|
| L1 | `null` | `"jakarta selatan"` | d1 (null) | 0.5 | `L1: returns 0.5 when locationPref is null` |
| L1b | `"   "` | `"jakarta selatan"` | d1 (whitespace) | 0.5 | `L1b: returns 0.5 when locationPref is only whitespace` |
| L2 | `",,,"` | `"jakarta selatan"` | d2 (tokens empty after filter) | 0.5 | `L2: returns 0.5 when tokens are all empty after split` |
| L3 | `"jakarta, depok"` | `"rumah di jakarta dan dekat depok"` | predicate true semua | 1 | `L3: returns 1 when all tokens match` |
| L4 | `"jakarta, depok, bekasi"` | `"rumah di jakarta"` | predicate partial | ≈ 0.3333 | `L4: returns partial score when some tokens match` |
| L5 | `"bandung"` | `"rumah di jakarta"` | predicate false semua | 0 | `L5: returns 0 when no tokens match` |
| L6 | `"JAKARTA"` | `"jakarta selatan"` | lowercase normalization | 1 | `L6: location preference is lowercased before matching` |

**Total: 7 test case** → branch coverage 100%.

---

## 3. `normalizeFacilityScore`

### 3.1 Source

[lib/dss/scoring.ts:54-66](../../lib/dss/scoring.ts#L54-L66)

```ts
export function normalizeFacilityScore(
  selectedCodes: string[],
  propertyCodes: string[],
): { score: number; matched: string[] } {
  if (selectedCodes.length === 0) return { score: 0.5, matched: [] };  // d1
  const selectedSet = new Set(selectedCodes);
  const matched = propertyCodes.filter(code => selectedSet.has(code));  // d2 (predicate)
  return {
    score: matched.length / selectedCodes.length,
    matched: Array.from(new Set(matched)),
  };
}
```

### 3.2 Cyclomatic Complexity

V(G) = **2** (d1 + filter predicate)

### 3.3 Tabel Basis Path

| ID | selectedCodes | propertyCodes | Jalur | Expected | Test ID |
|----|---|---|---|---|---|
| F1 | `[]` | `["AC", "WIFI"]` | d1 (empty selected) | `{0.5, []}` | `F1: returns 0.5 with empty matched when user has no selected facilities` |
| F2 | `["AC", "WIFI"]` | `["AC", "WIFI", "DAPUR"]` | predicate true semua | `{1, ["AC", "WIFI"]}` | `F2: returns 1 when all selected codes are matched` |
| F3 | `["AC", "WIFI", "PET_FRIENDLY"]` | `["AC"]` | predicate partial | `{0.333, ["AC"]}` | `F3: returns partial score when some codes match` |
| F4 | `["AC"]` | `["DAPUR", "WIFI"]` | predicate false semua | `{0, []}` | `F4: returns 0 when no code matches` |
| F5 | `["AC"]` | `["AC", "AC"]` | dedup matched | `matched=["AC"]` | `F5: deduplicates matched codes` |

**Total: 5 test case** → branch coverage 100%.

---

## 4. Kontrak `FIXED_CRITERIA_WEIGHTS`

Bukan fungsi, tapi *invariant* yang harus dijaga: jumlah bobot = 1.

```ts
export const FIXED_CRITERIA_WEIGHTS = {
  budget: 0.4,
  location: 0.3,
  facilities: 0.3,
} as const;
```

Test: `FIXED_CRITERIA_WEIGHTS contract > weights sum to 1.0` di
[scoring.test.ts](../../tests/unit/scoring.test.ts) memastikan
`budget + location + facilities ≈ 1`.

---

## 5. Ringkasan Modul

| Fungsi | V(G) | # Test | Branch Coverage |
|---|---:|---:|---:|
| `normalizeBudgetScore` | 6 | 11 | 100% |
| `normalizeLocationScore` | 3 | 7 | 100% |
| `normalizeFacilityScore` | 2 | 5 | 100% |
| Kontrak `FIXED_CRITERIA_WEIGHTS` | — | 1 | — |
| **Total modul** | — | **24** | **100%** |
