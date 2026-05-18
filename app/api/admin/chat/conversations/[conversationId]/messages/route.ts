import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-user";

interface Params {
  params: Promise<{ conversationId: string }>;
}

// GET /api/admin/chat/conversations/[conversationId]/messages
// Admin-only: baca isi chat tanpa mengubah state read/unread (read-only)
export async function GET(_request: Request, { params }: Params) {
  const admin = await requireAdmin();
  if ("error" in admin) return admin.error;

  const { conversationId } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          imageUrls: true,
          city: true,
          price: true,
          listingType: true,
          category: true,
        },
      },
      user: {
        select: { id: true, name: true, image: true, username: true },
      },
      owner: {
        select: { id: true, name: true, image: true, username: true },
      },
    },
  });

  if (!conversation) {
    return Response.json({ message: "Conversation tidak ditemukan" }, { status: 404 });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    include: {
      sender: { select: { id: true, name: true, username: true, image: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return Response.json({ conversation, messages });
}
