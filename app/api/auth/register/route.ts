import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  username: z.string().min(3).max(30),
  email: z.string().email(),
  phoneNumber: z.string().min(8).max(20),
  password: z.string().min(6),
  confirmPassword: z.string().min(6)
}).refine((data) => data.password === data.confirmPassword, {
  message: "Konfirmasi password tidak cocok",
  path: ["confirmPassword"]
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { message: "Payload tidak valid", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, username, email, phoneNumber, password } = parsed.data;

    const [existingEmail, existingUsername, existingPhone] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      prisma.user.findUnique({ where: { username } }),
      prisma.user.findUnique({ where: { phoneNumber } })
    ]);

    if (existingEmail) {
      return Response.json({ message: "Email sudah terdaftar" }, { status: 409 });
    }

    if (existingUsername) {
      return Response.json({ message: "Username sudah digunakan" }, { status: 409 });
    }

    if (existingPhone) {
      return Response.json({ message: "Nomor telepon sudah digunakan" }, { status: 409 });
    }

    const passwordHash = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username,
        name,
        email,
        phoneNumber,
        passwordHash
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phoneNumber: true,
        role: true,
        kycStatus: true
      }
    });

    return Response.json(
      {
        message: "Register berhasil",
        user
      },
      { status: 201 }
    );
  } catch {
    return Response.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
