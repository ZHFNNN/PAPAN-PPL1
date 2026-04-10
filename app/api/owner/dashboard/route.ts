// ============================================================
// FILE: app/api/owner/dashboard/route.ts
// GET /api/owner/dashboard
// ============================================================
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth'; // atau auth helper kamu
import { authOptions } from '@/lib/auth';      // sesuaikan path
import { prisma } from '@/lib/prisma';



export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  const [properties, user] = await Promise.all([
    prisma.property.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { kycStatus: true },
    }),
  ]);

  // Hitung stats sederhana — sesuaikan dengan field asli kamu
  const stats = {
    totalProperties: properties.length,
    activeProperties: properties.length, // Tambah field `status` ke model Property jika perlu
    rentedRooms: 0,                       // Tambah relasi Booking / Room ke Property jika perlu
    soldProperties: 0,                    // Idem
    totalRevenue: 0,                      // Hitung dari transaksi
  };

  return NextResponse.json({
    stats,
    properties: properties.map((p) => ({
      ...p,
      price: p.price.toString(),
    })),
  });
}