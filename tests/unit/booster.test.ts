import { describe, expect, it } from "vitest";
import {
  BOOST_PACKAGES,
  getBoostEndsAt,
  getBoosterPackage,
  getRemainingDays,
} from "@/lib/booster";

describe("getBoosterPackage — lookup branches", () => {
  it("returns harian package for exact id", () => {
    expect(getBoosterPackage("harian")?.days).toBe(1);
  });

  it("normalises whitespace and casing", () => {
    expect(getBoosterPackage("  Mingguan  ")?.days).toBe(7);
  });

  it("returns null for unknown id", () => {
    expect(getBoosterPackage("tahunan")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(getBoosterPackage("")).toBeNull();
  });

  it("BOOST_PACKAGES contains expected ids", () => {
    const ids = BOOST_PACKAGES.map((p) => p.id).sort();
    expect(ids).toEqual(["bulanan", "harian", "mingguan"]);
  });
});

describe("getBoostEndsAt — date arithmetic", () => {
  it("adds the given number of days to startsAt", () => {
    const start = new Date("2026-01-01T00:00:00.000Z");
    const end = getBoostEndsAt(start, 7);
    expect(end.toISOString()).toBe("2026-01-08T00:00:00.000Z");
  });

  it("does not mutate the original startsAt", () => {
    const start = new Date("2026-01-01T00:00:00.000Z");
    const snapshot = start.toISOString();
    getBoostEndsAt(start, 30);
    expect(start.toISOString()).toBe(snapshot);
  });

  it("handles month rollover correctly", () => {
    const start = new Date("2026-01-31T00:00:00.000Z");
    expect(getBoostEndsAt(start, 1).toISOString()).toBe(
      "2026-02-01T00:00:00.000Z",
    );
  });
});

describe("getRemainingDays — branches", () => {
  it("returns 0 when endDate is in the past", () => {
    const now = new Date("2026-05-25T00:00:00.000Z");
    const end = new Date("2026-05-20T00:00:00.000Z");
    expect(getRemainingDays(end, now)).toBe(0);
  });

  it("returns 0 when endDate equals now (diff === 0)", () => {
    const now = new Date("2026-05-25T00:00:00.000Z");
    expect(getRemainingDays(now, now)).toBe(0);
  });

  it("returns ceil of fractional days", () => {
    const now = new Date("2026-05-25T00:00:00.000Z");
    const end = new Date("2026-05-25T12:00:00.000Z"); // +0.5 day
    expect(getRemainingDays(end, now)).toBe(1);
  });

  it("returns the exact number of whole days", () => {
    const now = new Date("2026-05-25T00:00:00.000Z");
    const end = new Date("2026-06-01T00:00:00.000Z"); // +7 days
    expect(getRemainingDays(end, now)).toBe(7);
  });
});
