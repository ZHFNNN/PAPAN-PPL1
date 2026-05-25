import { describe, expect, it } from "vitest";
import {
  PERSONALIZATION_LABEL_TO_CODE,
  inferFacilityCode,
  personalizationBooleanCodes,
  resolveFacilityCodes,
} from "@/lib/dss/facility-mapping";

describe("inferFacilityCode — branch coverage", () => {
  it("returns null for empty string", () => {
    expect(inferFacilityCode("")).toBeNull();
  });

  it("returns null for whitespace-only string", () => {
    expect(inferFacilityCode("   ")).toBeNull();
  });

  it("hits the direct label table", () => {
    for (const [label, code] of Object.entries(PERSONALIZATION_LABEL_TO_CODE)) {
      expect(inferFacilityCode(label)).toBe(code);
    }
  });

  it("returns uppercase code when input is already a valid code-like string", () => {
    expect(inferFacilityCode("kamar_mandi_dalam")).toBe("KAMAR_MANDI_DALAM");
  });

  it("matches via NORMALIZED_TEXT_TO_CODE patterns (single keyword)", () => {
    expect(inferFacilityCode("dekat halte busway")).toBe("DEKAT_TRANSPORTASI");
  });

  it("matches synonyms (carport -> PARKIR_MOBIL)", () => {
    expect(inferFacilityCode("ada carport luas")).toBe("PARKIR_MOBIL");
  });

  it("matches case-insensitively", () => {
    expect(inferFacilityCode("Air Conditioner")).toBe("AC");
  });

  it("returns null when nothing matches", () => {
    expect(inferFacilityCode("kolam renang")).toBeNull();
  });
});

describe("resolveFacilityCodes — set semantics", () => {
  it("returns empty array for empty input", () => {
    expect(resolveFacilityCodes([])).toEqual([]);
  });

  it("deduplicates resolved codes", () => {
    const result = resolveFacilityCodes(["AC", "Air Conditioner", "AC"]);
    expect(result).toEqual(["AC"]);
  });

  it("skips entries that cannot be resolved", () => {
    const result = resolveFacilityCodes(["Furnished", "kolam renang"]);
    expect(result).toEqual(["FURNISHED"]);
  });
});

describe("personalizationBooleanCodes — flag mapping", () => {
  it("returns empty array when all flags are false", () => {
    expect(
      personalizationBooleanCodes({
        prefFurnished: false,
        prefUnfurnished: false,
        prefPetFriendly: false,
        prefParkirMobil: false,
        prefAc: false,
        prefWaterHeater: false,
        prefDekatTransportasi: false,
      }),
    ).toEqual([]);
  });

  it("returns all codes when all flags are true (and preserves declared order)", () => {
    expect(
      personalizationBooleanCodes({
        prefFurnished: true,
        prefUnfurnished: true,
        prefPetFriendly: true,
        prefParkirMobil: true,
        prefAc: true,
        prefWaterHeater: true,
        prefDekatTransportasi: true,
      }),
    ).toEqual([
      "FURNISHED",
      "UNFURNISHED",
      "PET_FRIENDLY",
      "PARKIR_MOBIL",
      "AC",
      "WATER_HEATER",
      "DEKAT_TRANSPORTASI",
    ]);
  });

  it("emits only the enabled subset", () => {
    expect(
      personalizationBooleanCodes({
        prefFurnished: false,
        prefUnfurnished: false,
        prefPetFriendly: true,
        prefParkirMobil: false,
        prefAc: true,
        prefWaterHeater: false,
        prefDekatTransportasi: false,
      }),
    ).toEqual(["PET_FRIENDLY", "AC"]);
  });
});
