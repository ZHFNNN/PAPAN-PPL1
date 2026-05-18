// app/api/conversations/[conversationId]/messages/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ conversationId: string }>;
}

// GET /api/conversations/[conversationId]/messages
// Ambil semua pesan dalam sebuah conversation + mark as read
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await params;

    // Pastikan user adalah bagian dari conversation ini
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ userId: session.user.id }, { ownerId: session.user.id }],
      },
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
      return NextResponse.json({ error: "Conversation tidak ditemukan" }, { status: 404 });
    }

    // Ambil semua pesan
    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Mark pesan yang diterima sebagai sudah dibaca
    await prisma.message.updateMany({
      where: {
        conversationId,
        isRead: false,
        senderId: { not: session.user.id },
      },
      data: { isRead: true },
    });

    return NextResponse.json({ conversation, messages });
  } catch (error) {
    console.error("[GET /api/conversations/[conversationId]/messages]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/conversations/[conversationId]/messages
// Kirim pesan baru
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await params;
    const { content } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 });
    }

    // Pastikan user adalah bagian dari conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ userId: session.user.id }, { ownerId: session.user.id }],
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation tidak ditemukan" }, { status: 404 });
    }

    // Buat pesan baru
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: session.user.id,
        content: content.trim(),
      },
      include: {
        sender: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    // Update updatedAt conversation agar muncul di urutan teratas
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("[POST /api/conversations/[conversationId]/messages]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}