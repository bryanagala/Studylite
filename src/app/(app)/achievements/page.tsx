"use client";

import { AchievementCard } from "@/components/gamification/badges";
import { useStudyLite } from "@/components/providers/studylite-provider";
import { ACHIEVEMENTS } from "@/lib/content/seed-data";

export default function AchievementsPage() {
  const { achievements } = useStudyLite();
  const earnedMap = new Map(achievements.map((a) => [a.achievementId, a]));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold">Achievements</h1>
        <p className="mt-1 text-slate-500">
          {achievements.length} of {ACHIEVEMENTS.length} unlocked
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {ACHIEVEMENTS.map((ach) => {
          const earned = earnedMap.get(ach.id);
          return (
            <AchievementCard
              key={ach.id}
              name={ach.name}
              description={ach.description}
              icon={ach.icon}
              unlocked={Boolean(earned)}
              earnedAt={earned?.earnedAt}
            />
          );
        })}
      </div>
    </div>
  );
}
