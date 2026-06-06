import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

const loginSchema = z.object({
  email: z.string().email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(6),
});

export const authOptions: NextAuthOptions = {
  // 2. TAMBAHKAN ADAPTER DI SINI
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });

        // Tambahkan pengecekan: Jika user login manual tapi akunnya dibuat dari Google (password null)
        if (!user || !user.passwordHash || !user.emailVerified) {
          return null;
        }

        const isValid = await compare(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          kycStatus: user.kycStatus,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // 'user' hanya tersedia saat pertama kali sign-in
      if (user?.id) {
        token.sub = user.id;
      }

      if (token?.sub) {
        // Karena pakai Adapter, user dari Google SEKARANG sudah ada di database,
        // jadi query pencarian ini akan berhasil menemukan role & kycStatus-nya!
        const latest = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true, kycStatus: true },
        });
        if (latest) {
          token.role = latest.role;
          token.kycStatus = latest.kycStatus;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = (token.role as string) || "USER";
        session.user.kycStatus = (token.kycStatus as string) || "NONE";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
