import { KycStatus } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/require-user';

const createPropertySchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  price: z.number().positive(),
  listingType: z.enum(['SELL', 'RENT'])
});

export async function POST(request: Request) {
  const auth = await requireAuth();
  if ('error' in auth) {
    return auth.error;
  }

  const userId = auth.session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      kycStatus: true
    }
  });

  if (!user || user.kycStatus !== KycStatus.APPROVED) {
    return Response.json(
      { message: 'User harus lolos verifikasi KTP untuk membuat listing' },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = createPropertySchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { message: 'Payload tidak valid', errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const property = await prisma.property.create({
    data: {
      ownerId: userId,
      title: parsed.data.title,
      description: parsed.data.description,
      price: parsed.data.price,
      listingType: parsed.data.listingType
    }
  });

  return Response.json({ message: 'Listing berhasil dibuat', data: property }, { status: 201 });
}
