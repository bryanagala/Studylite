"use client";

import { useEffect, useState } from "react";
import { useStudyLite } from "@/components/providers/studylite-provider";
import { LevelBadge, StreakBadge, XPBadge } from "@/components/gamification/badges";
import { Card, CardTitle } from "@/components/ui/card";
import { ACHIEVEMENTS, SUBJECTS } from "@/lib/content/seed-data";
import { getProfileStats as getLocalProfileStats } from "@/lib/store/local-db";
import { getProfileStats as getPgProfileStats, isPostgresMode } from "@/lib/store/student-api";
import { formatDuration } from "@/lib/utils";

type ProfileStats = ReturnType<typeof getLocalProfileStats>;

export default function ProfilePage() {
  const { profile, achievements } = useStudyLite();
  const [stats, setStats] = useState<ProfileStats | null>(null);

  useEffect(() => {
    if (!profile) {
      setStats(null);
      return;
    }
    if (isPostgresMode()) {
      void getPgProfileStats(profile.id).then(setStats);
      return;
    }
    setStats(getLocalProfileStats(profile.id));
  }, [profile]);

  if (!profile || !stats) return null;

  const earned = new Set(achievements.map((a) => a.achievementId));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold">{profile.fullName}</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          <LevelBadge level={profile.level} />
          <StreakBadge streak={profile.currentStreak} />
          <XPBadge xp={profile.xp} />
        </div>
      </header>

      <Card>
        <CardTitle>Statistics</CardTitle>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Lessons" value={`${stats.lessons}`} />
          <Stat label="Questions" value={`${stats.questions}`} />
          <Stat label="Accuracy" value={`${stats.accuracy}%`} />
          <Stat label="Study Time" value={formatDuration(stats.studySeconds)} />
        </div>
      </Card>

      <Card>
        <CardTitle>Achievements</CardTitle>
        <div className="mt-4 flex flex-wrap gap-2 text-2xl">
          {ACHIEVEMENTS.map((a) => (
            <span
              key={a.id}
              title={a.name}
              className={earned.has(a.id) ? "" : "grayscale opacity-40"}
            >
              {a.icon}
            </span>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>Subjects</CardTitle>
        <ul className="mt-4 space-y-3">
          {SUBJECTS.filter(
            (s) =>
              profile.selectedSubjectIds.length === 0 ||
              profile.selectedSubjectIds.includes(s.id)
          ).map((subject) => {
            const row = stats.subjectAccuracy.find((s) => s.subjectId === subject.id);
            return (
              <li key={subject.id} className="flex items-center justify-between">
                <span className="font-semibold">
                  {subject.icon} {subject.name}
                </span>
                <span className="font-bold text-emerald-600">
                  {row && row.attempted > 0 ? `${row.accuracy}%` : "—"}
                </span>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}
