"use client";

import { motion, useReducedMotion } from "framer-motion";
import { FadeIn, Eyebrow, Section } from "@/components/landing/shared";

export function SolutionSection() {
  const reduce = useReducedMotion();
  return (
    <Section tone="accent">
      <FadeIn>
        <Eyebrow>The solution</Eyebrow>
        <h2 className="font-display text-3xl font-extrabold sm:text-5xl">Meet StudyLite.</h2>
        <p className="mt-3 max-w-2xl text-lg font-semibold text-slate-600 dark:text-slate-300">
          A learning platform designed to turn studying into a habit.
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          StudyLite combines learning, gamification, competition and personalized feedback into one
          experience.
        </p>
      </FadeIn>

      <FadeIn delay={0.12} className="mt-12">
        <div className="relative mx-auto max-w-lg overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-emerald-900/10 dark:border-slate-700 dark:bg-slate-900 sm:p-8">
          <p className="text-lg font-bold">Welcome back, Alex 👋</p>
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="rounded-xl bg-emerald-500 px-3 py-1 text-xs font-extrabold text-white">
              Level 12
            </span>
            <span className="text-xs font-semibold text-slate-500">420 / 500 XP</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-400"
              initial={reduce ? { width: "84%" } : { width: "0%" }}
              whileInView={{ width: "84%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </div>
          <p className="mt-4 text-sm font-bold text-amber-600 dark:text-amber-400">🔥 7 day streak</p>

          <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Today&apos;s Mission</p>
            <ul className="mt-3 space-y-2 text-sm font-semibold">
              <li>✓ Complete Biology Lesson</li>
              <li className="text-slate-400">○ Take Quiz</li>
            </ul>
            <p className="mt-3 text-sm font-extrabold text-emerald-600">+100 XP</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm font-semibold">
            <div className="rounded-2xl border border-violet-200 bg-violet-50 p-3 dark:border-violet-900 dark:bg-violet-950/40">
              ⚔️ Live Battle
              <p className="mt-1 text-xs font-medium text-slate-500">Challenge a student</p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/40">
              🏆 Leaderboard
              <p className="mt-1 text-xs font-medium text-slate-500">You&apos;re #8</p>
            </div>
          </div>
        </div>
      </FadeIn>
    </Section>
  );
}

const STEPS = [
  { n: "01", title: "Join", body: "Create your StudyLite account." },
  { n: "02", title: "Choose", body: "Select your subjects and study goals." },
  { n: "03", title: "Learn", body: "Complete short, focused lessons." },
  { n: "04", title: "Challenge", body: "Test your knowledge with interactive quizzes." },
  { n: "05", title: "Level Up", body: "Earn XP, maintain streaks and unlock achievements." },
  { n: "06", title: "Compete", body: "Challenge other students and climb the leaderboard." },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works" tone="light">
      <FadeIn>
        <Eyebrow>How it works</Eyebrow>
        <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
          Your study journey starts here.
        </h2>
      </FadeIn>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((s, i) => (
          <FadeIn key={s.n} delay={i * 0.06}>
            <div className="relative h-full rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <span className="font-display text-4xl font-extrabold text-emerald-500/20">
                {s.n}
              </span>
              <h3 className="mt-2 font-display text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{s.body}</p>
              {i < STEPS.length - 1 ? (
                <span className="absolute -right-2 top-1/2 hidden text-emerald-400 lg:block">→</span>
              ) : null}
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}
