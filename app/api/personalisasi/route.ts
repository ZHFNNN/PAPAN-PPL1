import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';   // sesuaikan path auth kamu
import { prisma } from '@/lib/prisma';       // sesuaikan path prisma client kamu

// ── Mapping budget string → angka (min, max) ──────────────────────────────
const BUDGET_MAP: Record<string, { min: number; max: number }> = {
  '0 - 2 juta':  { min: 0,         max: 2_000_000 },
  '2 - 4 juta':  { min: 2_000_000, max: 4_000_000 },
  '4 - 6 juta':  { min: 4_000_000, max: 6_000_000 },
  '6 - 8 juta':  { min: 6_000_000, max: 8_000_000 },
  '8 juta+':     { min: 8_000_000, max: 999_999_999 },
};

// ── GET: ambil personalisasi user ─────────────────────────────────────────
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const data = await prisma.userPersonalization.findUnique({
    where: { userId: session.user.id },
  });

  // Kalau belum punya data personalisasi, kembalikan null (bukan error)
  return NextResponse.json(data ?? null);
}

// ── POST: simpan / update personalisasi user ──────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  // Validasi minimal
  const { location, occupation, budget, gender, preferences } = body;
  if (!location || !occupation || !budget || !gender) {
    return NextResponse.json(
      { message: 'Semua field wajib diisi.' },
      { status: 400 }
    );
  }

  const budgetRange = BUDGET_MAP[budget] ?? { min: 0, max: 999_999_999 };

  // preferences adalah array string, ubah jadi boolean fields
  const prefFields = {
    prefFurnished:          (preferences as string[]).includes('Furnished'),
    prefUnfurnished:        (preferences as string[]).includes('Unfurnished'),
    prefPetFriendly:        (preferences as string[]).includes('Pet-friendly'),
    prefParkirMobil:        (preferences as string[]).includes('Parkir Mobil'),
    prefAc:                 (preferences as string[]).includes('AC'),
    prefWaterHeater:        (preferences as string[]).includes('Water Heater'),
    prefDekatTransportasi:  (preferences as string[]).includes('Dekat transportasi umum'),
  };

  // upsert = update kalau sudah ada, create kalau belum ada
  const personalization = await prisma.userPersonalization.upsert({
    where:  { userId: session.user.id },
    update: {
      location,
      occupation,
      budgetMin: budgetRange.min,
      budgetMax: budgetRange.max,
      gender,
      ...prefFields,
    },
    create: {
      userId: session.user.id,
      location,
      occupation,
      budgetMin: budgetRange.min,
      budgetMax: budgetRange.max,
      gender,
      ...prefFields,
    },
  });

  return NextResponse.json(personalization, { status: 200 });
}