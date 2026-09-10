import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StreakBadge } from "@/components/gamification/badges";
import { LESSONS, QUESTIONS, SUBJECTS, TOPICS } from "@/lib/content/seed-data";
import { xpProgress } from "@/lib/gamification/xp";
import { formatDuration } from "@/lib/utils";
import type {
  Achievement,
  DailyMission,
  UserAchievement,
  WeakTopic,
  WeeklyStats,
} from "@/lib/types";

export function DailyMissionCard({
  mission,
  streak,
}: {
  mission: DailyMission;
  streak: number;
}) {
  const lesson = LESSONS.find((l) => l.id === mission.lessonId);
  const topic = TOPICS.find((t) => t.id === lesson?.topicId);
  const subject = SUBJECTS.find((s) => s.id === topic?.subjectId);
  const questionCount = QUESTIONS.filter((q) => q.lessonId === mission.lessonId).length;

  return (
    <section
      aria-labelledby="todays-mission"
      className="relative overflow-hidden rounded-[2rem] border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 shadow-lg shadow-emerald-500/10 dark:border-emerald-800 dark:from-emerald-950/50 dark:via-slate-900 dark:to-slate-900 md:p-8"
    >
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-400/25 blur-3xl" />
      <div className="absolute -bottom-12 left-1/3 h-32 w-32 rounded-full bg-amber-400/15 blur-3xl" />

      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p
            id="todays-mission"
            className="text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300"
          >
            Do this now · Today&apos;s Mission
          </p>
          {!mission.completed && streak > 0 ? (
            <span className="rounded-full bg-orange-500/15 px-3 py-1 text-xs font-bold text-orange-600 dark:text-orange-400">
              🔥 Protect your {streak}-day streak
            </span>
          ) : null}
        </div>

        {mission.completed ? (
          <div className="mt-5">
            <h2 className="font-display text-3xl font-extrabold text-emerald-700 dark:text-emerald-300 md:text-4xl">
              Mission complete 🎉
            </h2>
            <p className="mt-2 max-w-md text-slate-600 dark:text-slate-300">
              Habit locked in for today. Come back tomorrow — consistency beats cramming.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/leaderboard"
                className="inline-flex h-12 items-center rounded-2xl bg-amber-500 px-6 text-sm font-bold text-white shadow-md shadow-amber-500/25"
              >
                Check the leaderboard
              </Link>
              <Link
                href="/learn"
                className="inline-flex h-12 items-center rounded-2xl bg-white/80 px-6 text-sm font-bold text-slate-900 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-white dark:ring-slate-700"
              >
                Extra practice
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <p className="text-base font-semibold text-emerald-700 dark:text-emerald-300">
              {subject?.icon} {subject?.name}
              {topic ? ` · ${topic.name}` : ""}
            </p>
            <h2 className="font-display mt-2 text-3xl font-extrabold text-slate-900 dark:text-white md:text-5xl">
              {lesson?.title}
            </h2>
            <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <span className="rounded-full bg-white/80 px-3 py-1 dark:bg-slate-800">
                {lesson?.estimatedMinutes || 5} min lesson
              </span>
              <span className="rounded-full bg-white/80 px-3 py-1 dark:bg-slate-800">
                {questionCount} questions
              </span>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                +{mission.xpReward}+ XP
              </span>
            </div>
            <p className="mt-4 max-w-lg text-sm text-slate-500">
              One short session today keeps your habit alive. Start now — it only takes a few minutes.
            </p>
            <Link
              href={`/learn/${mission.lessonId}?mission=1`}
              className="mt-6 inline-flex h-14 min-w-[12rem] items-center justify-center rounded-2xl bg-emerald-500 px-10 text-lg font-extrabold text-white shadow-xl shadow-emerald-500/35 transition hover:bg-emerald-600 hover:shadow-emerald-500/45 active:scale-[0.98]"
            >
              Start Mission
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export function StudyRecommendationCard({ topics }: { topics: WeakTopic[] }) {
  const weakest =
    topics.find((t) => t.strength === "needs_review") ||
    topics.find((t) => t.strength === "improving") ||
    null;

  if (!weakest) {
    if (topics.length === 0) {
      return (
        <Card className="border-dashed">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-400">
            🧠 Study recommendation
          </p>
          <p className="mt-3 font-semibold text-slate-600 dark:text-slate-300">
            Complete a quiz and StudyLite will detect your weakest topics.
          </p>
        </Card>
      );
    }
    return (
      <Card className="border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
          🧠 Study recommendation
        </p>
        <p className="mt-3 font-display text-2xl font-extrabold text-slate-900 dark:text-white">
          Looking strong
        </p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          No urgent weak topics right now. Keep your daily mission streak going.
        </p>
      </Card>
    );
  }

  const minutes = 5;

  return (
    <Card className="border-violet-200 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 dark:border-violet-900 dark:from-violet-950/40 dark:via-slate-900 dark:to-slate-900">
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-violet-700 dark:text-violet-300">
        🧠 Study recommendation
      </p>
      <h3 className="font-display mt-3 text-2xl font-extrabold text-slate-900 dark:text-white md:text-3xl">
        {weakest.topicName} is currently your weakest topic.
      </h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        Your accuracy: <span className="font-extrabold text-rose-600">{weakest.accuracy}%</span>
        <span className="text-slate-400"> · </span>
        {weakest.subjectName}
      </p>
      <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
        We recommend a {minutes}-minute review — StudyLite uses your quiz performance to decide what
        you should study next.
      </p>
      <Link
        href={`/learn?topic=${weakest.topicId}`}
        className="mt-5 inline-flex h-12 items-center rounded-2xl bg-violet-600 px-6 text-sm font-bold text-white shadow-lg shadow-violet-600/30 hover:bg-violet-700"
      >
        Review {weakest.topicName}
      </Link>
    </Card>
  );
}

export function StreakCard({
  streak,
  missionCompleted,
  missionLessonId,
}: {
  streak: number;
  missionCompleted: boolean;
  missionLessonId?: string;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <StreakBadge streak={streak} />
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            {missionCompleted
              ? "Habit secured for today. See you tomorrow."
              : streak > 0
                ? `Your ${streak}-day streak is waiting. One mission keeps the habit alive.`
                : "Start today's mission to begin your study habit streak."}
          </p>
        </div>
      </div>
      {!missionCompleted && missionLessonId ? (
        <Link
          href={`/learn/${missionLessonId}?mission=1`}
          className="mt-4 inline-flex h-10 items-center rounded-2xl bg-orange-500 px-4 text-sm font-bold text-white"
        >
          Protect streak
        </Link>
      ) : null}
    </Card>
  );
}

export function XPProgressCard({ xp, level }: { xp: number; level: number }) {
  const progress = xpProgress(xp);
  return (
    <Card>
      <CardTitle>Your Progress</CardTitle>
      <p className="font-display mt-3 text-2xl font-extrabold text-slate-900 dark:text-white">
        Level {level}
      </p>
      <Progress value={progress.percent} className="mt-3" />
      <p className="mt-2 text-sm font-medium text-slate-500">
        {xp.toLocaleString()} / {progress.nextLevelXp.toLocaleString()} XP
      </p>
    </Card>
  );
}

export function WeeklyStatsCard({ stats }: { stats: WeeklyStats }) {
  return (
    <Card>
      <CardTitle>This Week</CardTitle>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Stat label="📚 Study time" value={formatDuration(stats.studySeconds)} />
        <Stat label="📝 Questions" value={`${stats.questionsAnswered}`} />
        <Stat label="🎯 Accuracy" value={`${stats.accuracy}%`} />
        <Stat label="🔥 Streak" value={`${stats.streakDays} Days`} />
      </div>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/60">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

export function WeakTopicsCard({ topics }: { topics: WeakTopic[] }) {
  const ranked = [...topics].sort((a, b) => a.accuracy - b.accuracy).slice(0, 3);
  if (topics.length === 0) {
    return (
      <Card>
        <CardTitle>Topic strength</CardTitle>
        <p className="mt-3 text-sm text-slate-500">
          Quiz results unlock topic accuracy tracking.
        </p>
      </Card>
    );
  }
  return (
    <Card>
      <CardTitle>Topic strength</CardTitle>
      <ul className="mt-4 space-y-3">
        {ranked.map((topic) => (
          <li key={topic.topicId} className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">{topic.topicName}</p>
              <p className="text-xs text-slate-500">{topic.subjectName}</p>
            </div>
            <span
              className={
                topic.strength === "needs_review"
                  ? "rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700"
                  : topic.strength === "improving"
                    ? "rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700"
                    : "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700"
              }
            >
              {topic.accuracy}%{" "}
              {topic.strength === "needs_review"
                ? "🔴"
                : topic.strength === "improving"
                  ? "🟡"
                  : "🟢"}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function AchievementPreview({
  achievements,
  earned,
}: {
  achievements: Achievement[];
  earned: UserAchievement[];
}) {
  const earnedMap = new Map(earned.map((e) => [e.achievementId, e]));
  const unlocked = achievements.filter((a) => earnedMap.has(a.id)).slice(0, 4);
  const preview = unlocked.length ? unlocked : achievements.slice(0, 3);
  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardTitle>Achievements</CardTitle>
        <Link href="/achievements" className="text-sm font-semibold text-emerald-600">
          View all
        </Link>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        {preview.map((a) => (
          <div
            key={a.id}
            className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-semibold dark:bg-slate-800"
            title={a.name}
          >
            <span>{earnedMap.has(a.id) ? a.icon : "🔒"}</span>
            <span>{a.name}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
