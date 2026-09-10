"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Home,
  LogOut,
  Swords,
  Trophy,
  User,
  Bot,
  Medal,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStudyLite } from "@/components/providers/studylite-provider";

const desktopLinks = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/challenges", label: "Battle", icon: Swords },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/achievements", label: "Achievements", icon: Medal },
  { href: "/ai-tutor", label: "AI Tutor", icon: Bot },
];

const mobileLinks = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/challenges", label: "Battle", icon: Swords },
  { href: "/leaderboard", label: "Board", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, profile } = useStudyLite();

  function handleLogout() {
    logout();
    router.replace("/auth/login");
  }

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200/80 bg-white/80 p-4 backdrop-blur md:flex dark:border-slate-800 dark:bg-slate-950/80">
      <Link href="/dashboard" className="mb-8 px-2">
        <span className="font-display text-2xl font-extrabold tracking-tight text-emerald-600">
          StudyLite
        </span>
        <p className="text-xs font-medium text-slate-500">Study. Level Up. Repeat.</p>
        <p className="mt-1 text-[11px] font-semibold text-emerald-600/80">
          Build the habit
        </p>
      </Link>
      <nav className="flex flex-1 flex-col gap-1">
        {desktopLinks.map((link) => {
          const Icon = link.icon;
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition",
                active
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto space-y-1 border-t border-slate-200 pt-4 dark:border-slate-800">
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
        >
          <User className="h-4 w-4" />
          {profile?.fullName.split(" ")[0] || "Profile"}
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden dark:border-slate-800 dark:bg-slate-950/95">
      <ul className="grid grid-cols-5 gap-1 py-2">
        {mobileLinks.map((link) => {
          const Icon = link.icon;
          const active = pathname.startsWith(link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-semibold",
                  active ? "text-emerald-600" : "text-slate-500"
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-24 md:px-8 md:pb-8">
          {children}
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
