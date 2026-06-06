import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BOOST_PACKAGES, getBoosterPackage } from '@/lib/booster';
import { createMidtransSnapTransaction } from '@/lib/midtrans';

type CartItem = {
  propertyId: string;
  propertyTitle?: string;
  packageId: string;
  packageTitle?: string;
  days?: number;
  price?: number;
};

type CheckoutBody = {
  items: CartItem[];
  paymentMethod: 'MIDTRANS';
};

const ADMIN_FEE = 1000;
const ALLOWED_PAYMENT_METHODS = new Set<CheckoutBody['paymentMethod']>([
  'MIDTRANS',
]);

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as CheckoutBody | null;
  if (!body) {
    return NextResponse.json({ message: 'Body request tidak valid.' }, { status: 400 });
  }

  const { items, paymentMethod } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ message: 'Keranjang kosong.' }, { status: 400 });
  }

  if (!ALLOWED_PAYMENT_METHODS.has(paymentMethod)) {
    return NextResponse.json({ message: 'Metode pembayaran tidak valid.' }, { status: 400 });
  }

  const uniquePropertyIds = new Set(items.map((item) => item.propertyId));
  if (uniquePropertyIds.size !== items.length) {
    return NextResponse.json({ message: 'Satu properti hanya bisa muncul satu kali di checkout.' }, { status: 400 });
  }

  const normalizedItems = items.map((item) => {
    const boosterPackage = getBoosterPackage(item.packageId);
    if (!boosterPackage) {
      return null;
    }

    return {
      propertyId: item.propertyId,
      propertyTitle: typeof item.propertyTitle === 'string' ? item.propertyTitle.trim() : '',
      packageId: boosterPackage.id,
      packageTitle: boosterPackage.title,
      days: boosterPackage.days,
      price: boosterPackage.price,
    };
  });

  if (normalizedItems.some((item) => item === null)) {
    return NextResponse.json(
      { message: 'Ada paket booster yang tidak valid.', data: BOOST_PACKAGES },
      { status: 400 }
    );
  }

  const sanitizedItems = normalizedItems as Array<{
    propertyId: string;
    propertyTitle: string;
    packageId: string;
    packageTitle: string;
    days: number;
    price: number;
  }>;

  const userId = session.user.id;
  const now = new Date();
  const propertyIds = sanitizedItems.map((item) => item.propertyId);

  const properties = await prisma.property.findMany({
    where: { id: { in: propertyIds }, ownerId: userId },
    select: {
      id: true,
      title: true,
      boosts: {
        where: {
          startsAt: {
              lte: now,
          },
          endsAt: {
              gt: now,
          },
        },
        orderBy: {
          endsAt: 'desc',
        },
        take: 1,
      },
    },
  });

  if (properties.length !== propertyIds.length) {
    return NextResponse.json(
      { message: 'Beberapa properti tidak ditemukan atau bukan milik kamu.' },
      { status: 403 }
    );
  }

  const propertyById = new Map(properties.map((property) => [property.id, property]));

  for (const item of sanitizedItems) {
    const property = propertyById.get(item.propertyId);
    if (!property) {
      return NextResponse.json({ message: 'Properti tidak ditemukan.' }, { status: 404 });
    }

    if (property.boosts.length > 0) {
      return NextResponse.json(
        {
          message: `Properti ${property.title} masih memiliki booster aktif.`,
        },
        { status: 409 }
      );
    }
  }

  const subtotal = sanitizedItems.reduce((sum, item) => sum + item.price, 0);
  const grossAmount = subtotal + ADMIN_FEE;
  const orderId = `BOOST-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const user = session.user;

  const payment = await prisma.boostPayment.create({
    data: {
      orderId,
      ownerId: userId,
      provider: 'MIDTRANS',
      status: 'PENDING',
      paymentMethod: 'MIDTRANS',
      paymentType: 'MIDTRANS',
      subtotal,
      adminFee: ADMIN_FEE,
      grossAmount,
      rawRequest: {
        userId,
        items: sanitizedItems,
        paymentMethod,
      },
      items: {
        create: sanitizedItems.map((item) => ({
          propertyId: item.propertyId,
          propertyTitle: item.propertyTitle || propertyById.get(item.propertyId)?.title || '',
          packageId: item.packageId,
          packageTitle: item.packageTitle,
          days: item.days,
          price: item.price,
        })),
      },
    },
    select: {
      id: true,
      orderId: true,
      status: true,
      paymentMethod: true,
      paymentType: true,
      subtotal: true,
      adminFee: true,
      grossAmount: true,
      createdAt: true,
      items: {
        select: {
          id: true,
          propertyId: true,
          propertyTitle: true,
          packageId: true,
          packageTitle: true,
          days: true,
          price: true,
        },
      },
    },
  });

  try {
    const snap = await createMidtransSnapTransaction({
      orderId,
      grossAmount,
      paymentMethod: 'MIDTRANS',
      customer: {
        first_name: user.name?.trim() || 'Owner',
        email: user.email ?? undefined,
      },
      items: [
        ...sanitizedItems.map((item) => ({
          id: item.packageId,
          price: item.price,
          quantity: 1,
          name: `${item.packageTitle} - ${propertyById.get(item.propertyId)?.title ?? item.propertyTitle ?? item.propertyId}`,
        })),
        {
          id: 'admin-fee',
          price: ADMIN_FEE,
          quantity: 1,
          name: 'Biaya Admin',
        },
      ],
    });

    const updatedPayment = await prisma.boostPayment.update({
      where: { id: payment.id },
      data: {
        snapToken: snap.token,
        redirectUrl: snap.redirect_url,
        rawResponse: snap,
      },
      select: {
        id: true,
        orderId: true,
        status: true,
        paymentMethod: true,
        paymentType: true,
        subtotal: true,
        adminFee: true,
        grossAmount: true,
        snapToken: true,
        redirectUrl: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            propertyId: true,
            propertyTitle: true,
            packageId: true,
            packageTitle: true,
            days: true,
            price: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Transaksi pembayaran booster berhasil dibuat. Silakan lanjutkan ke halaman pembayaran Midtrans.',
      data: updatedPayment,
    });
  } catch (error) {
    await prisma.boostPayment.update({
      where: { id: payment.id },
      data: {
        status: 'FAILED',
        rawResponse: {
          message: error instanceof Error ? error.message : 'Midtrans checkout failed',
        },
      },
    });

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Gagal membuat transaksi Midtrans. Silakan coba lagi nanti.',
      },
      { status: 502 }
    );
  }
}