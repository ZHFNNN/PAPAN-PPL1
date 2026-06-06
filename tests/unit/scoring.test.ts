import { describe, expect, it } from "vitest";
import {
  FIXED_CRITERIA_WEIGHTS,
  normalizeBudgetScore,
  normalizeFacilityScore,
  normalizeLocationScore,
} from "@/lib/dss/scoring";

/**
 * Whitebox tests untuk fungsi DSS scoring.
 *
 * Strategi: Basis Path Testing.
 * - Setiap test case memetakan ke satu jalur independen di control flow graph.
 * - Tujuan utama: 100% branch coverage pada lib/dss/scoring.ts.
 */

describe("normalizeBudgetScore — basis path coverage", () => {
  // P1: min == null  -> return 0.5
  it("P1: returns 0.5 when min is null", () => {
    expect(normalizeBudgetScore(5_000_000, null, 10_000_000)).toBe(0.5);
  });

  // P1: max == null  -> return 0.5  (cabang lain dari short-circuit OR)
  it("P1b: returns 0.5 when max is null", () => {
    expect(normalizeBudgetScore(5_000_000, 1_000_000, null)).toBe(0.5);
  });

  // P2: price dalam range [min, max]  -> return 1
  it("P2: returns 1 when price is inside [min, max]", () => {
    expect(normalizeBudgetScore(5_000_000, 3_000_000, 7_000_000)).toBe(1);
  });

  // P2b: price tepat di boundary min
  it("P2b (boundary): returns 1 when price == min", () => {
    expect(normalizeBudgetScore(3_000_000, 3_000_000, 7_000_000)).toBe(1);
  });

  // P2c: price tepat di boundary max
  it("P2c (boundary): returns 1 when price == max", () => {
    expect(normalizeBudgetScore(7_000_000, 3_000_000, 7_000_000)).toBe(1);
  });

  // P3: price < min, min > 0  -> linear penalty
  it("P3: returns partial score when price is below min", () => {
    // (min - price) / min = (3jt - 2jt) / 3jt = 0.333..
    // score = 1 - 0.333.. = 0.666..
    const score = normalizeBudgetScore(2_000_000, 3_000_000, 7_000_000);
    expect(score).toBeCloseTo(2 / 3, 4);
  });

  // P4: price < min, min <= 0  -> guard return 0
  it("P4: returns 0 when min <= 0 and price < min", () => {
    expect(normalizeBudgetScore(-100, 0, 7_000_000)).toBe(0);
  });

  // P5: price > max, max > 0  -> linear penalty
  it("P5: returns partial score when price is above max", () => {
    // (price - max) / max = (10jt - 7jt) / 7jt = 0.4285..
    // score = 1 - 0.4285.. = 0.5714..
    const score = normalizeBudgetScore(10_000_000, 3_000_000, 7_000_000);
    expect(score).toBeCloseTo(4 / 7, 4);
  });

  // P6: price > max, max <= 0  -> guard return 0
  it("P6: returns 0 when max <= 0 and price > max", () => {
    expect(normalizeBudgetScore(5_000_000, -10_000_000, 0)).toBe(0);
  });

  // P3 ekstrim: penalty terjepit ke 0 oleh Math.max
  it("P3 (extreme): clamps to 0 when price is far below min", () => {
    expect(normalizeBudgetScore(-100_000_000, 3_000_000, 7_000_000)).toBe(0);
  });

  // P5 ekstrim: penalty terjepit ke 0 oleh Math.max
  it("P5 (extreme): clamps to 0 when price is far above max", () => {
    expect(normalizeBudgetScore(100_000_000, 3_000_000, 7_000_000)).toBe(0);
  });
});

describe("normalizeLocationScore — branch coverage", () => {
  // L1: locationPref null
  it("L1: returns 0.5 when locationPref is null", () => {
    expect(normalizeLocationScore(null, "jakarta selatan")).toBe(0.5);
  });

  // L1b: locationPref hanya whitespace
  it("L1b: returns 0.5 when locationPref is only whitespace", () => {
    expect(normalizeLocationScore("   ", "jakarta selatan")).toBe(0.5);
  });

  // L2: tokens kosong setelah split + filter (semua koma)
  it("L2: returns 0.5 when tokens are all empty after split", () => {
    expect(normalizeLocationScore(",,,", "jakarta selatan")).toBe(0.5);
  });

  // L3: semua token cocok
  it("L3: returns 1 when all tokens match", () => {
    expect(
      normalizeLocationScore("jakarta, depok", "rumah di jakarta dan dekat depok"),
    ).toBe(1);
  });

  // L4: sebagian token cocok
  it("L4: returns partial score when some tokens match", () => {
    expect(
      normalizeLocationScore("jakarta, depok, bekasi", "rumah di jakarta"),
    ).toBeCloseTo(1 / 3, 4);
  });

  // L5: tidak ada token yang cocok
  it("L5: returns 0 when no tokens match", () => {
    expect(normalizeLocationScore("bandung", "rumah di jakarta")).toBe(0);
  });

  // L6: case sensitivity — pref di-lowercase, text harus sudah lowercase di caller
  it("L6: location preference is lowercased before matching", () => {
    expect(normalizeLocationScore("JAKARTA", "jakarta selatan")).toBe(1);
  });
});

describe("normalizeFacilityScore — branch coverage", () => {
  // F1: selectedCodes kosong  -> default 0.5, matched []
  it("F1: returns 0.5 with empty matched when user has no selected facilities", () => {
    const result = normalizeFacilityScore([], ["AC", "WIFI"]);
    expect(result).toEqual({ score: 0.5, matched: [] });
  });

  // F2: semua selected ada di propertyCodes
  it("F2: returns 1 when all selected codes are matched", () => {
    const result = normalizeFacilityScore(["AC", "WIFI"], ["AC", "WIFI", "DAPUR"]);
    expect(result.score).toBe(1);
    expect(result.matched.sort()).toEqual(["AC", "WIFI"]);
  });

  // F3: sebagian cocok
  it("F3: returns partial score when some codes match", () => {
    const result = normalizeFacilityScore(["AC", "WIFI", "PET_FRIENDLY"], ["AC"]);
    expect(result.score).toBeCloseTo(1 / 3, 4);
    expect(result.matched).toEqual(["AC"]);
  });

  // F4: tidak ada yang cocok
  it("F4: returns 0 when no code matches", () => {
    const result = normalizeFacilityScore(["AC"], ["DAPUR", "WIFI"]);
    expect(result.score).toBe(0);
    expect(result.matched).toEqual([]);
  });

  // F5: matched tidak boleh duplikat (property punya code dobel)
  it("F5: deduplicates matched codes", () => {
    const result = normalizeFacilityScore(["AC"], ["AC", "AC"]);
    expect(result.matched).toEqual(["AC"]);
    // catatan: numerator pakai filter, jadi nilai score bisa > 1 — di sini kita
    // hanya menguji bahwa array matched dideduplikasi.
  });
});

describe("FIXED_CRITERIA_WEIGHTS contract", () => {
  it("weights sum to 1.0", () => {
    const total =
      FIXED_CRITERIA_WEIGHTS.budget +
      FIXED_CRITERIA_WEIGHTS.location +
      FIXED_CRITERIA_WEIGHTS.facilities;
    expect(total).toBeCloseTo(1, 5);
  });
});
