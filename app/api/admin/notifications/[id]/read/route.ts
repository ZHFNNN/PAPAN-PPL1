import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/require-user';

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;

  const { id } = await params;

  const notif = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notif || notif.ownerId !== auth.session.user.id) {
    return Response.json({ message: 'Notifikasi tidak ditemukan.' }, { status: 404 });
  }

  await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });

  return Response.json({ message: 'Notifikasi ditandai sudah dibaca.' });
}