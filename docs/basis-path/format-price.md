# Basis Path — `lib/format-price.ts`

Formatter harga: angka raw → format "Rp / Jt / M" gaya Indonesia.

Source: [lib/format-price.ts](../../lib/format-price.ts)
Test: [tests/unit/format-price.test.ts](../../tests/unit/format-price.test.ts)

---

## 1. `formatPrice`

### 1.1 Source

[lib/format-price.ts:18-34](../../lib/format-price.ts#L18-L34)

```ts
export function formatPrice(input: number | string): string {
  const numeric = typeof input === 'string'                    // d1 (ternary)
    ? Number(input.replace(/[^0-9-]/g, ''))
    : input;
  if (!Number.isFinite(numeric)) return String(input);          // d2

  const sign = numeric < 0 ? '-' : '';                          // d3
  const absValue = Math.abs(numeric);

  if (absValue >= BILLION) {                                    // d4
    return `${sign}Rp${formatAbbreviated(absValue, BILLION)} M`;
  }
  if (absValue >= MILLION) {                                    // d5
    return `${sign}Rp${formatAbbreviated(absValue, MILLION)} Jt`;
  }

  const whole = Math.trunc(absValue);
  return `${sign}Rp${whole.toLocaleString('id-ID')}`;
}
```

Plus helper `formatAbbreviated` ([lib/format-price.ts:4-16](../../lib/format-price.ts#L4-L16)):

```ts
const formatAbbreviated = (value, unit) => {
  const intValue = Math.trunc(value);
  const whole = Math.trunc(intValue / unit);
  const remainder = intValue - whole * unit;
  const decimalUnit = unit / 100;
  const decimals = Math.trunc(remainder / decimalUnit);

  if (decimals === 0) return String(whole);                      // d6

  const decimalText = String(decimals).padStart(2, '0').replace(/0+$/, '');
  return `${whole}.${decimalText}`;
};
```

### 1.2 Control Flow Graph (gabungan)

```
        [start]
           |
           v
       d1: typeof input === 'string'?
           |        |
           yes      no
           |        |
           v        v
       Number(strip)  input
           \_________/
                v
       d2: !isFinite(numeric)? ── yes ──► return String(input)        (P1)
                | no
                v
       d3: numeric < 0?
                |        |
                yes      no
                |        |
                v        v
              '-'        ''
                \________/
                     v
       d4: absValue >= BILLION? ── yes ──► sign + "Rp" + abbr + " M"  (P2)
                | no
                v
       d5: absValue >= MILLION? ── yes ──► sign + "Rp" + abbr + " Jt" (P3)
                | no
                v
       sign + "Rp" + whole.toLocaleString('id-ID')                    (P4)

  formatAbbreviated:
       d6: decimals === 0? ── yes ──► String(whole)                   (P5)
                | no
                v
       `${whole}.${stripped decimals}`                                (P6)
```

### 1.3 Cyclomatic Complexity

| Fungsi | Decision points | V(G) |
|---|---|---|
| `formatPrice` | 5 (d1, d2, d3, d4, d5) | 6 |
| `formatAbbreviated` | 1 (d6) | 2 |
| **Gabungan modul** | 6 | **7** |

### 1.4 Tabel Basis Path

| ID | Input | Jalur ditembus | Expected | Test ID |
|----|---|---|---|---|
| P1 | `NaN` | d2 (non-finite) | `"NaN"` | `returns input as string when value is non-finite (NaN)` |
| P1b | `Infinity` | d2 (non-finite) | `"Infinity"` | `returns input as string when value is Infinity` |
| P2 | `1_000_000_000` | d4 (>= BILLION) + d6 yes | `"Rp1 M"` | `uses 'M' suffix at the BILLION threshold` |
| P2-neg | `-2_500_000_000` | d3 negative + d4 + d6 no | `"-Rp2.5 M"` | `handles negative values above BILLION` |
| P3 | `1_000_000` | d5 (>= MILLION) + d6 yes | `"Rp1 Jt"` | `uses 'Jt' suffix at the MILLION threshold` |
| P3-boundary | `999_999_999` | d5 (< BILLION) | match `/Jt$/` | `uses 'Jt' suffix just below BILLION` |
| P4 | `0` | d2 no, d3 no, d4 no, d5 no | `"Rp0"` | `formats 0 as Rp0` |
| P4-small | `150_000` | path P4 | `"Rp150.000"` | `formats small positive number with id-ID grouping` |
| P4-neg | `-150_000` | d3 negative + P4 | `"-Rp150.000"` | `formats negative small number with leading minus` |
| P5 | `3_000_000` | d6 yes (decimals == 0) | `"Rp3 Jt"` | `returns whole-only when decimal portion is zero` |
| P6 | `1_500_000` | d6 no, strip trailing 0 | `"Rp1.5 Jt"` | `strips trailing zeros from decimal part` |
| P6b | `1_789_000` | d6 no, truncate | `"Rp1.78 Jt"` | `truncates decimals without rounding (Jt)` |
| string parse | `"Rp 2.500.000"` | d1 string + P3 | `"Rp2.5 Jt"` | `parses numeric string input by stripping non-digits` |
| string un-parseable | `"abc"` | d1 string → Number("") = 0 → P4 | `"Rp0"` | `treats unparseable string as 0 (regex strips all non-digits → empty)` |
| fractional below MILLION | `150_000.99` | trunc oleh `Math.trunc(absValue)` | `"Rp150.000"` | `ignores fractional part for raw numbers below MILLION` |

**Total: 15 test case** (≥ V(G) gabungan = 7) → branch coverage 100%.

### 1.5 Insight Whitebox-only

Test case **string un-parseable** adalah temuan whitebox murni:
membaca source code memperlihatkan bahwa `Number("abc".replace(/[^0-9-]/g, ''))`
menghasilkan `Number("") === 0`, **bukan NaN**. Behavior ini tidak
terlihat dari spec / signature; hanya akan ditemukan jika tester
memahami implementasi internal. Inilah nilai sebenarnya dari whitebox
testing.

---

## 2. Ringkasan Modul

| Fungsi | V(G) | # Test | Branch Coverage |
|---|---:|---:|---:|
| `formatPrice` | 6 | 15 \* | 100% |
| `formatAbbreviated` (helper) | 2 | (dicover lewat `formatPrice`) | 100% |
| **Total modul** | — | **15** | **100%** |

\* Beberapa test sekaligus meng-exercise `formatAbbreviated` karena
ia hanya bisa di-test melalui `formatPrice` (private to module).
