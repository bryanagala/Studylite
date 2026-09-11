"use client";

import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { useStudyLite } from "@/components/providers/studylite-provider";
import { FadeIn, Eyebrow, Section } from "@/components/landing/shared";
import { Button } from "@/components/ui/button";

const QUOTES = [
  "I don't just study anymore. I can actually see my progress.",
  "The streak makes me want to come back tomorrow.",
  "The battle feature makes revision much more exciting.",
];

const ROWS = [
  ["Read", "Learn + Interact"],
  ["Study alone", "Challenge others"],
  ["No visible progress", "XP + Levels"],
  ["Easy to lose motivation", "Streaks + Missions"],
  ["Find your own weaknesses", "Smart progress tracking"],
  ["Study and stop", "Study → Level Up → Repeat"],
];

export function SocialAndCompare() {
  return (
    <>
      <Section tone="light">
        <FadeIn className="text-center">
          <Eyebrow>Student experience</Eyebrow>
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
            Built around the student experience.
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            Prototype student feedback — representative demo quotes
          </p>
        </FadeIn>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {QUOTES.map((q, i) => (
            <FadeIn key={q} delay={i * 0.08}>
              <blockquote className="h-full rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold leading-relaxed text-slate-700 dark:text-slate-200">
                  “{q}”
                </p>
              </blockquote>
            </FadeIn>
          ))}
        </div>
      </Section>

      <Section tone="accent">
        <FadeIn>
          <Eyebrow>Why StudyLite</Eyebrow>
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
            More than a place to study.
          </h2>
        </FadeIn>
        <FadeIn delay={0.1} className="mt-10 overflow-hidden rounded-[2rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50 text-sm font-extrabold dark:border-slate-800 dark:bg-slate-950">
            <div className="px-4 py-4 text-slate-500 sm:px-6">Traditional Study</div>
            <div className="px-4 py-4 text-emerald-700 dark:text-emerald-300 sm:px-6">StudyLite</div>
          </div>
          {ROWS.map(([left, right]) => (
            <div
              key={left}
              className="grid grid-cols-2 border-b border-slate-100 text-sm last:border-0 dark:border-slate-800"
            >
              <div className="px-4 py-4 text-slate-500 sm:px-6">{left}</div>
              <div className="bg-emerald-50/70 px-4 py-4 font-semibold text-slate-800 dark:bg-emerald-950/20 dark:text-slate-100 sm:px-6">
                {right}
              </div>
            </div>
          ))}
        </FadeIn>
      </Section>
    </>
  );
}

export function FinalCTA() {
  const { ready, profile } = useStudyLite();
  const href =
    ready && profile
      ? profile.onboardingCompleted
        ? "/dashboard"
        : "/onboarding"
      : "/auth/register";

  return (
    <Section tone="dark" className="overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(16,185,129,0.25),transparent_55%)]" />
      <FadeIn className="relative mx-auto max-w-3xl text-center">
        <h2 className="font-display text-4xl font-extrabold sm:text-5xl">
          Your next level starts today.
        </h2>
        <p className="mt-4 text-lg text-slate-300">
          Stop waiting for motivation. Build the habit.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={href}>
            <Button size="lg" className="gap-2 shadow-xl shadow-emerald-500/30">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="#features">
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              Explore StudyLite
            </Button>
          </a>
        </div>
        <p className="mt-6 text-sm text-slate-400">
          No complicated setup. Start learning. Earn XP. Level up.
        </p>
        <p className="mt-10 font-display text-2xl font-extrabold text-white">
          StudyLite
        </p>
        <p className="mt-1 text-emerald-300">Study. Level Up. Repeat.</p>
      </FadeIn>
    </Section>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#050814] px-4 py-14 text-slate-300 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="flex items-center gap-2 font-display text-lg font-extrabold text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-white">
              <Zap className="h-4 w-4" fill="currentColor" />
            </span>
            StudyLite
          </p>
          <p className="mt-3 text-sm text-slate-400">Study. Level Up. Repeat.</p>
        </div>
        <div>
          <p className="text-sm font-extrabold text-white">Product</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href="#features" className="hover:text-white">Features</a></li>
            <li><a href="#battle" className="hover:text-white">Live Battle</a></li>
            <li><a href="#leaderboard" className="hover:text-white">Leaderboard</a></li>
            <li><Link href="/ai-tutor" className="hover:text-white">AI Tutor</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-extrabold text-white">Resources</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href="#how-it-works" className="hover:text-white">How It Works</a></li>
            <li><Link href="/achievements" className="hover:text-white">Achievements</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-extrabold text-white">Account</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/auth/login" className="hover:text-white">Login</Link></li>
            <li><Link href="/auth/register" className="hover:text-white">Get Started</Link></li>
            <li>
              <a
                href="https://github.com/bryanagala/Studylite"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white"
              >
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-12 max-w-6xl text-xs text-slate-500">
        © 2026 StudyLite. Built to make learning better.
      </p>
    </footer>
  );
}
