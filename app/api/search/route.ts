import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// Normalize city aliases ke nama kota resmi di DB
const CITY_ALIASES: Record<string, string[]> = {
  Jakarta: ["jakarta"],
  Bandung: ["bandung"],
  Yogyakarta: ["yogyakarta", "jogja", "jogjakarta", "yogya"],
  Semarang: ["semarang"],
  Surabaya: ["surabaya"],
};

function resolveCityAliases(cityParam: string): string[] {
  const normalized = cityParam.toLowerCase().trim();
  for (const [canonical, aliases] of Object.entries(CITY_ALIASES)) {
    if (aliases.includes(normalized) || canonical.toLowerCase() === normalized) {
      return [canonical, ...aliases];
    }
  }
  return [cityParam];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const kategori = searchParams.get("kategori")?.trim() ?? "";
  const city = searchParams.get("city")?.trim() ?? "";
  const take = Math.min(parseInt(searchParams.get("take") ?? "50", 10), 100);

  // Bangun filter Prisma
  const where: Record<string, unknown> = {};

  // ── Full-text / keyword search ──
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { address: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
      { district: { contains: q, mode: "insensitive" } },
      { neighbourhood: { contains: q, mode: "insensitive" } },
    ];
  }

  // ── Kategori filter ──
  if (kategori) {
    const normalizedCategory = kategori.trim().toUpperCase();
    if (['RUMAH', 'APARTEMEN', 'KOSAN'].includes(normalizedCategory)) {
      where.category = { equals: normalizedCategory };
    }
  }

  // ── City filter — support aliases (jogja → yogyakarta, dll.) ──
  if (city) {
    const cityVariants = resolveCityAliases(city);
    where.city = {
      in: cityVariants,
      mode: "insensitive",
    };
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
        category: true,
        createdAt: true,
        facilities: {
          select: {
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
      take,
    });

    const data = properties.map((p) => ({
      id: p.id,
      title: p.title,
      listingType: p.listingType,
      propertyType: p.category,
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