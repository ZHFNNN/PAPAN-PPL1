import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/require-user';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, { params }: RouteContext) {
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;

  const userId = auth.session.user.id;
  const { id: propertyId } = await params;

  const existing = await prisma.bookmark.findUnique({
    where: { userId_propertyId: { userId, propertyId } },
  });

  if (!existing) {
    return Response.json({ message: 'Bookmark tidak ditemukan.' }, { status: 404 });
  }

  await prisma.bookmark.delete({
    where: { userId_propertyId: { userId, propertyId } },
  });

  return Response.json({ message: 'Bookmark berhasil dihapus.' });
}

// GET /api/bookmarks/:propertyId — cek apakah properti sudah dibookmark
export async function GET(_request: Request, { params }: RouteContext) {
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;

  const userId = auth.session.user.id;
  const { id: propertyId } = await params;

  const bookmark = await prisma.bookmark.findUnique({
    where: { userId_propertyId: { userId, propertyId } },
  });

  return Response.json({ isBookmarked: Boolean(bookmark) });
}