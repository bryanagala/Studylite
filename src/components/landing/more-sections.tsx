"use client";

import Link from "next/link";
import { useState } from "react";
import { FadeIn, Eyebrow, Section } from "@/components/landing/shared";
import { Button } from "@/components/ui/button";

const BADGES = [
  { icon: "🏆", name: "First Step", desc: "Complete your first lesson." },
  { icon: "🔥", name: "Streak Warrior", desc: "Keep a multi-day study streak." },
  { icon: "📚", name: "Bookworm", desc: "Finish a set of lessons." },
  { icon: "🧠", name: "Brain Builder", desc: "Answer a wave of questions." },
  { icon: "⚡", name: "Quiz Starter", desc: "Complete your first quiz." },
  { icon: "💯", name: "Perfect Score", desc: "Get 100% on a quiz." },
  { icon: "👑", name: "Scholar", desc: "Reach a higher level." },
  { icon: "⚔️", name: "Battle Winner", desc: "Win a live battle." },
];

const PROMPTS = ["Explain this", "Give me an example", "Quiz me", "Summarize", "Help with my mistake"];

export function ProgressAndTutor() {
  return (
    <Section tone="default" className="bg-slate-50 dark:bg-slate-950/40">
      <div className="grid gap-8 lg:grid-cols-2">
        <FadeIn>
          <Eyebrow>Smart progress</Eyebrow>
          <h2 className="font-display text-3xl font-extrabold">
            Know where you&apos;re strong. Know where to improve.
          </h2>
          <div className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-bold uppercase text-slate-500">Your Progress</p>
            {[
              { name: "Biology", pct: 90 },
              { name: "Mathematics", pct: 65 },
              { name: "Chemistry", pct: 80 },
            ].map((s) => (
              <div key={s.name} className="mt-4">
                <div className="mb-1 flex justify-between text-sm font-semibold">
                  <span>{s.name}</span>
                  <span>{s.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="mt-5 rounded-2xl bg-rose-50 p-4 text-sm dark:bg-rose-950/30">
              <p className="font-bold text-rose-700 dark:text-rose-300">Needs Review</p>
              <ul className="mt-2 space-y-1 font-semibold text-slate-600 dark:text-slate-300">
                <li>• Algebra</li>
                <li>• Cell Division</li>
              </ul>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Eyebrow>AI Tutor</Eyebrow>
          <h2 className="font-display text-3xl font-extrabold">
            When you&apos;re stuck, don&apos;t stop. Ask.
          </h2>
          <div className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-extrabold text-emerald-600">StudyLite AI</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-emerald-500 px-4 py-3 font-semibold text-white">
                Explain photosynthesis simply.
              </div>
              <div className="max-w-[90%] rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3 leading-relaxed text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                Think of a plant as a tiny solar-powered factory…
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {PROMPTS.map((p) => (
                <span
                  key={p}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  {p}
                </span>
              ))}
            </div>
            <Link href="/ai-tutor" className="mt-5 inline-block">
              <Button variant="secondary">Try AI Tutor</Button>
            </Link>
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}

export function AchievementsWall() {
  const [active, setActive] = useState(BADGES[5]);
  return (
    <Section tone="light">
      <FadeIn className="text-center">
        <Eyebrow>Achievements</Eyebrow>
        <h2 className="font-display text-3xl font-extrabold sm:text-4xl">Unlock proof of progress.</h2>
      </FadeIn>
      <div className="mt-10 grid gap-3 sm:grid-cols-4">
        {BADGES.map((b, i) => (
          <FadeIn key={b.name} delay={i * 0.04}>
            <button
              type="button"
              onMouseEnter={() => setActive(b)}
              onFocus={() => setActive(b)}
              className="flex h-full w-full flex-col items-center rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <span className="text-3xl">{b.icon}</span>
              <span className="mt-2 text-sm font-bold">{b.name}</span>
            </button>
          </FadeIn>
        ))}
      </div>
      <FadeIn className="mx-auto mt-6 max-w-md rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center dark:border-emerald-900 dark:bg-emerald-950/40">
        <p className="font-display text-lg font-bold">
          {active.icon} {active.name}
        </p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{active.desc}</p>
      </FadeIn>
    </Section>
  );
}

const LOOP = ["STUDY", "EARN XP", "LEVEL UP", "SEE PROGRESS", "COMPETE", "GET MOTIVATED", "STUDY AGAIN"];

export function StudyLoop() {
  return (
    <Section tone="dark">
      <FadeIn className="text-center">
        <Eyebrow>The habit loop</Eyebrow>
        <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
          One simple loop. A better study habit.
        </h2>
      </FadeIn>
      <div className="mt-12 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {LOOP.map((step, i) => (
          <FadeIn key={step} delay={i * 0.05} className="flex items-center gap-2 sm:gap-3">
            <span className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm font-extrabold text-emerald-200">
              {step}
            </span>
            {i < LOOP.length - 1 ? (
              <span className="text-slate-500" aria-hidden>
                ↓
              </span>
            ) : (
              <span className="text-amber-300" aria-hidden>
                ↺
              </span>
            )}
          </FadeIn>
        ))}
      </div>
      <FadeIn delay={0.2} className="mt-10 text-center text-lg font-semibold text-slate-300">
        That&apos;s how StudyLite turns studying into a habit.
      </FadeIn>
    </Section>
  );
}
