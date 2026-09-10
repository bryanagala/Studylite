import { QUESTIONS, SUBJECTS, TOPICS } from "@/lib/content/seed-data";
import type { Question } from "@/lib/types";
import {
  BATTLE_CORRECT_POINTS,
  BATTLE_MAX_SPEED_BONUS,
  BATTLE_QUESTION_COUNT,
  BATTLE_SECONDS_PER_QUESTION,
} from "@/lib/battle/constants";

export function pickBattleQuestions(subjectId: string, count = BATTLE_QUESTION_COUNT): Question[] {
  const topicIds = new Set(
    TOPICS.filter((t) => t.subjectId === subjectId).map((t) => t.id)
  );
  const pool = QUESTIONS.filter(
    (q) => topicIds.has(q.topicId) && q.questionType === "multiple_choice" && q.options.length >= 2
  );
  const fallback = QUESTIONS.filter(
    (q) => q.questionType === "multiple_choice" && q.options.length >= 2
  );
  const source = pool.length >= count ? pool : fallback;
  const shuffled = [...source].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function subjectLabel(subjectId: string) {
  return SUBJECTS.find((s) => s.id === subjectId)?.name || "Subject";
}

/** Correctness first; optional speed bonus up to +10. */
export function scoreAnswer(params: {
  isCorrect: boolean;
  responseTimeMs: number | null;
  timeLimitSec?: number;
}): number {
  if (!params.isCorrect) return 0;
  const limitMs = (params.timeLimitSec ?? BATTLE_SECONDS_PER_QUESTION) * 1000;
  const elapsed = Math.max(0, Math.min(limitMs, params.responseTimeMs ?? limitMs));
  const speedRatio = 1 - elapsed / limitMs;
  const bonus = Math.round(speedRatio * BATTLE_MAX_SPEED_BONUS);
  return BATTLE_CORRECT_POINTS + bonus;
}

export function remainingSeconds(startedAt: string | null, limitSec: number, now = Date.now()) {
  if (!startedAt) return limitSec;
  const elapsed = (now - new Date(startedAt).getTime()) / 1000;
  return Math.max(0, Math.ceil(limitSec - elapsed));
}

export function chooseBotAnswer(question: Question, accuracy = 0.72): string | null {
  if (Math.random() > accuracy) {
    const wrong = question.options.filter((o) => o !== question.correctAnswer);
    return wrong[Math.floor(Math.random() * wrong.length)] || null;
  }
  return question.correctAnswer;
}

export function botThinkDelayMs() {
  return 1500 + Math.floor(Math.random() * 5500);
}
