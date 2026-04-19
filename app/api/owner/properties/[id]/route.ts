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
import { resolveFacilityCodes } from '@/lib/dss/facility-mapping';

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
    include: {
      facilities: {
        include: {
          facility: {
            select: {
              code: true,
              name: true,
            },
          },
        },
      },
    },
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
  const { title, description, price, listingType, facilities, address, location, imageUrls } = body;

  if (!title || !price || !listingType) {
    return NextResponse.json({ message: 'Data tidak lengkap.' }, { status: 400 });
  }

  const latitude = typeof location?.lat === 'number' ? location.lat : null;
  const longitude = typeof location?.lng === 'number' ? location.lng : null;
  const city = typeof location?.city === 'string' ? location.city.trim() : null;
  const district = typeof location?.district === 'string' ? location.district.trim() : null;
  const neighbourhood = typeof location?.neighbourhood === 'string' ? location.neighbourhood.trim() : null;

  const facilityItems = Array.isArray(facilities) ? (facilities as string[]) : null;
  const photoUrls = Array.isArray(imageUrls)
    ? imageUrls.filter((item: unknown): item is string => typeof item === 'string' && item.trim().length > 0)
    : null;
  const facilityCodes = facilityItems ? resolveFacilityCodes(facilityItems) : [];
  const facilityRecords = facilityItems
    ? await prisma.facility.findMany({
        where: { code: { in: facilityCodes } },
        select: { id: true },
      })
    : [];

  const updated = await prisma.property.update({
    where: { id },
    data: {
      title,
      ...(typeof address === 'string' ? { address } : {}),
      ...(location
        ? {
            city,
            district,
            neighbourhood,
            latitude,
            longitude,
          }
        : {}),
      ...(photoUrls ? { imageUrls: photoUrls } : {}),
      description: description ?? null,
      price: Number(price),
      listingType,
      ...(facilityItems
        ? {
            facilities: {
              deleteMany: {},
              createMany: {
                data: facilityRecords.map((facility) => ({ facilityId: facility.id })),
                skipDuplicates: true,
              },
            },
          }
        : {}),
    },
    include: {
      facilities: {
        include: {
          facility: {
            select: {
              code: true,
              name: true,
            },
          },
        },
      },
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