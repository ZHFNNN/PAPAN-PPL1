import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/require-user';

type RouteContext = {
  params: Promise<{ id: string }>;
};

const replySchema = z.object({
  comment: z.string().min(1).max(2000),
});

// POST /api/reviews/:id/reply
export async function POST(request: Request, { params }: RouteContext) {
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;

  const userId = auth.session.user.id;
  const { id: reviewId } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = replySchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { message: 'Payload tidak valid.', errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true, property: { select: { ownerId: true } } },
  });

  if (!review) {
    return Response.json({ message: 'Review tidak ditemukan.' }, { status: 404 });
  }

  if (review.property.ownerId !== userId) {
    return Response.json({ message: 'Tidak diizinkan.' }, { status: 403 });
  }

  const reply = await prisma.reviewReply.create({
    data: {
      reviewId,
      ownerId: userId,
      comment: parsed.data.comment,
    },
    include: {
      owner: { select: { id: true, name: true, username: true, image: true } },
    },
  });

  return Response.json({ message: 'Balasan berhasil ditambahkan.', data: reply }, { status: 201 });
}