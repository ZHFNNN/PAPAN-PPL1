import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const kategori = searchParams.get("kategori")?.trim() ?? "";

  // Bangun filter Prisma
  const where: Record<string, unknown> = {};

  const orConditions: Record<string, unknown>[] = [];

  if (q) {
    orConditions.push(
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { address: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
      { district: { contains: q, mode: "insensitive" } },
      { neighbourhood: { contains: q, mode: "insensitive" } },
    );
  }

  if (orConditions.length > 0) {
    where.OR = orConditions;
  }

  // Filter kategori jika ada (propertyType atau field lain di schema kamu)
  // Sesuaikan field name dengan schema Prisma kamu
  if (kategori) {
    where.propertyType = { equals: kategori, mode: "insensitive" };
  }

  try {
    const properties = await prisma.property.findMany({
      where,
      select: {
        id: true,
        title: true,
        address: true,
        city: true,
        district: true,
        neighbourhood: true,
        imageUrls: true,
        price: true,
        listingType: true,
        createdAt: true,
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
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const data = properties.map((p) => ({
      id: p.id,
      title: p.title,
      listingType: p.listingType,
      images: p.imageUrls,
      coverImageUrl: p.imageUrls[0] ?? null,
      address: p.address,
      neighbourhood: p.neighbourhood,
      district: p.district,
      city: p.city,
      price: Number(p.price),
      fasilitas: p.facilities.map((f) => f.facility.name ?? f.facility.code),
    }));

    return Response.json({ data, total: data.length });
  } catch (err) {
    console.error("[search API]", err);
    return Response.json({ error: "Gagal mengambil data properti." }, { status: 500 });
  }
}