import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-user';
import { PropertyCategory } from '@prisma/client';

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if ('error' in admin) return admin.error;

  const body = await request.json() as {
    title: string;
    message: string;
    imageUrl: string | null;
    category: PropertyCategory | null;
    city: string | null;
  };

  const { title, message, imageUrl, category, city } = body;

  if (!title?.trim() || !message?.trim()) {
    return Response.json({ message: 'Judul dan pesan wajib diisi.' }, { status: 400 });
  }

  // Temukan semua owner yang sesuai filter
  const owners = await prisma.user.findMany({
    where: {
      role: 'OWNER',
      properties: {
        some: {
          ...(category ? { category } : {}),
          ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
        },
      },
    },
    select: { id: true },
  });

  if (owners.length === 0) {
    return Response.json({ message: 'Tidak ada owner yang sesuai filter.' }, { status: 400 });
  }

  // Bulk insert notifications
  await prisma.notification.createMany({
    data: owners.map(owner => ({
      ownerId: owner.id,
      title: title.trim(),
      message: message.trim(),
      imageUrl: imageUrl ?? null,
      type: 'ADMIN_BROADCAST',
      isRead: false,
    })),
  });

  return Response.json({
    message: `Notifikasi berhasil dikirim ke ${owners.length} owner.`,
    count: owners.length,
  });
}