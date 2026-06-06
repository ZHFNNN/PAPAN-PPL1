import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/require-user';

type RouteContext = {
  params: Promise<{ id: string; reviewId: string }>;
};

// DELETE /api/properties/:id/reviews/:reviewId
export async function DELETE(_request: Request, { params }: RouteContext) {
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;

  const userId = auth.session.user.id;
  const { id: propertyId, reviewId } = await params;

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true, userId: true, propertyId: true },
  });

  if (!review || review.propertyId !== propertyId) {
    return Response.json({ message: 'Review tidak ditemukan.' }, { status: 404 });
  }

  if (review.userId !== userId) {
    return Response.json({ message: 'Tidak diizinkan.' }, { status: 403 });
  }

  await prisma.review.delete({ where: { id: reviewId } });

  return Response.json({ message: 'Review berhasil dihapus.' });
}