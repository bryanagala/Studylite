import Link from "next/link";
import { adminLogoutAction } from "@/app/admin/actions";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/subjects", label: "Subjects" },
  { href: "/admin/topics", label: "Topics" },
  { href: "/admin/lessons", label: "Lessons" },
  { href: "/admin/questions", label: "Questions" },
  { href: "/admin/users", label: "Users" },
];

export function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email: string;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col md:flex-row">
        <aside className="border-b border-slate-800 p-4 md:w-56 md:border-b-0 md:border-r">
          <Link href="/admin" className="block font-display text-xl font-extrabold text-emerald-400">
            StudyLite Admin
          </Link>
          <p className="mt-1 truncate text-xs text-slate-400">{email}</p>
          <nav className="mt-6 flex flex-wrap gap-2 md:flex-col">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-900 hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <form action={adminLogoutAction} className="mt-6">
            <button
              type="submit"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-rose-400 hover:bg-rose-950/40"
            >
              Log out
            </button>
          </form>
          <Link href="/dashboard" className="mt-3 block text-xs text-slate-500 hover:text-slate-300">
            ← Student app
          </Link>
        </aside>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
