import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-user';
import { PropertyCategory } from '@prisma/client';

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if ('error' in admin) return admin.error;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') as PropertyCategory | null;
  const city = searchParams.get('city');

  // Ambil semua kota yang ada (untuk datalist suggestion)
  const allCities = await prisma.property.findMany({
    where: { city: { not: null } },
    select: { city: true },
    distinct: ['city'],
  });
  const cities = allCities.map(p => p.city).filter(Boolean) as string[];

  // Ambil owner yang sudah KYC APPROVED.
  // Jika ada filter kategori atau kota, tetap pakai properti untuk menyaring.
  const ownerWhere: any = {
    role: 'OWNER' as any,
    kycStatus: 'APPROVED' as any,
  };

  if (category || city) {
    ownerWhere.properties = {
      some: {
        ...(category ? { category } : {}),
        ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
      },
    };
  }

  const owners = await prisma.user.findMany({
    where: ownerWhere,
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      properties: {
        select: { category: true, city: true },
      },
    },
  });

  const result = owners.map(owner => ({
    id: owner.id,
    name: owner.name,
    email: owner.email,
    username: owner.username,
    propertyCount: owner.properties.length,
    categories: [...new Set(owner.properties.map(p => p.category))],
    cities: [...new Set(owner.properties.map(p => p.city).filter(Boolean))] as string[],
  }));

  return Response.json({ owners: result, cities });
}