import { describe, expect, it } from "vitest";
import { formatPrice } from "@/lib/format-price";

/**
 * Whitebox tests untuk formatPrice.
 * Strategi: branch coverage + boundary value analysis pada threshold
 * BILLION (1_000_000_000) dan MILLION (1_000_000).
 */

describe("formatPrice — branch & boundary coverage", () => {
  it("returns input as string when value is non-finite (NaN)", () => {
    expect(formatPrice(Number.NaN)).toBe("NaN");
  });

  it("returns input as string when value is Infinity", () => {
    expect(formatPrice(Infinity)).toBe("Infinity");
  });

  it("treats unparseable string as 0 (regex strips all non-digits → empty)", () => {
    // ini bukan jalur NaN: Number("") === 0, jadi 0 ter-format normal
    expect(formatPrice("abc")).toBe("Rp0");
  });

  it("formats 0 as Rp0", () => {
    expect(formatPrice(0)).toBe("Rp0");
  });

  it("formats small positive number with id-ID grouping", () => {
    expect(formatPrice(150_000)).toBe("Rp150.000");
  });

  it("formats negative small number with leading minus", () => {
    expect(formatPrice(-150_000)).toBe("-Rp150.000");
  });

  it("uses 'Jt' suffix at the MILLION threshold", () => {
    expect(formatPrice(1_000_000)).toBe("Rp1 Jt");
  });

  it("uses 'Jt' suffix just below BILLION", () => {
    expect(formatPrice(999_999_999)).toMatch(/Jt$/);
  });

  it("uses 'M' suffix at the BILLION threshold", () => {
    expect(formatPrice(1_000_000_000)).toBe("Rp1 M");
  });

  it("handles negative values above BILLION", () => {
    expect(formatPrice(-2_500_000_000)).toBe("-Rp2.5 M");
  });

  it("truncates decimals without rounding (Jt)", () => {
    // 1.789.000 -> truncated to 1.78, last zero stripped -> "1.78"
    expect(formatPrice(1_789_000)).toBe("Rp1.78 Jt");
  });

  it("strips trailing zeros from decimal part", () => {
    // 1.500.000 -> 1.50 -> trim trailing zero -> "1.5"
    expect(formatPrice(1_500_000)).toBe("Rp1.5 Jt");
  });

  it("returns whole-only when decimal portion is zero", () => {
    expect(formatPrice(3_000_000)).toBe("Rp3 Jt");
  });

  it("parses numeric string input by stripping non-digits", () => {
    expect(formatPrice("Rp 2.500.000")).toBe("Rp2.5 Jt");
  });

  it("ignores fractional part for raw numbers below MILLION", () => {
    expect(formatPrice(150_000.99)).toBe("Rp150.000");
  });
});
