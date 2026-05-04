import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/require-user';

export async function GET() {
  const user = await requireUser();
  if ('error' in user) return user.error;

  const notifications = await prisma.notification.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return Response.json(notifications);
}