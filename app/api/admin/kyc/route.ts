import { KycStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-user";

const ALLOWED_STATUS = ["PENDING", "APPROVED", "REJECTED"] as const;

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if ("error" in admin) {
    return admin.error;
  }

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");

  if (statusParam && statusParam !== "ALL" && !ALLOWED_STATUS.includes(statusParam as (typeof ALLOWED_STATUS)[number])) {
    return Response.json({ message: "Status filter tidak valid" }, { status: 400 });
  }

  const where =
    statusParam && statusParam !== "ALL"
      ? { status: statusParam as KycStatus }
      : undefined;

  const submissions = await prisma.kycSubmission.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(submissions);
}
