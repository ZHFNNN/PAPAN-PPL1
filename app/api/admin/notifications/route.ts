import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/require-user';

export async function GET() {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;

  const notifications = await prisma.notification.findMany({
    where: { ownerId: auth.session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return Response.json(notifications);
}