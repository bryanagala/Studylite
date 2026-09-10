import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function AdminOverviewPage() {
  const supabase = await createServerSupabaseClient();
  const counts = { subjects: 0, topics: 0, lessons: 0, questions: 0, users: 0 };

  if (supabase) {
    const [s, t, l, q, u] = await Promise.all([
      supabase.from("subjects").select("*", { count: "exact", head: true }),
      supabase.from("topics").select("*", { count: "exact", head: true }),
      supabase.from("lessons").select("*", { count: "exact", head: true }),
      supabase.from("questions").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
    ]);
    counts.subjects = s.count || 0;
    counts.topics = t.count || 0;
    counts.lessons = l.count || 0;
    counts.questions = q.count || 0;
    counts.users = u.count || 0;
  }

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
          Control StudyLite content in Supabase. Student demo app can keep using local seed until
          you wire content reads to the database.
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
        <p className="font-bold text-white">Setup checklist</p>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>Run <code className="text-emerald-400">supabase/schema.sql</code></li>
          <li>Run <code className="text-emerald-400">supabase/admin.sql</code></li>
          <li>Create an account at /admin/login</li>
          <li>
            Promote:{" "}
            <code className="text-emerald-400">
              update public.profiles set role=&apos;admin&apos; where email=&apos;...&apos;;
            </code>
          </li>
          <li>Optional: <code className="text-emerald-400">npm run admin:seed</code> to push seed content</li>
        </ol>
      </div>
    </div>
  );
}
