
// ============================================================
// FILE: app/api/owner/properties/route.ts
// POST /api/owner/properties
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { resolveFacilityCodes } from '@/lib/dss/facility-mapping';

const ALLOWED_CATEGORIES = ['RUMAH', 'APARTEMEN', 'KOSAN'] as const;
const ALLOWED_LISTING_TYPES = ['JUAL', 'SEWA'] as const;

function normalizeCategory(category: unknown): (typeof ALLOWED_CATEGORIES)[number] | null {
  if (typeof category !== 'string') return null;
  const normalized = category.trim().toUpperCase();
  return ALLOWED_CATEGORIES.includes(normalized as (typeof ALLOWED_CATEGORIES)[number])
    ? (normalized as (typeof ALLOWED_CATEGORIES)[number])
    : null;
}

function normalizeListingType(listingType: unknown): (typeof ALLOWED_LISTING_TYPES)[number] | null {
  if (typeof listingType !== 'string') return null;
  const normalized = listingType.trim().toUpperCase();
  if (normalized === 'SELL') return 'JUAL';
  if (normalized === 'RENT' || normalized === 'KOSAN') return 'SEWA';
  return ALLOWED_LISTING_TYPES.includes(normalized as (typeof ALLOWED_LISTING_TYPES)[number])
    ? (normalized as (typeof ALLOWED_LISTING_TYPES)[number])
    : null;
}

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
  const { title, description, price, listingType, category, address, facilities, location, imageUrls } = body;
  const normalizedCategory = normalizeCategory(category);
  const normalizedListingType = normalizeListingType(listingType);

  if (!title || !price || !normalizedListingType || !address || !normalizedCategory) {
    return NextResponse.json({ message: 'Data tidak lengkap.' }, { status: 400 });
  }

  const latitude = typeof location?.lat === 'number' ? location.lat : null;
  const longitude = typeof location?.lng === 'number' ? location.lng : null;
  const city = typeof location?.city === 'string' ? location.city.trim() : null;
  const district = typeof location?.district === 'string' ? location.district.trim() : null;
  const neighbourhood = typeof location?.neighbourhood === 'string' ? location.neighbourhood.trim() : null;

  const facilityItems = Array.isArray(facilities) ? (facilities as string[]) : [];
  const photoUrls = Array.isArray(imageUrls)
    ? imageUrls.filter((item: unknown): item is string => typeof item === 'string' && item.trim().length > 0)
    : [];
  const facilityCodes = resolveFacilityCodes(facilityItems);
  const facilityRecords = await prisma.facility.findMany({
    where: { code: { in: facilityCodes } },
    select: { id: true },
  });

  const propertyData = {
    ownerId: session.user.id,
    title,
    address,
    city,
    district,
    neighbourhood,
    latitude,
    longitude,
    imageUrls: photoUrls,
    description: description ?? null,
    price: Number(price),
    listingType: normalizedListingType,
    facilities: {
      createMany: {
        data: facilityRecords.map((facility) => ({ facilityId: facility.id })),
        skipDuplicates: true,
      },
    },
  };

  const property = await prisma.property.create({
    data: propertyData,
    include: {
      facilities: {
        include: {
          facility: { select: { code: true, name: true } },
        },
      },
    },
  });

  await prisma.$executeRaw(
    Prisma.sql`UPDATE "Property" SET "category" = ${normalizedCategory}::"PropertyCategory" WHERE "id" = ${property.id}`,
  );

  return NextResponse.json(property, { status: 201 });
}