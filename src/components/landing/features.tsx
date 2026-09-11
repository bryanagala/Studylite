"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { FadeIn, Eyebrow, Section } from "@/components/landing/shared";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FeatureMissionsXpStreaks() {
  const reduce = useReducedMotion();
  return (
    <Section id="features" tone="default" className="bg-slate-50 dark:bg-slate-950/50">
      <FadeIn>
        <Eyebrow>Features</Eyebrow>
        <h2 className="font-display max-w-2xl text-3xl font-extrabold sm:text-4xl">
          Everything you need to keep learning.
        </h2>
      </FadeIn>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        <FadeIn className="lg:col-span-1">
          <div className="h-full rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">Daily Missions</p>
            <h3 className="mt-2 font-display text-2xl font-bold">Never wonder what to study next.</h3>
            <div className="mt-6 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
              <p className="text-xs font-bold text-slate-500">TODAY&apos;S MISSION</p>
              <ul className="mt-3 space-y-2 text-sm font-semibold">
                <li>✓ Biology Lesson</li>
                <li>✓ 10 Question Quiz</li>
                <li className="text-slate-400">○ Review Weak Topic</li>
              </ul>
              <p className="mt-4 text-xs font-semibold text-slate-500">Progress</p>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <motion.div
                  className="h-full bg-emerald-500"
                  initial={reduce ? { width: "80%" } : { width: 0 }}
                  whileInView={{ width: "80%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1 }}
                />
              </div>
              <p className="mt-3 font-extrabold text-emerald-600">+150 XP</p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.08}>
          <div className="h-full rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-600">XP & Levels</p>
            <h3 className="mt-2 font-display text-2xl font-bold">Every study session moves you forward.</h3>
            <div className="mt-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-5 text-white">
              <p className="text-sm font-bold opacity-80">LEVEL 12</p>
              <p className="mt-2 font-display text-3xl font-extrabold">⚡ 420 / 500 XP</p>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/20">
                <motion.div
                  className="h-full rounded-full bg-amber-300"
                  initial={reduce ? { width: "84%" } : { width: 0 }}
                  whileInView={{ width: "84%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1 }}
                />
              </div>
              <p className="mt-3 text-sm font-semibold">Next Level: Level 13</p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.16}>
          <div className="h-full rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-bold uppercase tracking-wide text-rose-500">Streaks</p>
            <h3 className="mt-2 font-display text-2xl font-bold">Build the habit, one day at a time.</h3>
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30">
              <p className="text-center text-2xl font-extrabold text-amber-600">🔥 7 DAY STREAK</p>
              <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-bold">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <div key={`${d}-${i}`}>
                    <p className="text-slate-400">{d}</p>
                    <p className="mt-1 text-emerald-600">✓</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}

export function LiveBattleSection() {
  const reduce = useReducedMotion();
  return (
    <Section id="battle" tone="dark" className="overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.25),transparent_55%)]" />
      <FadeIn className="relative text-center">
        <Eyebrow>Live Battle</Eyebrow>
        <h2 className="font-display text-3xl font-extrabold sm:text-5xl">
          Don&apos;t just study. Battle.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-300">
          Challenge another student. Answer before the clock runs out.
        </p>
      </FadeIn>

      <div className="relative mt-14 grid items-center gap-8 lg:grid-cols-[1fr_1.2fr_1fr]">
        <FadeIn className="hidden text-center lg:block" y={0}>
          <motion.div
            initial={reduce ? false : { x: -40, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-emerald-500/20 text-4xl font-extrabold text-emerald-200 ring-4 ring-emerald-400/30"
          >
            S
          </motion.div>
          <p className="mt-3 font-display text-2xl font-bold">Sarah</p>
          <p className="text-emerald-300">800 pts</p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="relative mx-auto max-w-md overflow-hidden rounded-[2rem] border border-violet-400/30 bg-[#10182f] p-6 shadow-2xl shadow-violet-900/50">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-extrabold uppercase tracking-wider text-violet-300">
                ⚔️ Biology Battle
              </p>
              <motion.span
                className="rounded-lg bg-rose-500/20 px-2 py-1 font-mono text-sm font-bold text-rose-300"
                animate={reduce ? undefined : { scale: [1, 1.06, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ⏱ 00:07
              </motion.span>
            </div>
            <div className="mb-4 flex items-center justify-between text-sm font-bold lg:hidden">
              <span>Sarah 800</span>
              <span className="text-violet-300">VS</span>
              <span>David 720</span>
            </div>
            <p className="text-xs text-slate-400">Question 7 / 10</p>
            <p className="mt-2 text-lg font-bold">What is the basic unit of life?</p>
            <div className="mt-4 grid gap-2">
              {["Tissue", "Cell", "Organ", "System"].map((opt, i) => (
                <div
                  key={opt}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-sm font-semibold transition",
                    i === 1
                      ? "border-emerald-400 bg-emerald-500/20 text-emerald-100"
                      : "border-white/10 bg-white/5 text-slate-200"
                  )}
                >
                  {String.fromCharCode(65 + i)}. {opt}
                  {i === 1 ? " ✓" : ""}
                </div>
              ))}
            </div>
            <motion.p
              className="mt-5 text-center text-sm font-extrabold text-amber-300"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              +120 XP · Victory awaits
            </motion.p>
          </div>
        </FadeIn>

        <FadeIn className="hidden text-center lg:block" y={0}>
          <motion.div
            initial={reduce ? false : { x: 40, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-sky-500/20 text-4xl font-extrabold text-sky-200 ring-4 ring-sky-400/30"
          >
            D
          </motion.div>
          <p className="mt-3 font-display text-2xl font-bold">David</p>
          <p className="text-sky-300">720 pts</p>
        </FadeIn>
      </div>

      <FadeIn delay={0.15} className="relative mt-10 text-center">
        <Link href="/challenges">
          <Button size="lg" className="gap-2 shadow-xl shadow-emerald-500/30">
            Enter the Battle Arena <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </FadeIn>
    </Section>
  );
}

const RANKS = [
  { rank: 1, name: "Sarah", xp: "4,250 XP" },
  { rank: 2, name: "David", xp: "3,980 XP" },
  { rank: 3, name: "Alex", xp: "3,750 XP" },
  { rank: 4, name: "James", xp: "3,420 XP" },
  { rank: 5, name: "Maya", xp: "3,210 XP" },
];

export function LeaderboardPreview() {
  return (
    <Section id="leaderboard" tone="light">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <FadeIn>
          <Eyebrow>Competition</Eyebrow>
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
            A little competition never hurt.
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            Climb the weekly board, then challenge the student just above you.
          </p>
          <Link href="/leaderboard" className="mt-6 inline-block">
            <Button variant="secondary">View Leaderboard</Button>
          </Link>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-extrabold uppercase tracking-wide text-amber-600">
              🏆 Weekly Leaderboard
            </p>
            <p className="mt-1 text-xs text-slate-400">Demo rankings for illustration</p>
            <ul className="mt-5 space-y-2">
              {RANKS.map((r, i) => (
                <FadeIn key={r.name} delay={0.05 * i}>
                  <li className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold dark:bg-slate-950">
                    <span>
                      <span className="mr-3 font-extrabold text-emerald-600">{r.rank}</span>
                      {r.name}
                    </span>
                    <span className="text-slate-500">{r.xp}</span>
                  </li>
                </FadeIn>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold dark:border-emerald-900 dark:bg-emerald-950/40">
              <span>You&apos;re #8</span>
              <span className="text-emerald-700 dark:text-emerald-300">⚔️ Challenge #7</span>
            </div>
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}
