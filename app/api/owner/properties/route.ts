
// ============================================================
// FILE: app/api/owner/properties/route.ts
// POST /api/owner/properties
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Hanya user dengan KYC APPROVED yang boleh tambah properti
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { kycStatus: true },
  });

  if (user?.kycStatus !== 'APPROVED') {
    return NextResponse.json(
      { message: 'KYC kamu belum disetujui.' },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { title, description, price, listingType, address, facilities } = body;

  if (!title || !price || !listingType) {
    return NextResponse.json({ message: 'Data tidak lengkap.' }, { status: 400 });
  }

  const property = await prisma.property.create({
    data: {
      ownerId: session.user.id,
      title,
      description: description ?? null,
      price: Number(price),
      listingType,
      // Catatan: field `address` dan `facilities` belum ada di schema Prisma kamu.
      // Tambahkan ke model Property jika diperlukan:
      // address String?
      // facilities String[]
    },
  });

  return NextResponse.json(property, { status: 201 });
}