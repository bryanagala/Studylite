"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Swords } from "lucide-react";
import { useStudyLite } from "@/components/providers/studylite-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function FloatCard({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={cn(
        "absolute rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-bold text-white shadow-xl backdrop-blur-md",
        className
      )}
      animate={
        reduce
          ? undefined
          : { y: [0, -8, 0], rotate: [0, 1.5, 0] }
      }
      transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    >
      {children}
    </motion.div>
  );
}

function BattlePreview() {
  const reduce = useReducedMotion();
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-violet-500/30 via-emerald-400/20 to-amber-400/30 blur-2xl" />
      <motion.div
        className="relative overflow-hidden rounded-3xl border border-white/20 bg-[#0d1428]/90 p-5 shadow-2xl shadow-violet-900/40 backdrop-blur-xl"
        animate={reduce ? undefined : { boxShadow: ["0 0 0 0 rgba(139,92,246,0.2)", "0 0 40px 4px rgba(139,92,246,0.35)", "0 0 0 0 rgba(139,92,246,0.2)"] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-300">
            <Swords className="h-4 w-4" /> Live Battle
          </p>
          <motion.span
            className="rounded-lg bg-rose-500/20 px-2 py-1 font-mono text-sm font-bold text-rose-300"
            animate={reduce ? undefined : { opacity: [1, 0.55, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            00:07
          </motion.span>
        </div>

        <div className="mb-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
          <div>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/30 text-lg font-extrabold text-emerald-200">
              S
            </div>
            <p className="text-sm font-bold text-white">Sarah</p>
            <p className="text-xs font-semibold text-emerald-300">800 XP</p>
          </div>
          <p className="font-display text-xl font-extrabold text-violet-300">VS</p>
          <div>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/30 text-lg font-extrabold text-sky-200">
              D
            </div>
            <p className="text-sm font-bold text-white">David</p>
            <p className="text-xs font-semibold text-sky-300">720 XP</p>
          </div>
        </div>

        <p className="mb-2 text-xs font-semibold text-slate-400">Question 7 / 10</p>
        <p className="mb-3 font-semibold text-white">What is the basic unit of life?</p>
        <div className="grid gap-2">
          {["Tissue", "Cell", "Organ", "System"].map((opt, i) => (
            <div
              key={opt}
              className={cn(
                "rounded-xl border px-3 py-2 text-sm font-semibold",
                i === 1
                  ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-100"
                  : "border-white/10 bg-white/5 text-slate-200"
              )}
            >
              {String.fromCharCode(65 + i)}. {opt}
            </div>
          ))}
        </div>
      </motion.div>

      <FloatCard className="left-[-8%] top-[8%] hidden sm:block" delay={0}>
        🔥 7 Day Streak
      </FloatCard>
      <FloatCard className="right-[-6%] top-[18%] hidden sm:block" delay={0.4}>
        ⭐ +100 XP
      </FloatCard>
      <FloatCard className="bottom-[12%] left-[-4%] hidden sm:block" delay={0.8}>
        🏆 Level Up!
      </FloatCard>
      <FloatCard className="bottom-[22%] right-[-8%] hidden sm:block" delay={1.2}>
        ⚡ New Achievement
      </FloatCard>
    </div>
  );
}

export function LandingHero() {
  const { ready, profile } = useStudyLite();
  const reduce = useReducedMotion();
  const startHref =
    ready && profile
      ? profile.onboardingCompleted
        ? "/dashboard"
        : "/onboarding"
      : "/auth/register";

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-[#070b18] pb-24 pt-28 text-white sm:pt-32 lg:pb-32 lg:pt-36"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-violet-600/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-amber-400/15 blur-3xl" />
        {!reduce ? (
          <motion.div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08) 0 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
            animate={{ backgroundPosition: ["0px 0px", "28px 28px"] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
        ) : null}
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:px-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300">
            ⚡ Study. Level Up. Repeat.
          </span>
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Stop Scrolling.
            <br />
            <span className="bg-gradient-to-r from-emerald-300 via-sky-300 to-violet-300 bg-clip-text text-transparent">
              Start Leveling Up.
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-lg font-semibold text-slate-200">
            Turn studying from a chore into a challenge you&apos;re excited to win.
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
            StudyLite helps students build consistent study habits through interactive lessons,
            quizzes, XP, streaks, achievements, AI support and real-time battles.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={startHref}>
              <Button size="lg" className="gap-2 shadow-xl shadow-emerald-500/30">
                Start Your Journey <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10"
              >
                See How It Works
              </Button>
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <BattlePreview />
        </motion.div>
      </div>
    </section>
  );
}
