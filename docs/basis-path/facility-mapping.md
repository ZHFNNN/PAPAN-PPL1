# Basis Path — `lib/dss/facility-mapping.ts`

Mapping nama fasilitas (yang diketik user) → kode internal (yang
dipakai DSS). Berisi 4 fungsi: `toCodeDirect` (helper internal),
`inferFacilityCode`, `resolveFacilityCodes`, `personalizationBooleanCodes`.

Source: [lib/dss/facility-mapping.ts](../../lib/dss/facility-mapping.ts)
Test: [tests/unit/facility-mapping.test.ts](../../tests/unit/facility-mapping.test.ts)

---

## 1. `toCodeDirect` (helper internal)

### 1.1 Source

[lib/dss/facility-mapping.ts:25-39](../../lib/dss/facility-mapping.ts#L25-L39)

```ts
function toCodeDirect(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;                                  // d1

  if (PERSONALIZATION_LABEL_TO_CODE[trimmed]) {               // d2
    return PERSONALIZATION_LABEL_TO_CODE[trimmed];
  }

  const upper = trimmed.toUpperCase();
  if (/^[A-Z0-9_]+$/.test(upper)) {                           // d3
    return upper;
  }

  return null;
}
```

### 1.2 Cyclomatic Complexity

V(G) = **4** (3 if + 1)

Fungsi ini tidak di-export → diuji secara *indirect* lewat `inferFacilityCode`.

---

## 2. `inferFacilityCode`

### 2.1 Source

[lib/dss/facility-mapping.ts:41-53](../../lib/dss/facility-mapping.ts#L41-L53)

```ts
export function inferFacilityCode(raw: string): string | null {
  const direct = toCodeDirect(raw);
  if (direct) return direct;                                  // d1

  const text = raw.toLowerCase().trim();
  if (!text) return null;                                     // d2

  const matched = NORMALIZED_TEXT_TO_CODE.find((entry) =>
    entry.patterns.some((pattern) => text.includes(pattern))  // d3 (some predicate)
  );                                                          // d4 (find predicate)

  return matched?.code ?? null;                               // d5 (?.) + d6 (??)
}
```

### 2.2 Control Flow Graph (gabungan dengan `toCodeDirect`)

```
       [start: inferFacilityCode(raw)]
                  |
                  v
       (toCodeDirect path)
       trimmed empty? ── yes ──► return null            (P1: direct returns null)
              | no
              v
       label table hit? ── yes ──► return label code    (P2: direct returns code)
              | no
              v
       regex /^[A-Z0-9_]+$/? ── yes ──► return upper    (P3: direct returns upper)
              | no
              v
       direct === null
              |
              v
       d1: direct truthy? ── yes ──► return direct      (jalur ditembus P2/P3)
              | no
              v
       text = raw.toLowerCase().trim()
              |
              v
       d2: !text? ── yes ──► return null                (P4)
              | no
              v
       d3+d4: ∃ entry, ∃ pattern, text.includes(pattern)?
              |              |
              yes            no
              |              |
              v              v
       return entry.code  return null     (P5)         (P6)
```

### 2.3 Cyclomatic Complexity

V(G) = **6** untuk gabungan `inferFacilityCode` + jalur dari `toCodeDirect`
yang dia panggil.

### 2.4 Tabel Basis Path

| ID | Input | Jalur ditembus | Expected | Test ID |
|----|---|---|---|---|
| I-1 | `""` | toCodeDirect P1 → ... → P4 | `null` | `returns null for empty string` |
| I-2 | `"   "` | sama (trimmed empty) | `null` | `returns null for whitespace-only string` |
| I-3 | `"Furnished"` | toCodeDirect P2 (label hit) | `"FURNISHED"` | `hits the direct label table` |
| I-4 | `"kamar_mandi_dalam"` | toCodeDirect P3 (regex) | `"KAMAR_MANDI_DALAM"` | `returns uppercase code when input is already a valid code-like string` |
| I-5 | `"dekat halte busway"` | direct null → d3+d4 yes (pattern "halte") | `"DEKAT_TRANSPORTASI"` | `matches via NORMALIZED_TEXT_TO_CODE patterns (single keyword)` |
| I-6 | `"ada carport luas"` | direct null → pattern "carport" | `"PARKIR_MOBIL"` | `matches synonyms (carport -> PARKIR_MOBIL)` |
| I-7 | `"Air Conditioner"` | direct null (lowercase tidak masuk label) → pattern "air conditioner" | `"AC"` | `matches case-insensitively` |
| I-8 | `"kolam renang"` | direct null → no match | `null` | `returns null when nothing matches` |

**Total: 8 test case** (≥ V(G) = 6) → branch coverage 100%.

---

## 3. `resolveFacilityCodes`

### 3.1 Source

[lib/dss/facility-mapping.ts:55-66](../../lib/dss/facility-mapping.ts#L55-L66)

```ts
export function resolveFacilityCodes(items: string[]): string[] {
  const set = new Set<string>();
  for (const item of items) {                       // d1 (loop)
    const code = inferFacilityCode(item);
    if (code) {                                     // d2
      set.add(code);
    }
  }
  return Array.from(set);
}
```

### 3.2 Cyclomatic Complexity

V(G) = **3** (loop + if + 1)

### 3.3 Tabel Basis Path

| ID | Input | Jalur | Expected | Test ID |
|----|---|---|---|---|
| R-1 | `[]` | loop tidak masuk | `[]` | `returns empty array for empty input` |
| R-2 | `["AC", "Air Conditioner", "AC"]` | loop iterate 3×, semua code, dedup by Set | `["AC"]` | `deduplicates resolved codes` |
| R-3 | `["Furnished", "kolam renang"]` | loop iterate 2×, satu null (d2 false), satu code (d2 true) | `["FURNISHED"]` | `skips entries that cannot be resolved` |

---

## 4. `personalizationBooleanCodes`

### 4.1 Source

[lib/dss/facility-mapping.ts:68-88](../../lib/dss/facility-mapping.ts#L68-L88)

```ts
export function personalizationBooleanCodes(flags: {...}): string[] {
  const codes: string[] = [];
  if (flags.prefFurnished) codes.push("FURNISHED");         // d1
  if (flags.prefUnfurnished) codes.push("UNFURNISHED");     // d2
  if (flags.prefPetFriendly) codes.push("PET_FRIENDLY");    // d3
  if (flags.prefParkirMobil) codes.push("PARKIR_MOBIL");    // d4
  if (flags.prefAc) codes.push("AC");                       // d5
  if (flags.prefWaterHeater) codes.push("WATER_HEATER");    // d6
  if (flags.prefDekatTransportasi) codes.push("DEKAT_TRANSPORTASI"); // d7
  return codes;
}
```

### 4.2 Cyclomatic Complexity

V(G) = **8** (7 independent if + 1)

### 4.3 Tabel Basis Path (terkonsolidasi)

Tujuh `if` independen artinya kombinasi penuhnya = 2⁷ = 128. Kita
tidak butuh semua — basis path coverage hanya butuh **8** test case
(V(G)) yang menutupi setiap branch true/false sekali. Kita pakai
**3 test ringkas** yang efisien mencover semuanya:

| ID | Input flags | Jalur ditembus | Expected | Test ID |
|----|---|---|---|---|
| PBC-1 | semua `false` | semua d1..d7 → no-push | `[]` | `returns empty array when all flags are false` |
| PBC-2 | semua `true` | semua d1..d7 → push (preserve order) | `["FURNISHED", "UNFURNISHED", "PET_FRIENDLY", "PARKIR_MOBIL", "AC", "WATER_HEATER", "DEKAT_TRANSPORTASI"]` | `returns all codes when all flags are true (and preserves declared order)` |
| PBC-3 | hanya `prefPetFriendly` & `prefAc` true | mix true/false | `["PET_FRIENDLY", "AC"]` | `emits only the enabled subset` |

3 test ini **cukup untuk 100% branch coverage**: tiap `if` di-cover
true (oleh PBC-2 / PBC-3) dan false (oleh PBC-1 / PBC-3). Tidak perlu
seluruh 128 kombinasi karena tidak ada interaksi antar flag.

---

## 5. Ringkasan Modul

| Fungsi | V(G) | # Test | Branch Coverage |
|---|---:|---:|---:|
| `toCodeDirect` (helper) | 4 | (cover indirect via inferFacilityCode) | 100% |
| `inferFacilityCode` | 6 | 8 | 100% |
| `resolveFacilityCodes` | 3 | 3 | 100% |
| `personalizationBooleanCodes` | 8 | 3 \* | 100% |
| **Total modul** | — | **14** | **100%** |

\* Lihat penjelasan §4.3 — 3 test cukup karena flag-flag independen.
Ini contoh **optimasi whitebox**: pakai analisis struktur untuk
mengurangi jumlah test dari 128 jadi 3 tanpa kehilangan coverage.
