import type { XpAction } from "@/lib/types";

export const XP_VALUES: Record<XpAction, number> = {
  complete_lesson: 30,
  correct_answer: 20,
  complete_mission: 100,
  score_80: 50,
  score_100: 100,
  maintain_streak: 25,
  complete_challenge: 100,
  battle_participation: 25,
  battle_win: 100,
  battle_draw: 50,
};

/** Level N requires (N - 1) * 500 XP */
export function xpForLevel(level: number): number {
  return Math.max(0, (level - 1) * 500);
}

export function levelFromXp(xp: number): number {
  return Math.floor(xp / 500) + 1;
}

export function xpProgress(xp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressInLevel: number;
  neededForNext: number;
  percent: number;
} {
  const level = levelFromXp(xp);
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const progressInLevel = xp - currentLevelXp;
  const neededForNext = nextLevelXp - currentLevelXp;
  const percent = Math.min(100, Math.round((progressInLevel / neededForNext) * 100));
  return {
    level,
    currentLevelXp,
    nextLevelXp,
    progressInLevel,
    neededForNext,
    percent,
  };
}

export function applyXp(
  currentXp: number,
  amount: number
): { newXp: number; previousLevel: number; newLevel: number; leveledUp: boolean } {
  const previousLevel = levelFromXp(currentXp);
  const newXp = currentXp + amount;
  const newLevel = levelFromXp(newXp);
  return {
    newXp,
    previousLevel,
    newLevel,
    leveledUp: newLevel > previousLevel,
  };
}

export function quizXpBreakdown(params: {
  correctCount: number;
  totalQuestions: number;
  isDailyMission: boolean;
  streakMaintained: boolean;
}): { total: number; parts: { label: string; xp: number }[] } {
  const accuracy = params.totalQuestions
    ? (params.correctCount / params.totalQuestions) * 100
    : 0;
  const parts: { label: string; xp: number }[] = [
    {
      label: "Correct answers",
      xp: params.correctCount * XP_VALUES.correct_answer,
    },
    { label: "Lesson complete", xp: XP_VALUES.complete_lesson },
  ];

  if (params.isDailyMission) {
    parts.push({ label: "Daily mission", xp: XP_VALUES.complete_mission });
  }
  if (accuracy >= 100) {
    parts.push({ label: "Perfect score", xp: XP_VALUES.score_100 });
  } else if (accuracy >= 80) {
    parts.push({ label: "80%+ bonus", xp: XP_VALUES.score_80 });
  }
  if (params.streakMaintained) {
    parts.push({ label: "Streak bonus", xp: XP_VALUES.maintain_streak });
  }

  return {
    total: parts.reduce((sum, p) => sum + p.xp, 0),
    parts,
  };
}
