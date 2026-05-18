import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-user";

function toInt(value: string | null, fallback: number) {
  const parsed = value ? Number.parseInt(value, 10) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

// GET /api/admin/chat/conversations
// Admin-only: list semua room chat (read-only)
export async function GET(request: Request) {
  const admin = await requireAdmin();
  if ("error" in admin) return admin.error;

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();

  const page = Math.max(1, toInt(searchParams.get("page"), 1));
  const perPage = Math.min(100, Math.max(10, toInt(searchParams.get("perPage"), 30)));
  const skip = (page - 1) * perPage;

  const where =
    q.length > 0
      ? {
          OR: [
            { property: { title: { contains: q, mode: "insensitive" as const } } },
            { user: { name: { contains: q, mode: "insensitive" as const } } },
            { user: { username: { contains: q, mode: "insensitive" as const } } },
            { owner: { name: { contains: q, mode: "insensitive" as const } } },
            { owner: { username: { contains: q, mode: "insensitive" as const } } },
          ],
        }
      : undefined;

  const [total, items] = await Promise.all([
    prisma.conversation.count({ where }),
    prisma.conversation.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            title: true,
            imageUrls: true,
            city: true,
            price: true,
            listingType: true,
          },
        },
        user: {
          select: { id: true, name: true, image: true, username: true },
        },
        owner: {
          select: { id: true, name: true, image: true, username: true },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: { select: { id: true, name: true, username: true, image: true } },
          },
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take: perPage,
    }),
  ]);

  return Response.json({ items, total, page, perPage, q });
}
