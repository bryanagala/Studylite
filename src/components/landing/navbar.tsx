"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, Zap } from "lucide-react";
import { useStudyLite } from "@/components/providers/studylite-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#home", label: "Home" },
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#battle", label: "Live Battle" },
  { href: "#leaderboard", label: "Leaderboard" },
  { href: "#about", label: "About" },
];

export function LandingNavbar() {
  const { ready, profile } = useStudyLite();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#home");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      const ids = LINKS.map((l) => l.href.slice(1));
      let current = "#home";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= 120) current = `#${id}`;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const primaryHref =
    ready && profile
      ? profile.onboardingCompleted
        ? "/dashboard"
        : "/onboarding"
      : "/auth/register";
  const primaryLabel =
    ready && profile
      ? profile.onboardingCompleted
        ? "Dashboard"
        : "Continue setup"
      : "Get Started";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-white/10 bg-[#070b18]/80 shadow-lg shadow-black/20 backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#home" className="flex items-center gap-2 font-display text-lg font-extrabold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/40">
            <Zap className="h-4 w-4" fill="currentColor" />
          </span>
          StudyLite
        </a>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-xl px-3 py-2 text-sm font-semibold transition",
                active === link.href
                  ? "bg-white/10 text-white"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {!(ready && profile) ? (
            <Link href="/auth/login" className="text-sm font-semibold text-slate-200 hover:text-white">
              Login
            </Link>
          ) : null}
          <Link href={primaryHref}>
            <Button size="sm" className="shadow-emerald-500/30">
              {primaryLabel}
            </Button>
          </Link>
        </div>

        <button
          type="button"
          className="rounded-xl p-2 text-white lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-[#070b18]/95 px-4 py-4 backdrop-blur-xl lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
              {!(ready && profile) ? (
                <Link href="/auth/login" onClick={() => setOpen(false)}>
                  <Button variant="secondary" className="w-full">
                    Login
                  </Button>
                </Link>
              ) : null}
              <Link href={primaryHref} onClick={() => setOpen(false)}>
                <Button className="w-full">{primaryLabel}</Button>
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
