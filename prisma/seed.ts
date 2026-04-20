import { hash } from "bcryptjs";
import { KycStatus, Role } from "@prisma/client";
import { prisma } from "../lib/prisma";

const DEFAULT_FACILITIES = [
  { code: "FURNISHED", name: "Furnished" },
  { code: "UNFURNISHED", name: "Unfurnished" },
  { code: "PET_FRIENDLY", name: "Pet-friendly" },
  { code: "PARKIR_MOBIL", name: "Parkir Mobil" },
  { code: "AC", name: "AC" },
  { code: "WATER_HEATER", name: "Water Heater" },
  { code: "DEKAT_TRANSPORTASI", name: "Dekat transportasi umum" },
  { code: "WIFI", name: "WiFi" },
  { code: "KAMAR_MANDI_DALAM", name: "Kamar mandi dalam" },
  { code: "DAPUR", name: "Dapur" },
];

const DUMMY_OWNER_EMAIL = "owner-demo@papan.local";

type DummyTemplate = {
  titlePrefix: string;
  category: 'RUMAH' | 'APARTEMEN' | 'KOSAN';
  description: string;
  price: number;
  listingType: string;
  facilityCodes: string[];
  imageUrls: string[];
};

type DummyArea = {
  city: string;
  district: string;
  neighbourhood: string;
  lat: number;
  lng: number;
};

type DummyProperty = {
  title: string;
  category: 'RUMAH' | 'APARTEMEN' | 'KOSAN';
  description: string;
  price: number;
  listingType: string;
  facilityCodes: string[];
  address: string;
  city: string;
  district: string;
  neighbourhood: string;
  latitude: number;
  longitude: number;
  imageUrls: string[];
};

const DUMMY_TEMPLATES: DummyTemplate[] = [
  {
    titlePrefix: "Kost AC dekat kampus",
    category: 'KOSAN',
    description: "Kosan nyaman untuk mahasiswa. AC, WiFi, Water Heater, dan akses transportasi umum.",
    price: 2_100_000,
    listingType: "RENT",
    facilityCodes: ["AC", "WIFI", "WATER_HEATER", "DEKAT_TRANSPORTASI", "UNFURNISHED"],
    imageUrls: [
      "https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1200&q=80",
    ],
  },
  {
    titlePrefix: "Apartemen furnished premium",
    category: 'APARTEMEN',
    description: "Apartemen furnished dengan dapur modern, parkir mobil, dan keamanan 24 jam.",
    price: 4_800_000,
    listingType: "RENT",
    facilityCodes: ["FURNISHED", "PARKIR_MOBIL", "DAPUR", "AC"],
    imageUrls: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80",
    ],
  },
  {
    titlePrefix: "Rumah pet-friendly keluarga",
    category: 'RUMAH',
    description: "Rumah sewa untuk keluarga kecil, pet-friendly, carport luas, dan kamar mandi dalam.",
    price: 3_900_000,
    listingType: "RENT",
    facilityCodes: ["PET_FRIENDLY", "UNFURNISHED", "PARKIR_MOBIL", "KAMAR_MANDI_DALAM"],
    imageUrls: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200&q=80",
    ],
  },
  {
    titlePrefix: "Studio hemat strategis",
    category: 'APARTEMEN',
    description: "Studio hemat dengan akses ke halte dan stasiun, cocok untuk pekerja dan mahasiswa.",
    price: 1_650_000,
    listingType: "RENT",
    facilityCodes: ["UNFURNISHED", "DEKAT_TRANSPORTASI"],
    imageUrls: [
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80",
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=1200&q=80",
    ],
  },
  {
    titlePrefix: "Apartemen modern view kota",
    category: 'APARTEMEN',
    description: "Unit modern dengan AC, WiFi, water heater, dan dapur. Cocok untuk profesional muda.",
    price: 5_200_000,
    listingType: "RENT",
    facilityCodes: ["FURNISHED", "AC", "WIFI", "WATER_HEATER", "DAPUR"],
    imageUrls: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&q=80",
      "https://images.unsplash.com/photo-1616594039964-3f2b91fcb0f7?w=1200&q=80",
    ],
  },
  {
    titlePrefix: "Kost putri dekat transportasi",
    category: 'KOSAN',
    description: "Kost putri aman dan nyaman, dekat MRT/KRL, AC dan WiFi tersedia.",
    price: 2_750_000,
    listingType: "RENT",
    facilityCodes: ["AC", "WIFI", "DEKAT_TRANSPORTASI", "UNFURNISHED"],
    imageUrls: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80",
    ],
  },
  {
    titlePrefix: "Rumah siap huni",
    category: 'RUMAH',
    description: "Rumah siap huni dengan dapur, AC, kamar mandi dalam, dan lingkungan tenang.",
    price: 4_400_000,
    listingType: "RENT",
    facilityCodes: ["FURNISHED", "AC", "DAPUR", "KAMAR_MANDI_DALAM"],
    imageUrls: [
      "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80",
    ],
  },
  {
    titlePrefix: "Unit commuter dekat stasiun",
    category: 'APARTEMEN',
    description: "Unit cocok untuk commuter, dekat stasiun, tersedia furnished dan water heater.",
    price: 3_300_000,
    listingType: "RENT",
    facilityCodes: ["FURNISHED", "WATER_HEATER", "DEKAT_TRANSPORTASI"],
    imageUrls: [
      "https://images.unsplash.com/photo-1617098474202-0d0d7f60f4e9?w=1200&q=80",
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
    ],
  },
  {
    titlePrefix: "Kost pet-friendly",
    category: 'KOSAN',
    description: "Kost pet-friendly dengan internet cepat, cocok untuk yang bawa hewan peliharaan.",
    price: 2_450_000,
    listingType: "RENT",
    facilityCodes: ["PET_FRIENDLY", "WIFI", "UNFURNISHED"],
    imageUrls: [
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=1200&q=80",
    ],
  },
  {
    titlePrefix: "Apartemen unfurnished nyaman",
    category: 'APARTEMEN',
    description: "Apartemen unfurnished dengan parkir mobil dan akses transportasi umum.",
    price: 3_000_000,
    listingType: "RENT",
    facilityCodes: ["UNFURNISHED", "PARKIR_MOBIL", "DEKAT_TRANSPORTASI"],
    imageUrls: [
      "https://images.unsplash.com/photo-1560185008-b033106af5c3?w=1200&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80",
    ],
  },
  {
    titlePrefix: "Rumah keluarga luas",
    category: 'RUMAH',
    description: "Rumah keluarga luas dengan carport, dapur lengkap, dan ventilasi baik.",
    price: 5_500_000,
    listingType: "RENT",
    facilityCodes: ["UNFURNISHED", "PARKIR_MOBIL", "DAPUR", "KAMAR_MANDI_DALAM"],
    imageUrls: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80",
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&q=80",
    ],
  },
  {
    titlePrefix: "Kost super hemat",
    category: 'KOSAN',
    description: "Kost hemat untuk mahasiswa, dekat kampus dan akses transportasi umum.",
    price: 1_250_000,
    listingType: "RENT",
    facilityCodes: ["UNFURNISHED", "DEKAT_TRANSPORTASI"],
    imageUrls: [
      "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=1200&q=80",
      "https://images.unsplash.com/photo-1493666438817-866a91353ca9?w=1200&q=80",
    ],
  },
];

const DUMMY_AREAS: DummyArea[] = [
  { city: "Bandung", district: "Coblong", neighbourhood: "Dago", lat: -6.893, lng: 107.61 },
  { city: "Bandung", district: "Sukajadi", neighbourhood: "Cihampelas", lat: -6.892, lng: 107.595 },
  { city: "Bandung", district: "Lengkong", neighbourhood: "Buah Batu", lat: -6.94, lng: 107.63 },
  { city: "Bandung", district: "Arcamanik", neighbourhood: "Arcamanik", lat: -6.917, lng: 107.673 },
  { city: "Bandung", district: "Antapani", neighbourhood: "Antapani", lat: -6.911, lng: 107.657 },
  { city: "Bandung", district: "Cidadap", neighbourhood: "Setiabudi", lat: -6.874, lng: 107.604 },
  { city: "Jakarta Selatan", district: "Tebet", neighbourhood: "Tebet Timur", lat: -6.229, lng: 106.853 },
  { city: "Jakarta Selatan", district: "Kebayoran Baru", neighbourhood: "Senopati", lat: -6.229, lng: 106.809 },
  { city: "Depok", district: "Pancoran Mas", neighbourhood: "Margo", lat: -6.402, lng: 106.822 },
  { city: "Depok", district: "Beji", neighbourhood: "Kukusan", lat: -6.365, lng: 106.832 },
  { city: "Tangerang Selatan", district: "Ciputat", neighbourhood: "Ciputat Timur", lat: -6.307, lng: 106.763 },
  { city: "Bekasi", district: "Bekasi Selatan", neighbourhood: "Pekayon", lat: -6.257, lng: 106.993 },
  { city: "Cimahi", district: "Cimahi Tengah", neighbourhood: "Baros", lat: -6.884, lng: 107.542 },
  { city: "Sumedang", district: "Jatinangor", neighbourhood: "Sayang", lat: -6.93, lng: 107.77 },
  { city: "Bandung", district: "Regol", neighbourhood: "Batununggal", lat: -6.933, lng: 107.633 },
  { city: "Bandung", district: "Andir", neighbourhood: "Ciroyom", lat: -6.914, lng: 107.588 },
];

function buildDummyProperties(total: number): DummyProperty[] {
  const result: DummyProperty[] = [];

  for (let i = 0; i < total; i++) {
    const template = DUMMY_TEMPLATES[i % DUMMY_TEMPLATES.length];
    const area = DUMMY_AREAS[i % DUMMY_AREAS.length];
    const cycle = Math.floor(i / DUMMY_TEMPLATES.length);
    const variation = (i % 5) * 125_000 + cycle * 50_000;
    const latJitter = ((i % 7) - 3) * 0.0012;
    const lngJitter = ((i % 9) - 4) * 0.0011;

    result.push({
      title: `[DUMMY] ${template.titlePrefix} ${area.neighbourhood} #${i + 1}`,
      category: template.category,
      description: `${template.description} Lokasi ${area.neighbourhood}, ${area.district}, ${area.city}.`,
      price: template.price + variation,
      listingType: template.listingType,
      facilityCodes: template.facilityCodes,
      address: `${area.neighbourhood}, ${area.district}, ${area.city}`,
      city: area.city,
      district: area.district,
      neighbourhood: area.neighbourhood,
      latitude: Number((area.lat + latJitter).toFixed(6)),
      longitude: Number((area.lng + lngJitter).toFixed(6)),
      imageUrls: template.imageUrls,
    });
  }

  return result;
}

const DUMMY_PROPERTIES = buildDummyProperties(48);

async function main() {
  const adminName = process.env.ADMIN_NAME || "Admin";
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminEmail = process.env.ADMIN_EMAIL || "admin@papan.local";
  const adminPhoneNumber = process.env.ADMIN_PHONE_NUMBER || "081111111111";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin12345";

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const passwordHash = await hash(adminPassword, 12);

    await prisma.user.create({
      data: {
        username: adminUsername,
        name: adminName,
        email: adminEmail,
        phoneNumber: adminPhoneNumber,
        passwordHash,
        role: Role.ADMIN
      }
    });

    console.log("Admin seeded:", adminEmail);
  } else {
    console.log("Admin already exists");
  }

  await prisma.facility.createMany({
    data: DEFAULT_FACILITIES,
    skipDuplicates: true,
  });

  console.log("Facilities seeded:", DEFAULT_FACILITIES.length);

  const dummyOwner = await prisma.user.upsert({
    where: { email: DUMMY_OWNER_EMAIL },
    update: {
      name: "Owner Demo",
      username: "ownerdemo",
      phoneNumber: "081222222222",
      role: Role.USER,
      kycStatus: KycStatus.APPROVED,
    },
    create: {
      name: "Owner Demo",
      username: "ownerdemo",
      email: DUMMY_OWNER_EMAIL,
      phoneNumber: "081222222222",
      role: Role.USER,
      kycStatus: KycStatus.APPROVED,
    },
  });

  const allFacilities = await prisma.facility.findMany({
    select: { id: true, code: true },
  });
  const facilityByCode = new Map(allFacilities.map((facility) => [facility.code, facility.id]));

  await prisma.property.deleteMany({
    where: {
      ownerId: dummyOwner.id,
      title: {
        startsWith: "[DUMMY]",
      },
    },
  });

  for (const item of DUMMY_PROPERTIES) {
    const propertyData = {
      ownerId: dummyOwner.id,
      title: item.title,
      address: item.address,
      city: item.city,
      district: item.district,
      neighbourhood: item.neighbourhood,
      latitude: item.latitude,
      longitude: item.longitude,
      imageUrls: item.imageUrls,
      description: item.description,
      price: item.price,
      listingType: item.listingType,
    };

    Object.assign(propertyData, { category: item.category });

    const property = await prisma.property.create({
      data: propertyData,
    });

    const facilityIds = item.facilityCodes
      .map((code) => facilityByCode.get(code))
      .filter((id): id is string => Boolean(id));

    if (facilityIds.length > 0) {
      await prisma.propertyFacility.createMany({
        data: facilityIds.map((facilityId) => ({
          propertyId: property.id,
          facilityId,
        })),
        skipDuplicates: true,
      });
    }
  }

  console.log("Dummy properties seeded:", DUMMY_PROPERTIES.length);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
