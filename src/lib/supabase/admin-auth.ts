import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AdminProfile = {
  id: string;
  full_name: string;
  email: string;
  role: "student" | "admin";
};

export async function getAdminSession(): Promise<{
  userId: string;
  profile: AdminProfile;
} | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") return null;

  return {
    userId: user.id,
    profile: profile as AdminProfile,
  };
}

export function slugifyId(prefix: string, name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `${prefix}-${base || "item"}-${Math.random().toString(36).slice(2, 7)}`;
}
