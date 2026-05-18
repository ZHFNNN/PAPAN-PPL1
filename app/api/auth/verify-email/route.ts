import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token")?.trim();
  const email = url.searchParams.get("email")?.trim().toLowerCase();
  const baseUrl = process.env.NEXTAUTH_URL || url.origin;

  if (!token || !email) {
    return Response.redirect(`${baseUrl}/login?verification=invalid`, 302);
  }

  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      identifier: email,
      token,
      expires: { gt: new Date() },
    },
  });

  if (!verificationToken) {
    return Response.redirect(`${baseUrl}/login?verification=invalid`, 302);
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.deleteMany({
      where: { identifier: email, token },
    }),
  ]);

  return Response.redirect(`${baseUrl}/login?verification=success`, 302);
}