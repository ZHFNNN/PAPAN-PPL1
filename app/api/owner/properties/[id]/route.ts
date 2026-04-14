// ============================================================
// FILE: app/api/owner/properties/[id]/route.ts
// GET /api/owner/properties/[id]
// PATCH /api/owner/properties/[id]
// DELETE /api/owner/properties/[id]
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const property = await prisma.property.findUnique({
    where: { id },
  });

  if (!property) {
    return NextResponse.json({ message: 'Properti tidak ditemukan.' }, { status: 404 });
  }

  if (property.ownerId !== session.user.id) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json(property);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const existing = await prisma.property.findUnique({
    where: { id },
    select: { ownerId: true },
  });

  if (!existing) {
    return NextResponse.json({ message: 'Properti tidak ditemukan.' }, { status: 404 });
  }

  if (existing.ownerId !== session.user.id) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { title, description, price, listingType } = body;

  if (!title || !price || !listingType) {
    return NextResponse.json({ message: 'Data tidak lengkap.' }, { status: 400 });
  }

  const updated = await prisma.property.update({
    where: { id },
    data: {
      title,
      description: description ?? null,
      price: Number(price),
      listingType,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const property = await prisma.property.findUnique({
    where: { id },
    select: { ownerId: true },
  });

  if (!property) {
    return NextResponse.json({ message: 'Properti tidak ditemukan.' }, { status: 404 });
  }

  // Pastikan hanya owner yang bisa hapus
  if (property.ownerId !== session.user.id) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  await prisma.property.delete({ where: { id } });

  return NextResponse.json({ message: 'Properti berhasil dihapus.' });
}