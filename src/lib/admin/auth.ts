import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";

export const ADMIN_SESSION_COOKIE = "studylite_uid";

export type AdminProfile = {
  id: string;
  full_name: string;
  email: string;
  role: "student" | "admin";
};

export function slugifyId(prefix: string, name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `${prefix}-${base || "item"}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function setAdminSessionCookie(userId: string | null) {
  const jar = await cookies();
  if (!userId) {
    jar.delete(ADMIN_SESSION_COOKIE);
    return;
  }
  jar.set(ADMIN_SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getAdminSession(): Promise<{
  userId: string;
  profile: AdminProfile;
} | null> {
  if (!isDatabaseConfigured()) return null;
  const jar = await cookies();
  const userId = jar.get(ADMIN_SESSION_COOKIE)?.value;
  if (!userId) return null;

  const db = getDb();
  const row = await db.query.profiles.findFirst({
    where: eq(profiles.id, userId),
  });
  if (!row || row.role !== "admin") return null;

  return {
    userId: row.id,
    profile: {
      id: row.id,
      full_name: row.fullName,
      email: row.email,
      role: "admin",
    },
  };
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}
