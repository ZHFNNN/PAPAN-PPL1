import { prisma } from "@/lib/prisma";
import { PropertyCategory, Role } from "@prisma/client";

const PEAK_SEASON_MONTHS = new Set([5, 6, 7]);
const NOTIFICATION_TYPE = "AUTO_ADVISOR";
const NOTIFICATION_TITLE = "Peluang Memaksimalkan Keuntungan";
const NOTIFICATION_MESSAGE =
  "Saat ini sedang memasuki masa puncak pencarian properti (peak season) dengan permintaan tinggi. Pertimbangkan untuk meninjau kembali harga sewa Anda agar potensi pendapatan bulan ini lebih optimal.";

export async function GET() {
  const now = new Date();
  const month = now.getMonth();

  if (!PEAK_SEASON_MONTHS.has(month)) {
    return Response.json({
      message: "Di luar peak season. Tidak ada notifikasi yang dibuat.",
      created: 0,
    });
  }

  const monthStart = new Date(now.getFullYear(), month, 1);
  const nextMonthStart = new Date(now.getFullYear(), month + 1, 1);

  const owners = await prisma.user.findMany({
    where: {
      role: Role.OWNER,
      properties: {
        some: {
          category: PropertyCategory.KOSAN,
        },
      },
    },
    select: { id: true },
  });

  if (owners.length === 0) {
    return Response.json({
      message: "Tidak ada owner kosan yang ditemukan.",
      created: 0,
    });
  }

  const ownerIds = owners.map((owner) => owner.id);
  const existing = await prisma.notification.findMany({
    where: {
      ownerId: { in: ownerIds },
      type: NOTIFICATION_TYPE,
      createdAt: {
        gte: monthStart,
        lt: nextMonthStart,
      },
    },
    select: { ownerId: true },
  });

  const existingOwnerIds = new Set(existing.map((item) => item.ownerId));
  const ownersToNotify = ownerIds.filter((ownerId) => !existingOwnerIds.has(ownerId));

  if (ownersToNotify.length === 0) {
    return Response.json({
      message: "Notifikasi sudah dibuat untuk semua owner bulan ini.",
      created: 0,
      skipped: ownerIds.length,
    });
  }

  const created = await prisma.notification.createMany({
    data: ownersToNotify.map((ownerId) => ({
      ownerId,
      title: NOTIFICATION_TITLE,
      message: NOTIFICATION_MESSAGE,
      type: NOTIFICATION_TYPE,
    })),
  });

  return Response.json({
    message: "Notifikasi pricing advisor berhasil dibuat.",
    created: created.count,
    skipped: ownerIds.length - ownersToNotify.length,
  });
}
