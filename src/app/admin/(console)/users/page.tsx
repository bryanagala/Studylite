import { setUserRoleAction } from "@/app/admin/actions";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function AdminUsersPage() {
  const supabase = await createServerSupabaseClient();
  const { data: users } = supabase
    ? await supabase
        .from("profiles")
        .select("id, full_name, email, role, level, xp, created_at")
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold">Users</h1>
        <p className="mt-1 text-slate-400">
          Promote or demote admins. First admin must be promoted via SQL once.
        </p>
      </header>

      <div className="overflow-hidden rounded-3xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">XP</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {(users || []).map((u) => (
              <tr key={u.id} className="border-t border-slate-800">
                <td className="px-4 py-3">
                  <p className="font-semibold text-white">{u.full_name}</p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      u.role === "admin"
                        ? "rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-bold text-emerald-300"
                        : "rounded-full bg-slate-800 px-2 py-1 text-xs font-bold text-slate-300"
                    }
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-300">
                  Lv {u.level} · {u.xp} XP
                </td>
                <td className="px-4 py-3">
                  <form action={setUserRoleAction} className="flex items-center gap-2">
                    <input type="hidden" name="user_id" value={u.id} />
                    <select
                      name="role"
                      defaultValue={u.role}
                      className="h-9 rounded-xl border border-slate-700 bg-slate-950 px-2 text-xs"
                    >
                      <option value="student">student</option>
                      <option value="admin">admin</option>
                    </select>
                    <button type="submit" className="text-xs font-bold text-emerald-400">
                      Save
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users?.length ? (
          <p className="px-4 py-6 text-sm text-slate-500">No profiles found.</p>
        ) : null}
      </div>
    </div>
  );
}
