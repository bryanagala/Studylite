"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStudyLite } from "@/components/providers/studylite-provider";
import { Card } from "@/components/ui/card";
import { EmptyState, Skeleton } from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import { SUBJECTS } from "@/lib/content/seed-data";
import { getBattleStats, sendBattleChallenge } from "@/lib/battle/service";
import { cn } from "@/lib/utils";

export default function LeaderboardPage() {
  const { leaderboard, profile, dailyMission, refresh } = useStudyLite();
  const router = useRouter();
  const [challengeFor, setChallengeFor] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [subjectId, setSubjectId] = useState(SUBJECTS[1]?.id || SUBJECTS[0].id);
  const [busy, setBusy] = useState(false);

  const stats = profile ? getBattleStats(profile.id) : null;

  if (!leaderboard || !profile) {
    return <Skeleton className="h-64 w-full" />;
  }

  const you = leaderboard.entries.find((e) => e.isCurrentUser);
  const above =
    leaderboard.yourRank > 1
      ? leaderboard.entries[leaderboard.yourRank - 2]
      : null;

  function sendChallenge() {
    if (!challengeFor) return;
    setBusy(true);
    try {
      const { battle } = sendBattleChallenge({
        senderId: profile!.id,
        receiverId: challengeFor.id,
        receiverName: challengeFor.name,
        subjectId,
      });
      refresh();
      setChallengeFor(null);
      router.push(`/challenges/battle/${battle.id}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold">🏆 Weekly Leaderboard</h1>
        <p className="mt-1 text-slate-500">
          Friendly competition that keeps the habit going. Challenge someone above you.
        </p>
      </header>

      <Card className="overflow-hidden border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-white p-0 dark:border-amber-900 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-slate-900">
        <div className="p-6 md:p-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">
            Your climb
          </p>
          <p className="font-display mt-2 text-5xl font-extrabold text-slate-900 dark:text-white md:text-6xl">
            You&apos;re #{leaderboard.yourRank}
          </p>
          {leaderboard.xpToNext != null && above ? (
            <p className="mt-3 text-lg font-semibold text-slate-700 dark:text-slate-200">
              Only{" "}
              <span className="font-extrabold text-amber-600">
                {leaderboard.xpToNext} XP
              </span>{" "}
              to reach #{leaderboard.yourRank - 1}
              <span className="text-slate-500"> ({above.fullName})</span>
            </p>
          ) : (
            <p className="mt-3 text-lg font-semibold text-emerald-600">
              You&apos;re at the top this week. Defend it with tomorrow&apos;s mission.
            </p>
          )}
          {you ? (
            <p className="mt-2 text-sm text-slate-500">
              {you.xpThisWeek.toLocaleString()} XP earned this week
            </p>
          ) : null}

          {stats && stats.total > 0 ? (
            <p className="mt-3 text-sm font-semibold text-rose-600">
              Battle Stats · {stats.wins}W / {stats.losses}L / {stats.draws}D ·{" "}
              {stats.winRate}% win rate
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/challenges"
              className="inline-flex h-12 items-center rounded-2xl bg-rose-500 px-6 text-sm font-bold text-white shadow-lg shadow-rose-500/30"
            >
              ⚔️ Open Battle Hub
            </Link>
            {dailyMission && !dailyMission.completed ? (
              <Link
                href={`/learn/${dailyMission.lessonId}?mission=1`}
                className="inline-flex h-12 items-center rounded-2xl bg-emerald-500 px-6 text-sm font-bold text-white"
              >
                Earn XP on today&apos;s mission
              </Link>
            ) : null}
          </div>
        </div>
      </Card>

      {challengeFor ? (
        <Card className="border-rose-200">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-rose-600">
            Challenge {challengeFor.name}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            10 questions · 10 sec/question · Winner +100 XP
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {SUBJECTS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSubjectId(s.id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-semibold",
                  subjectId === s.id
                    ? "bg-rose-500 text-white"
                    : "bg-slate-100 dark:bg-slate-800"
                )}
              >
                {s.icon} {s.name}
              </button>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Button disabled={busy} onClick={sendChallenge}>
              Send Challenge
            </Button>
            <Button variant="secondary" onClick={() => setChallengeFor(null)}>
              Cancel
            </Button>
          </div>
        </Card>
      ) : null}

      {leaderboard.entries.length === 0 ? (
        <EmptyState title="No rankings yet" description="Earn XP to appear on the board." />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800">
          <ul>
            {leaderboard.entries.slice(0, 20).map((entry) => (
              <li
                key={entry.userId}
                className={cn(
                  "flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 last:border-0 dark:border-slate-800",
                  entry.isCurrentUser && "bg-emerald-50 dark:bg-emerald-950/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 text-center font-extrabold text-slate-400">
                    {entry.rank}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {entry.isCurrentUser ? "You" : entry.fullName}
                    </p>
                    <p className="text-xs text-slate-500">Level {entry.level}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-amber-600">
                    {entry.xpThisWeek.toLocaleString()} XP
                  </p>
                  {!entry.isCurrentUser ? (
                    <button
                      type="button"
                      onClick={() =>
                        setChallengeFor({ id: entry.userId, name: entry.fullName })
                      }
                      className="rounded-xl bg-rose-500 px-3 py-1.5 text-xs font-bold text-white"
                    >
                      ⚔️ Challenge
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
