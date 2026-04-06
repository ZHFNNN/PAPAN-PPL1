import { KycStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-user";

export async function GET() {
  const admin = await requireAdmin();
  if ("error" in admin) {
    return admin.error;
  }

  const pending = await prisma.kycSubmission.findMany({
    where: { status: KycStatus.PENDING },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: "asc" }
  });

  return Response.json({ data: pending });
}
