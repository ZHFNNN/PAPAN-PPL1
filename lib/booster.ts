export type BoosterPackageId = "harian" | "mingguan" | "bulanan";

export type BoosterPackage = {
  id: BoosterPackageId;
  title: string;
  label: string;
  days: number;
  price: number;
  features: string[];
  highlighted?: boolean;
};

export const BOOST_PACKAGES: BoosterPackage[] = [
  {
    id: "harian",
    title: "Paket Harian",
    label: "Harian",
    days: 1,
    price: 20000,
    features: [
      "Tampil di halaman utama",
      "Badge Booster emas",
      "Prioritas dalam pencarian",
      "Highlight visual khusus",
    ],
  },
  {
    id: "mingguan",
    title: "Paket Mingguan",
    label: "Mingguan",
    days: 7,
    price: 100000,
    highlighted: true,
    features: [
      "Tampil di halaman utama",
      "Badge Booster emas",
      "Prioritas dalam pencarian",
      "Highlight visual khusus",
      "Email notifikasi views",
    ],
  },
  {
    id: "bulanan",
    title: "Paket Bulanan",
    label: "Bulanan",
    days: 30,
    price: 300000,
    features: [
      "Tampil di halaman utama",
      "Badge Booster emas",
      "Prioritas dalam pencarian",
      "Highlight visual khusus",
      "Email notifikasi views",
      "Analitik mendalam",
      "Support prioritas",
    ],
  },
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