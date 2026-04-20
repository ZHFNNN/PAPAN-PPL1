import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const facilities = await prisma.facility.findMany({
    select: {
      code: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return NextResponse.json({
    message: 'Daftar fasilitas berhasil diambil.',
    data: facilities,
  });
}
