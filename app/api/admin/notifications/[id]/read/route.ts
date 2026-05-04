import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/require-user';

export async function PATCH(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const user = await requireUser();
  if ('error' in user) return user.error;

  const notif = await prisma.notification.findUnique({
    where: { id: params.id },
  });

  if (!notif || notif.ownerId !== user.id) {
    return Response.json({ message: 'Notifikasi tidak ditemukan.' }, { status: 404 });
  }

  await prisma.notification.update({
    where: { id: params.id },
    data: { isRead: true },
  });

  return Response.json({ message: 'Notifikasi ditandai sudah dibaca.' });
}