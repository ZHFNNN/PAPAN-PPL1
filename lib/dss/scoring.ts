export const FIXED_CRITERIA_WEIGHTS = {
  budget: 0.4,
  location: 0.3,
  facilities: 0.3,
} as const;

export function normalizeBudgetScore(
  price: number,
  min: number | null,
  max: number | null,
): number {
  if (min == null || max == null) {
    return 0.5;
  }

  if (price >= min && price <= max) {
    return 1;
  }

  if (price < min) {
    if (min <= 0) return 0;
    return Math.max(0, 1 - (min - price) / min);
  }

  if (max <= 0) return 0;
  return Math.max(0, 1 - (price - max) / max);
}

export function normalizeLocationScore(
  locationPref: string | null,
  text: string,
): number {
  if (!locationPref || !locationPref.trim()) {
    return 0.5;
  }

  const tokens = locationPref
    .toLowerCase()
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);

  if (tokens.length === 0) {
    return 0.5;
  }

  const hitCount = tokens.filter((token) => text.includes(token)).length;
  return hitCount / tokens.length;
}

export function normalizeFacilityScore(
  selectedCodes: string[],
  propertyCodes: string[],
): { score: number; matched: string[] } {
  if (selectedCodes.length === 0) {
    return { score: 0.5, matched: [] };
  }

  const selectedSet = new Set(selectedCodes);
  const matched = propertyCodes.filter((code) => selectedSet.has(code));

  return {
    score: matched.length / selectedCodes.length,
    matched: Array.from(new Set(matched)),
  };
}
