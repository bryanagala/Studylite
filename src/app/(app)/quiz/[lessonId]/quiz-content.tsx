"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { QuizQuestion } from "@/components/quiz/quiz-question";
import { Button } from "@/components/ui/button";
import { LESSONS, QUESTIONS, TOPICS, ACHIEVEMENTS } from "@/lib/content/seed-data";
import { useStudyLite } from "@/components/providers/studylite-provider";
import { ErrorState } from "@/components/ui/states";
import { LevelUpOverlay } from "@/components/gamification/badges";
import { useToast } from "@/components/ui/toast";

function mistakeTopicsFromAnswers(
  answers: { questionId: string; selectedAnswer: string }[]
) {
  return answers
    .filter((a) => {
      const q = QUESTIONS.find((x) => x.id === a.questionId);
      return q && a.selectedAnswer !== q.correctAnswer;
    })
    .map((a) => {
      const q = QUESTIONS.find((x) => x.id === a.questionId);
      const topic = TOPICS.find((t) => t.id === q?.topicId);
      return topic?.name || "Topic";
    })
    .filter((v, i, arr) => arr.indexOf(v) === i);
}

export default function QuizPageContent() {
  const params = useParams<{ lessonId: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const { profile, submitQuiz, dailyMission } = useStudyLite();
  const { toast } = useToast();
  const isMission =
    search.get("mission") === "1" || dailyMission?.lessonId === params.lessonId;
  const isChallenge = Boolean(search.get("challenge"));
  const challengeId = search.get("challenge") || undefined;

  const questions = useMemo(
    () => QUESTIONS.filter((q) => q.lessonId === params.lessonId),
    [params.lessonId]
  );
  const lesson = LESSONS.find((l) => l.id === params.lessonId);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<
    { questionId: string; selectedAnswer: string }[]
  >([]);
  const [levelUp, setLevelUp] = useState<number | null>(null);

  if (!lesson || questions.length === 0 || !profile) {
    return (
      <ErrorState
        title="We couldn't load your quiz."
        onRetry={() => router.push("/learn")}
      />
    );
  }

  const question = questions[index];

  function submitAnswer() {
    if (!selected || submitted) return;
    setSubmitted(true);
    setAnswers((prev) => [
      ...prev.filter((a) => a.questionId !== question.id),
      { questionId: question.id, selectedAnswer: selected },
    ]);
  }

  async function goNext() {
    if (!selected) return;
    const nextAnswers = [
      ...answers.filter((a) => a.questionId !== question.id),
      { questionId: question.id, selectedAnswer: selected },
    ];

    if (index < questions.length - 1) {
      setAnswers(nextAnswers);
      setIndex((i) => i + 1);
      setSelected(null);
      setSubmitted(false);
      return;
    }

    const result = await submitQuiz({
      userId: profile!.id,
      lessonId: params.lessonId,
      answers: nextAnswers,
      isDailyMission: isMission && !isChallenge,
      isChallenge,
      challengeId,
    });

    const payload = {
      ...result.attempt,
      streakMaintained: result.streakMaintained,
      streakCount: result.currentStreak,
      mistakeTopics: mistakeTopicsFromAnswers(nextAnswers),
      newAchievements: result.newAchievements.map((ua) => {
        const ach = ACHIEVEMENTS.find((a) => a.id === ua.achievementId);
        return { name: ach?.name || "Achievement", icon: ach?.icon || "🏆" };
      }),
      leveledUp: result.leveledUp,
      newLevel: result.newLevel,
    };
    sessionStorage.setItem(
      `quiz_result_${result.attempt.id}`,
      JSON.stringify(payload)
    );
    toast("Mission rewards unlocked!");

    if (result.leveledUp) {
      setLevelUp(result.newLevel);
      sessionStorage.setItem("pending_result_id", result.attempt.id);
      return;
    }

    router.push(`/quiz/${params.lessonId}/results?attempt=${result.attempt.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <QuizQuestion
        question={question}
        index={index}
        total={questions.length}
        selected={selected}
        submitted={submitted}
        onSelect={setSelected}
      />
      <div className="mt-8 flex justify-end">
        {!submitted ? (
          <Button disabled={!selected} onClick={submitAnswer}>
            Check Answer
          </Button>
        ) : (
          <Button onClick={goNext}>
            {index === questions.length - 1 ? "See Results" : "Next Question"}
          </Button>
        )}
      </div>
      {levelUp ? (
        <LevelUpOverlay
          level={levelUp}
          onClose={() => {
            const id = sessionStorage.getItem("pending_result_id");
            setLevelUp(null);
            if (id) router.push(`/quiz/${params.lessonId}/results?attempt=${id}`);
          }}
        />
      ) : null}
    </div>
  );
}
