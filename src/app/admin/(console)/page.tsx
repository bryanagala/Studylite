import Link from "next/link";
import { getAdminCounts } from "@/lib/admin/repo";

export default async function AdminOverviewPage() {
  const counts = await getAdminCounts();

  const cards = [
    { href: "/admin/subjects", label: "Subjects", value: counts.subjects },
    { href: "/admin/topics", label: "Topics", value: counts.topics },
    { href: "/admin/lessons", label: "Lessons", value: counts.lessons },
    { href: "/admin/questions", label: "Questions", value: counts.questions },
    { href: "/admin/users", label: "Users", value: counts.users },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold text-white">Admin overview</h1>
        <p className="mt-2 text-slate-400">
          Manage StudyLite content and users on the same Railway Postgres database as the student
          app.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-3xl border border-slate-800 bg-slate-900 p-5 transition hover:border-emerald-700"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{c.label}</p>
            <p className="mt-2 font-display text-4xl font-extrabold text-emerald-400">
              {c.value}
            </p>
          </Link>
        ))}
      </div>
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-300">
        <p className="font-bold text-white">Admin access</p>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>Ensure <code className="text-emerald-400">DATABASE_URL</code> points at Railway</li>
          <li>Create an account at /admin/login (or use an existing student account)</li>
          <li>
            Promote:{" "}
            <code className="text-emerald-400">
              UPDATE profiles SET role=&apos;admin&apos; WHERE email=&apos;...&apos;;
            </code>
          </li>
          <li>
            Seeded admin (after db:seed):{" "}
            <code className="text-emerald-400">admin@studylite.app / admin1234</code>
          </li>
        </ol>
      </div>
    </div>
  );
}
