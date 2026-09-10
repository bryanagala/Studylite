"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { QuizResultView } from "@/components/quiz/quiz-result";
import { getQuizAttempt as getLocalQuizAttempt } from "@/lib/store/local-db";
import { getQuizAttempt as getPgQuizAttempt, isPostgresMode } from "@/lib/store/student-api";
import { Skeleton } from "@/components/ui/states";
import { TOPICS } from "@/lib/content/seed-data";
import { LESSONS } from "@/lib/content/seed-data";

interface StoredResult {
  id: string;
  score: number;
  totalQuestions: number;
  xpEarned: number;
  streakMaintained?: boolean;
  streakCount?: number;
  mistakeTopics?: string[];
  newAchievements?: { name: string; icon: string }[];
  leveledUp?: boolean;
  newLevel?: number;
}

export default function QuizResultsContent() {
  const params = useParams<{ lessonId: string }>();
  const search = useSearchParams();
  const attemptId = search.get("attempt");
  const [result, setResult] = useState<StoredResult | null>(null);

  useEffect(() => {
    if (!attemptId) return;
    const cached = sessionStorage.getItem(`quiz_result_${attemptId}`);
    if (cached) {
      setResult(JSON.parse(cached) as StoredResult);
      return;
    }
    void (async () => {
      const attempt = isPostgresMode()
        ? await getPgQuizAttempt(attemptId)
        : getLocalQuizAttempt(attemptId);
      if (attempt) {
        setResult({
          id: attempt.id,
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          xpEarned: attempt.xpEarned,
          streakMaintained: true,
          streakCount: 1,
          mistakeTopics: [],
          newAchievements: [],
        });
      }
    })();
  }, [attemptId]);

  if (!result) {
    return (
      <div className="space-y-4">
        <Skeleton className="mx-auto h-10 w-64" />
        <Skeleton className="mx-auto h-48 w-full max-w-lg" />
      </div>
    );
  }

  const lesson = LESSONS.find((l) => l.id === params.lessonId);
  const topic = TOPICS.find((t) => t.id === lesson?.topicId);

  return (
    <QuizResultView
      score={result.score}
      total={result.totalQuestions}
      xpEarned={result.xpEarned}
      streakCount={result.streakCount || 1}
      streakMaintained={Boolean(result.streakMaintained)}
      mistakeTopics={result.mistakeTopics || []}
      newAchievements={result.newAchievements || []}
      leveledUp={result.leveledUp}
      newLevel={result.newLevel}
      reviewHref={`/learn/${params.lessonId}`}
      reviewTopicHref={topic ? `/learn?topic=${topic.id}` : undefined}
    />
  );
}
