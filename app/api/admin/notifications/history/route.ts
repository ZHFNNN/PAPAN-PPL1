import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-user';

export async function GET() {
  const admin = await requireAdmin();
  if ('error' in admin) return admin.error;

  // Ambil notif tipe ADMIN_BROADCAST, group by title+message+createdAt (ambil distinct)
  // Karena createMany membuat row terpisah per user, kita ambil 1 per "batch" menggunakan
  // groupBy atau ambil yang distinct createdAt-nya cukup dekat
  // Pendekatan sederhana: ambil notif ADMIN_BROADCAST milik admin pertama saja per batch
  // Lebih baik: simpan satu record "broadcast log" — tapi untuk sekarang kita query distinct

  const raw = await prisma.notification.findMany({
    where: { type: 'ADMIN_BROADCAST' },
    select: {
      id: true,
      title: true,
      message: true,
      imageUrl: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    distinct: ['title', 'message'],
    take: 50,
  });

  // Untuk setiap broadcast, hitung jumlah penerima
  const withCount = await Promise.all(
    raw.map(async (n) => {
      const count = await prisma.notification.count({
        where: {
          type: 'ADMIN_BROADCAST',
          title: n.title,
          message: n.message,
          createdAt: {
            gte: new Date(n.createdAt.getTime() - 5000),
            lte: new Date(n.createdAt.getTime() + 5000),
          },
        },
      });
      return { ...n, recipientCount: count };
    })
  );

  return Response.json(withCount);
}