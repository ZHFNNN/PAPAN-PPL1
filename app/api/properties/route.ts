import { KycStatus, Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/require-user';

const createPropertySchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  price: z.number().positive(),
  listingType: z.enum(['SELL', 'RENT'])
});

type PropertyCategory = 'RUMAH' | 'APARTEMEN' | 'KOSAN';

function normalizeCategory(value: string | null): PropertyCategory | null {
  if (!value) return null;

  const normalized = value.trim().toUpperCase();
  if (normalized === 'RUMAH' || normalized === 'APARTEMEN' || normalized === 'KOSAN') {
    return normalized;
  }

  return null;
}

function normalizeListingType(value: string | null): string[] | null {
  if (!value) return null;

  const normalized = value.trim().toUpperCase();

  if (normalized === 'SELL' || normalized === 'JUAL') {
    return ['SELL', 'JUAL'];
  }

  if (normalized === 'RENT' || normalized === 'SEWA' || normalized === 'KOSAN') {
    return ['RENT', 'SEWA', 'KOSAN'];
  }

  return [normalized];
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const categoryFilter = normalizeCategory(url.searchParams.get('category'));
  const listingTypeFilter = normalizeListingType(url.searchParams.get('listingType'));
  const searchQuery = url.searchParams.get('q')?.trim();

  const takeRaw = Number(url.searchParams.get('take') ?? '120');
  const take = Number.isFinite(takeRaw)
    ? Math.min(Math.max(Math.trunc(takeRaw), 1), 200)
    : 120;

  const now = new Date();
  const baseWhere: Prisma.PropertyWhereInput = {};

  if (categoryFilter) {
    baseWhere.category = categoryFilter;
  }

  if (listingTypeFilter) {
    baseWhere.listingType = { in: listingTypeFilter };
  }

  if (searchQuery) {
    baseWhere.OR = [
      { title: { contains: searchQuery, mode: 'insensitive' } },
      { address: { contains: searchQuery, mode: 'insensitive' } },
      { neighbourhood: { contains: searchQuery, mode: 'insensitive' } },
      { district: { contains: searchQuery, mode: 'insensitive' } },
      { city: { contains: searchQuery, mode: 'insensitive' } },
      { owner: { name: { contains: searchQuery, mode: 'insensitive' } } },
      { owner: { username: { contains: searchQuery, mode: 'insensitive' } } },
      {
        facilities: {
          some: {
            facility: {
              name: { contains: searchQuery, mode: 'insensitive' },
            },
          },
        },
      },
    ];
  }

  const includeConfig = {
    owner: {
      select: {
        id: true,
        name: true,
        username: true,
      },
    },
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
    boosts: {
      where: {
        endsAt: {
          gt: now,
        },
      },
      select: {
        id: true,
        packageId: true,
        packageTitle: true,
        days: true,
        price: true,
        startsAt: true,
        endsAt: true,
      },
      orderBy: {
        endsAt: 'desc',
      },
      take: 1,
    },
  } satisfies Prisma.PropertyInclude;

  const boosted = await prisma.property.findMany({
    where: {
      ...baseWhere,
      boosts: {
        some: {
          endsAt: {
            gt: now,
          },
        },
      },
    },
    include: includeConfig,
    orderBy: {
      createdAt: 'desc',
    },
    take,
  });

  const remaining = Math.max(take - boosted.length, 0);
  const nonBoosted = remaining
    ? await prisma.property.findMany({
        where: {
          ...baseWhere,
          boosts: {
            none: {
              endsAt: {
                gt: now,
              },
            },
          },
        },
        include: includeConfig,
        orderBy: {
          createdAt: 'desc',
        },
        take: remaining,
      })
    : [];

  const data = [...boosted, ...nonBoosted].map((property) => {
    const activeBoost = property.boosts[0] ?? null;
    const { boosts, facilities, ...plainProperty } = property;

    return {
      ...plainProperty,
      price: property.price.toString(),
      isBoosted: Boolean(activeBoost),
      activeBoost: activeBoost
        ? {
            id: activeBoost.id,
            packageId: activeBoost.packageId,
            packageTitle: activeBoost.packageTitle,
            days: activeBoost.days,
            price: activeBoost.price,
            startDate: activeBoost.startsAt.toISOString(),
            endDate: activeBoost.endsAt.toISOString(),
          }
        : null,
      facilities: facilities.map((entry) => ({
        code: entry.facility.code,
        name: entry.facility.name,
      })),
    };
  });

  return Response.json({
    message: 'Daftar properti berhasil diambil.',
    data,
  });
}

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
