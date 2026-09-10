"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getChallenge as getLocalChallenge } from "@/lib/store/local-db";
import { getChallenge as getPgChallenge, isPostgresMode } from "@/lib/store/student-api";
import { LESSONS, QUESTIONS, TOPICS } from "@/lib/content/seed-data";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState, Skeleton } from "@/components/ui/states";
import type { Challenge } from "@/lib/types";
import { useStudyLite } from "@/components/providers/studylite-provider";

export default function ChallengeDetailPage() {
  const params = useParams<{ id: string }>();
  const { profile } = useStudyLite();
  const [challenge, setChallenge] = useState<Challenge | null | undefined>(undefined);

  useEffect(() => {
    if (isPostgresMode()) {
      void getPgChallenge(params.id).then(setChallenge);
      return;
    }
    setChallenge(getLocalChallenge(params.id));
  }, [params.id]);

  if (challenge === undefined) return <Skeleton className="h-48 w-full" />;
  if (!challenge) {
    return <ErrorState title="Challenge not found" />;
  }

  const topic = TOPICS.find((t) => t.id === challenge.topicId);
  const lesson = LESSONS.find((l) => l.id === challenge.lessonId);
  const questionCount = QUESTIONS.filter((q) => q.lessonId === challenge.lessonId).length;
  const youWon = challenge.winnerId === profile?.id;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Link href="/challenges" className="text-sm font-semibold text-slate-500">
        ← Back
      </Link>
      <Card>
        <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Challenge</p>
        <h1 className="font-display mt-2 text-3xl font-extrabold">{topic?.name}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          {questionCount} Questions · Opponent: {challenge.opponentName}
        </p>
        <p className="mt-2 font-semibold text-amber-600">Winner receives +100 XP</p>

        {challenge.status === "completed" ? (
          <div className="mt-6 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
            <p className="font-bold">
              Final score: {challenge.challengerScore} – {challenge.opponentScore}
            </p>
            <p className="mt-2 text-emerald-600 font-semibold">
              {youWon ? "You won! 🎉" : "Opponent won this round. Try again!"}
            </p>
          </div>
        ) : (
          <Link
            href={`/quiz/${lesson?.id}?challenge=${challenge.id}`}
            className="mt-6 inline-flex"
          >
            <Button size="lg">Start Challenge</Button>
          </Link>
        )}
      </Card>
    </div>
  );
}
