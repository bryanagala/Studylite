"use client";

import { useStudyLite } from "@/components/providers/studylite-provider";
import {
  AchievementPreview,
  DailyMissionCard,
  StreakCard,
  StudyRecommendationCard,
  WeakTopicsCard,
  WeeklyStatsCard,
  XPProgressCard,
} from "@/components/dashboard/cards";
import { ACHIEVEMENTS } from "@/lib/content/seed-data";
import { firstName, greetingForNow } from "@/lib/utils";
import { Skeleton } from "@/components/ui/states";
import Link from "next/link";

export default function DashboardPage() {
  const {
    profile,
    dailyMission,
    weeklyStats,
    weakTopics,
    achievements,
    notifications,
    leaderboard,
  } = useStudyLite();

  if (!profile || !dailyMission || !weeklyStats) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const unread = notifications.filter((n) => !n.read).slice(0, 2);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-600">
          Build the habit · one mission a day
        </p>
        <h1 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white md:text-4xl">
          {greetingForNow()}, {firstName(profile.fullName)} 👋
        </h1>
        <p className="max-w-xl text-slate-500">
          StudyLite doesn&apos;t just help you study — it helps you come back tomorrow.
        </p>
        {leaderboard ? (
          <Link
            href="/leaderboard"
            className="inline-flex text-sm font-bold text-amber-600 hover:text-amber-700"
          >
            You&apos;re #{leaderboard.yourRank}
            {leaderboard.xpToNext != null
              ? ` · only ${leaderboard.xpToNext} XP to #${leaderboard.yourRank - 1}`
              : " · holding the top spot"}
          </Link>
        ) : null}
      </header>

      {/* Mission is always the first major action */}
      <DailyMissionCard mission={dailyMission} streak={profile.currentStreak} />

      <StudyRecommendationCard topics={weakTopics} />

      {unread.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {unread.map((n) => (
            <span
              key={n.id}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              {n.message}
            </span>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <StreakCard
          streak={profile.currentStreak}
          missionCompleted={dailyMission.completed}
          missionLessonId={dailyMission.lessonId}
        />
        <XPProgressCard xp={profile.xp} level={profile.level} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <WeeklyStatsCard stats={weeklyStats} />
        <WeakTopicsCard topics={weakTopics} />
      </div>

      <AchievementPreview achievements={ACHIEVEMENTS} earned={achievements} />
    </div>
  );
}
