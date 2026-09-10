import type {
  AppNotification,
  Challenge,
  DailyMission,
  LeaderboardEntry,
  LiveBattle,
  Profile,
  QuizAttempt,
  StudyGoal,
  UserAchievement,
  WeakTopic,
  WeeklyStats,
} from "@/lib/types";

export function isPostgresMode() {
  return process.env.NEXT_PUBLIC_USE_POSTGRES === "true";
}

async function call<T>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch("/api/student", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ action, ...payload }),
  });
  const data = (await res.json()) as T & { ok?: boolean; error?: string };
  if (!res.ok) {
    throw new Error(
      (data as { error?: string }).error || `Student API failed (${res.status})`
    );
  }
  return data;
}

export type BootstrapPayload = {
  ok: true;
  profile: Profile | null;
  dailyMission: DailyMission | null;
  weeklyStats: WeeklyStats | null;
  weakTopics: WeakTopic[];
  notifications: AppNotification[];
  leaderboard: {
    entries: LeaderboardEntry[];
    yourRank: number;
    xpToNext: number | null;
  } | null;
  achievements: UserAchievement[];
  challenges: Challenge[];
};

export async function fetchBootstrap(): Promise<BootstrapPayload> {
  return call<BootstrapPayload>("bootstrap");
}

export async function registerUser(input: {
  fullName: string;
  email: string;
  password: string;
}) {
  return call<{ ok: true } | { ok: false; error: string }>("register", input);
}

export async function loginUser(input: {
  email: string;
  password: string;
  remember?: boolean;
}) {
  return call<{ ok: true } | { ok: false; error: string }>("login", {
    email: input.email,
    password: input.password,
  });
}

export async function logoutUser() {
  return call<{ ok: true }>("logout");
}

export async function completeOnboarding(input: {
  subjectIds: string[];
  studyGoal: StudyGoal;
  dailyGoalMinutes: number;
}) {
  return call<{ ok: true; profile: Profile | null }>("completeOnboarding", input);
}

export async function completeLessonSession(input: {
  lessonId: string;
  durationSeconds: number;
}) {
  return call("completeLesson", input);
}

export async function submitQuiz(input: {
  userId: string;
  lessonId: string;
  answers: { questionId: string; selectedAnswer: string }[];
  isDailyMission?: boolean;
  isChallenge?: boolean;
  challengeId?: string;
}) {
  const { userId: _userId, ...rest } = input;
  const res = await call<{ ok: true; result: ReturnTypeLocalSubmit }>("submitQuiz", rest);
  return res.result;
}

type ReturnTypeLocalSubmit = {
  attempt: QuizAttempt;
  xpAwarded: number;
  leveledUp: boolean;
  newLevel: number;
  streakMaintained: boolean;
  currentStreak: number;
  newAchievements: UserAchievement[];
};

export async function createChallenge(input: {
  userId: string;
  opponentId: string;
  opponentName: string;
  topicId: string;
}) {
  const res = await call<{ ok: true; challenge: Challenge }>("createChallenge", {
    opponentId: input.opponentId,
    opponentName: input.opponentName,
    topicId: input.topicId,
  });
  return res.challenge;
}

export async function updateProfileName(fullName: string) {
  return call<{ ok: true; profile: Profile | null }>("updateProfileName", { fullName });
}

export async function updateSettings(
  _userId: string,
  patch: Partial<Pick<Profile, "dailyGoalMinutes" | "selectedSubjectIds" | "studyGoal">>
) {
  const res = await call<{ ok: true; profile: Profile | null }>("updateSettings", { patch });
  return res.profile;
}

export async function getProfileStats(userId: string) {
  const res = await call<{ ok: true; stats: Awaited<ReturnType<typeof import("./pg-repo").getProfileStats>> }>(
    "getProfileStats",
    { userId }
  );
  return res.stats;
}

export async function getQuizAttempt(id: string) {
  const res = await call<{ ok: true; attempt: QuizAttempt | null }>("getQuizAttempt", { id });
  return res.attempt;
}

export async function getChallenge(id: string) {
  const res = await call<{ ok: true; challenge: Challenge | null }>("getChallenge", { id });
  return res.challenge;
}

export async function awardProfileXp(userId: string, amount: number) {
  const res = await call<{
    ok: true;
    result: { xpAwarded: number; leveledUp: boolean; newLevel: number };
  }>("awardProfileXp", { userId, amount });
  return res.result;
}

export async function evaluateAchievementsForUser(userId: string) {
  const res = await call<{ ok: true; newly: UserAchievement[] }>("evaluateAchievements", {
    userId,
  });
  return res.newly;
}

export async function notifyUser(
  userId: string,
  message: string,
  type: AppNotification["type"],
  meta?: AppNotification["meta"]
) {
  return call("notify", { userId, message, type, meta });
}

export async function upsertBattle(battle: LiveBattle) {
  const res = await call<{ ok: true; battle: LiveBattle }>("upsertBattle", { battle });
  return res.battle;
}

export async function getBattle(id: string) {
  const res = await call<{ ok: true; battle: LiveBattle | null }>("getBattle", { id });
  return res.battle;
}

export async function listBattles() {
  const res = await call<{ ok: true; battles: LiveBattle[] }>("listBattles");
  return res.battles;
}

export async function setBattleWinStreak(userId: string, streak: number) {
  return call("setBattleWinStreak", { userId, streak });
}

export async function getBattleWinStreak(userId: string) {
  const res = await call<{ ok: true; streak: number }>("getBattleWinStreak", { userId });
  return res.streak;
}

export { DEMO_CREDENTIALS } from "@/lib/store/local-db";
