export const PERSONALIZATION_LABEL_TO_CODE: Record<string, string> = {
  Furnished: "FURNISHED",
  Unfurnished: "UNFURNISHED",
  "Pet-friendly": "PET_FRIENDLY",
  "Parkir Mobil": "PARKIR_MOBIL",
  AC: "AC",
  "Water Heater": "WATER_HEATER",
  "Dekat transportasi umum": "DEKAT_TRANSPORTASI",
  WiFi: "WIFI",
};

const NORMALIZED_TEXT_TO_CODE: Array<{ patterns: string[]; code: string }> = [
  { patterns: ["furnished"], code: "FURNISHED" },
  { patterns: ["unfurnished"], code: "UNFURNISHED" },
  { patterns: ["pet-friendly", "pet friendly"], code: "PET_FRIENDLY" },
  { patterns: ["parkir mobil", "carport", "garasi"], code: "PARKIR_MOBIL" },
  { patterns: ["ac", "air conditioner"], code: "AC" },
  { patterns: ["water heater", "pemanas air"], code: "WATER_HEATER" },
  { patterns: ["dekat transportasi", "transportasi", "stasiun", "halte", "terminal", "mrt", "krl"], code: "DEKAT_TRANSPORTASI" },
  { patterns: ["wifi", "wi-fi", "internet"], code: "WIFI" },
  { patterns: ["kamar mandi dalam"], code: "KAMAR_MANDI_DALAM" },
  { patterns: ["dapur"], code: "DAPUR" },
];

function toCodeDirect(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (PERSONALIZATION_LABEL_TO_CODE[trimmed]) {
    return PERSONALIZATION_LABEL_TO_CODE[trimmed];
  }

  const upper = trimmed.toUpperCase();
  if (/^[A-Z0-9_]+$/.test(upper)) {
    return upper;
  }

  return null;
}

export function inferFacilityCode(raw: string): string | null {
  const direct = toCodeDirect(raw);
  if (direct) return direct;

  const text = raw.toLowerCase().trim();
  if (!text) return null;

  const matched = NORMALIZED_TEXT_TO_CODE.find((entry) =>
    entry.patterns.some((pattern) => text.includes(pattern))
  );

  return matched?.code ?? null;
}

export function resolveFacilityCodes(items: string[]): string[] {
  const set = new Set<string>();

  for (const item of items) {
    const code = inferFacilityCode(item);
    if (code) {
      set.add(code);
    }
  }

  return Array.from(set);
}

export function personalizationBooleanCodes(flags: {
  prefFurnished: boolean;
  prefUnfurnished: boolean;
  prefPetFriendly: boolean;
  prefParkirMobil: boolean;
  prefAc: boolean;
  prefWaterHeater: boolean;
  prefDekatTransportasi: boolean;
}): string[] {
  const codes: string[] = [];

  if (flags.prefFurnished) codes.push("FURNISHED");
  if (flags.prefUnfurnished) codes.push("UNFURNISHED");
  if (flags.prefPetFriendly) codes.push("PET_FRIENDLY");
  if (flags.prefParkirMobil) codes.push("PARKIR_MOBIL");
  if (flags.prefAc) codes.push("AC");
  if (flags.prefWaterHeater) codes.push("WATER_HEATER");
  if (flags.prefDekatTransportasi) codes.push("DEKAT_TRANSPORTASI");

  return codes;
}
