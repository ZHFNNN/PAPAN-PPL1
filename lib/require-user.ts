import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getCurrentUserSession() {
  return getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getCurrentUserSession();
  if (!session?.user?.id) {
    return { error: Response.json({ message: "Unauthorized" }, { status: 401 }) };
  }

  return { session };
}

export const requireUser = requireAuth;

export async function requireAdmin() {
  const auth = await requireAuth();
  if ("error" in auth) {
    return auth;
  }

  if (auth.session.user.role !== "ADMIN") {
    return { error: Response.json({ message: "Forbidden" }, { status: 403 }) };
  }

  return auth;
}
