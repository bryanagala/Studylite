"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export interface ResultAchievement {
  name: string;
  icon: string;
}

export function QuizResultView({
  score,
  total,
  xpEarned,
  streakCount,
  streakMaintained,
  mistakeTopics,
  newAchievements = [],
  leveledUp,
  newLevel,
  reviewHref,
  reviewTopicHref,
}: {
  score: number;
  total: number;
  xpEarned: number;
  streakCount: number;
  streakMaintained: boolean;
  mistakeTopics: string[];
  newAchievements?: ResultAchievement[];
  leveledUp?: boolean;
  newLevel?: number;
  reviewHref?: string;
  reviewTopicHref?: string;
}) {
  const accuracy = total ? Math.round((score / total) * 100) : 0;
  const perfect = score === total && total > 0;

  const beats = [
    {
      key: "title",
      delay: 0,
      node: perfect ? (
        <p className="font-display text-4xl font-extrabold text-amber-500 md:text-5xl">
          PERFECT SCORE! 💯
        </p>
      ) : (
        <p className="font-display text-4xl font-extrabold text-emerald-600 md:text-5xl">
          MISSION COMPLETE 🎉
        </p>
      ),
    },
    {
      key: "xp",
      delay: 0.15,
      node: (
        <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 px-6 py-5 dark:border-amber-900 dark:from-amber-950/40 dark:to-orange-950/30">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">
            Reward
          </p>
          <p className="font-display mt-1 text-5xl font-extrabold text-amber-500">
            +{xpEarned} XP
          </p>
          <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            Score {score}/{total} · {accuracy}% accuracy
          </p>
        </div>
      ),
    },
    {
      key: "streak",
      delay: 0.3,
      node: (
        <div className="rounded-3xl border border-orange-200 bg-orange-50 px-6 py-4 dark:border-orange-900 dark:bg-orange-950/30">
          <p className="font-display text-2xl font-extrabold text-orange-600 dark:text-orange-400">
            🔥 {Math.max(streakCount, 1)} DAY STREAK
          </p>
          <p className="mt-1 text-sm text-orange-800/80 dark:text-orange-200/80">
            {streakMaintained
              ? "Habit protected. Come back tomorrow to keep it growing."
              : "Streak updated. Consistency is the real win."}
          </p>
        </div>
      ),
    },
  ] as const;

  return (
    <div className="mx-auto max-w-lg space-y-4 text-center">
      {beats.map((beat) => (
        <motion.div
          key={beat.key}
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: beat.delay, duration: 0.35, ease: "easeOut" }}
        >
          {beat.node}
        </motion.div>
      ))}

      {leveledUp && newLevel ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-4 dark:border-emerald-900 dark:bg-emerald-950/30"
        >
          <p className="font-display text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">
            🎉 LEVEL UP · Level {newLevel}
          </p>
        </motion.div>
      ) : null}

      {newAchievements.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="rounded-3xl border border-violet-200 bg-violet-50 px-6 py-4 dark:border-violet-900 dark:bg-violet-950/30"
        >
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-violet-700 dark:text-violet-300">
            🏆 New achievement
          </p>
          <ul className="mt-3 space-y-2">
            {newAchievements.map((a) => (
              <li
                key={a.name}
                className="font-display text-xl font-extrabold text-slate-900 dark:text-white"
              >
                {a.icon} {a.name}
              </li>
            ))}
          </ul>
        </motion.div>
      ) : null}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-3 gap-3 text-sm"
      >
        <Stat label="Correct" value={`${score}`} />
        <Stat label="Incorrect" value={`${total - score}`} />
        <Stat label="Accuracy" value={`${accuracy}%`} />
      </motion.div>

      {mistakeTopics.length > 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-left dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Topics to Review
          </p>
          <ul className="mt-2 space-y-1">
            {mistakeTopics.map((t) => (
              <li key={t} className="font-semibold text-slate-800 dark:text-slate-200">
                {t}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="text-sm font-medium text-slate-500">
        Progress that feels good today — a habit that brings you back tomorrow.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/dashboard"
          className="inline-flex h-12 items-center justify-center rounded-2xl bg-emerald-500 px-6 text-sm font-bold text-white shadow-lg shadow-emerald-500/30"
        >
          Back to Dashboard
        </Link>
        <Link
          href="/leaderboard"
          className="inline-flex h-12 items-center justify-center rounded-2xl bg-amber-500 px-6 text-sm font-bold text-white"
        >
          View Leaderboard
        </Link>
        {reviewTopicHref || reviewHref ? (
          <Link
            href={reviewTopicHref || reviewHref || "/learn"}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-bold text-white dark:bg-white dark:text-slate-900"
          >
            Review Mistakes
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}
