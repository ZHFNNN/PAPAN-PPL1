import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-user";

export async function GET() {
  const auth = await requireAuth();
  if ("error" in auth) {
    return auth.error;
  }

  const userId = auth.session.user.id;

  const submission = await prisma.kycSubmission.findUnique({
    where: { userId },
    select: {
      id: true,
      ktpImageUrl: true,
      selfieImageUrl: true,
      nik: true,
      fullName: true,
      phoneNumber: true,
      province: true,
      cityOrRegency: true,
      district: true,
      rt: true,
      rw: true,
      postalCode: true,
      status: true,
      adminNotes: true,
      reviewedAt: true,
      createdAt: true,
      updatedAt: true
    }
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { kycStatus: true }
  });

  return Response.json({
    kycStatus: user?.kycStatus ?? "NONE",
    submission
  });
}
