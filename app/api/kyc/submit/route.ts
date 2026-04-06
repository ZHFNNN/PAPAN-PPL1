import { KycStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-user";

const submitKycSchema = z.object({
  ktpImageUrl: z.string().url(),
  selfieImageUrl: z.string().url(),
  nik: z.string().regex(/^\d{16}$/, "NIK harus 16 digit"),
  fullName: z.string().min(3),
  phoneNumber: z.string().min(8).max(20),
  province: z.string().min(2),
  cityOrRegency: z.string().min(2),
  district: z.string().min(2),
  rt: z.string().regex(/^\d{1,3}$/, "RT harus angka 1-3 digit"),
  rw: z.string().regex(/^\d{1,3}$/, "RW harus angka 1-3 digit"),
  postalCode: z.string().regex(/^\d{5}$/, "Kode pos harus 5 digit")
});

export async function POST(request: Request) {
  const auth = await requireAuth();
  if ("error" in auth) {
    return auth.error;
  }

  try {
    const body = await request.json();
    const parsed = submitKycSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { message: "Payload tidak valid", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      ktpImageUrl,
      selfieImageUrl,
      nik,
      fullName,
      phoneNumber,
      province,
      cityOrRegency,
      district,
      rt,
      rw,
      postalCode
    } = parsed.data;
    const userId = auth.session.user.id;

    const submission = await prisma.kycSubmission.upsert({
      where: { userId },
      create: {
        userId,
        ktpImageUrl,
        selfieImageUrl,
        nik,
        fullName,
        phoneNumber,
        province,
        cityOrRegency,
        district,
        rt,
        rw,
        postalCode,
        status: KycStatus.PENDING,
        adminNotes: null,
        reviewedAt: null,
        reviewedBy: null
      },
      update: {
        ktpImageUrl,
        selfieImageUrl,
        nik,
        fullName,
        phoneNumber,
        province,
        cityOrRegency,
        district,
        rt,
        rw,
        postalCode,
        status: KycStatus.PENDING,
        adminNotes: null,
        reviewedAt: null,
        reviewedBy: null
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    await prisma.user.update({
      where: { id: userId },
      data: { kycStatus: KycStatus.PENDING }
    });

    return Response.json({ message: "KYC berhasil dikirim", submission }, { status: 201 });
  } catch {
    return Response.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
