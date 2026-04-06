import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/require-user';

export async function GET() {
  const auth = await requireAuth();
  if ('error' in auth) {
    return auth.error;
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.session.user.id },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      phoneNumber: true,
      role: true,
      kycStatus: true,
      createdAt: true
    }
  });

  return Response.json({ user });
}
