import { z } from "zod";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  callbackUrl: z.string().url().optional()
});

function getSetCookies(headers: Headers): string[] {
  const anyHeaders = headers as Headers & { getSetCookie?: () => string[] };
  if (typeof anyHeaders.getSetCookie === "function") {
    return anyHeaders.getSetCookie();
  }

  const single = headers.get("set-cookie");
  return single ? [single] : [];
}

function cookieHeaderFromSetCookies(setCookies: string[]): string {
  return setCookies.map((value) => value.split(";")[0]).join("; ");
}

function mergeCookieHeaders(...parts: Array<string | null | undefined>): string {
  return parts.filter((value) => Boolean(value && value.trim())).join("; ");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { message: "Payload tidak valid", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXTAUTH_URL || new URL(request.url).origin;
    const email = parsed.data.email.trim().toLowerCase();
    const account = await prisma.user.findUnique({
      where: { email },
      select: {
        emailVerified: true,
        passwordHash: true,
      },
    });

    if (account?.passwordHash && !account.emailVerified) {
      return Response.json(
        { message: "Email belum diverifikasi. Silakan cek inbox untuk tautan verifikasi." },
        { status: 403 }
      );
    }

    const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`, {
      method: "GET",
      headers: {
        cookie: request.headers.get("cookie") || ""
      },
      redirect: "manual"
    });

    if (!csrfResponse.ok) {
      return Response.json({ message: "Gagal mendapatkan CSRF token" }, { status: 500 });
    }

    const csrfData = (await csrfResponse.json()) as { csrfToken?: string };
    if (!csrfData.csrfToken) {
      return Response.json({ message: "CSRF token tidak tersedia" }, { status: 500 });
    }

    const csrfSetCookies = getSetCookies(csrfResponse.headers);
    const csrfCookieHeader = cookieHeaderFromSetCookies(csrfSetCookies);

    const form = new URLSearchParams();
    form.set("csrfToken", csrfData.csrfToken);
    form.set("email", email);
    form.set("password", parsed.data.password);
    form.set("callbackUrl", parsed.data.callbackUrl || baseUrl);
    form.set("json", "true");

    const callbackResponse = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        cookie: mergeCookieHeaders(request.headers.get("cookie"), csrfCookieHeader)
      },
      body: form.toString(),
      redirect: "manual"
    });

    const responseText = await callbackResponse.text();
    const responseHeaders = new Headers();

    const contentType = callbackResponse.headers.get("content-type") || "application/json";
    responseHeaders.set("content-type", contentType);

    const callbackSetCookies = getSetCookies(callbackResponse.headers);
    for (const value of callbackSetCookies) {
      responseHeaders.append("set-cookie", value);
    }

    const location = callbackResponse.headers.get("location");
    if (location) {
      responseHeaders.set("location", location);
    }

    return new Response(responseText, {
      status: callbackResponse.status,
      headers: responseHeaders
    });
  } catch {
    return Response.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
