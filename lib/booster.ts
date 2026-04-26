export type BoosterPackageId = "basic" | "premium" | "featured";

export type BoosterPackage = {
  id: BoosterPackageId;
  title: string;
  days: number;
  price: number;
};

export const BOOST_PACKAGES: BoosterPackage[] = [
  { id: "basic", title: "Basic", days: 7, price: 25000 },
  { id: "premium", title: "Premium", days: 14, price: 55000 },
  { id: "featured", title: "Featured", days: 30, price: 99000 },
];

export function getBoosterPackage(packageId: string): BoosterPackage | null {
  const normalized = packageId.trim().toLowerCase();
  return BOOST_PACKAGES.find((item) => item.id === normalized) ?? null;
}

export function getBoostEndsAt(startsAt: Date, days: number): Date {
  const result = new Date(startsAt);
  result.setDate(result.getDate() + days);
  return result;
}

export function getRemainingDays(endDate: Date, now = new Date()): number {
  const diff = endDate.getTime() - now.getTime();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
}