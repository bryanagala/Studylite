import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminSession } from "@/lib/supabase/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export default async function AdminConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    redirect("/admin/login?error=config");
  }
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return <AdminShell email={session.profile.email}>{children}</AdminShell>;
}
