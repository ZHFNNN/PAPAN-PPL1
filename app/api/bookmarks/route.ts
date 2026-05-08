import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/require-user';

// GET /api/bookmarks — ambil semua bookmark milik user yang login
export async function GET() {
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;

  const userId = auth.session.user.id;

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          address: true,
          neighbourhood: true,
          district: true,
          city: true,
          price: true,
          listingType: true,
          imageUrls: true,
        },
      },
    },
  });

  const data = bookmarks.map(({ property }) => ({
    id: property.id,
    title: property.title,
    address: property.address,
    neighbourhood: property.neighbourhood,
    district: property.district,
    city: property.city,
    price: Number(property.price),
    listingType: property.listingType,
    coverImageUrl: property.imageUrls?.[0] ?? null,
  }));

  return Response.json({ message: 'Bookmark berhasil diambil.', data });
}

// POST /api/bookmarks — tambah bookmark
export async function POST(request: Request) {
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;

  const userId = auth.session.user.id;
  const body = await request.json().catch(() => ({}));
  const { propertyId } = body as { propertyId?: string };

  if (!propertyId || typeof propertyId !== 'string') {
    return Response.json({ message: 'propertyId wajib diisi.' }, { status: 400 });
  }

  // Cek properti ada
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) {
    return Response.json({ message: 'Properti tidak ditemukan.' }, { status: 404 });
  }

  // upsert supaya tidak error kalau sudah ada
  const bookmark = await prisma.bookmark.upsert({
    where: { userId_propertyId: { userId, propertyId } },
    create: { userId, propertyId },
    update: {},
  });

  return Response.json({ message: 'Properti berhasil dibookmark.', data: bookmark }, { status: 201 });
}