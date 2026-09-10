import { and, desc, eq, gte, sql } from "drizzle-orm";
import {
  ACHIEVEMENTS,
  DEMO_LEADERBOARD_USERS,
  LESSONS,
  QUESTIONS,
  SUBJECTS,
  TOPICS,
} from "@/lib/content/seed-data";
import { getDb } from "@/lib/db/client";
import * as t from "@/lib/db/schema";
import { calculateStreak, classifyTopicAccuracy } from "@/lib/gamification/streaks";
import { applyXp, levelFromXp, quizXpBreakdown } from "@/lib/gamification/xp";
import type {
  AppNotification,
  Challenge,
  DailyMission,
  LeaderboardEntry,
  LiveBattle,
  Profile,
  QuestionAttempt,
  QuizAttempt,
  StoredUser,
  StudyGoal,
  StudySession,
  UserAchievement,
  WeakTopic,
  WeeklyStats,
} from "@/lib/types";
import { todayKey, uid, weekStartKey } from "@/lib/utils";

export const DEMO_CREDENTIALS = {
  email: "demo@studylite.app",
  password: "demo1234",
  fullName: "Sarah Johnson",
} as const;

const DEMO_USER_ID = "user_demo_sarah";

function profileFromRow(row: typeof t.profiles.$inferSelect): Profile {
  return {
    id: row.id,
    fullName: row.fullName,
    email: row.email,
    avatarUrl: row.avatarUrl,
    level: row.level,
    xp: row.xp,
    currentStreak: row.currentStreak,
    longestStreak: row.longestStreak,
    dailyGoalMinutes: row.dailyGoalMinutes,
    studyGoal: (row.studyGoal as StudyGoal | null) || null,
    selectedSubjectIds: (row.selectedSubjectIds as string[]) || [],
    onboardingCompleted: row.onboardingCompleted,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function userFromRow(row: typeof t.profiles.$inferSelect): StoredUser {
  return {
    id: row.id,
    email: row.email,
    password: row.password,
    profile: profileFromRow(row),
  };
}

async function insertNotification(
  userId: string,
  message: string,
  type: AppNotification["type"],
  meta?: AppNotification["meta"]
) {
  const db = getDb();
  await db.insert(t.notifications).values({
    id: uid("notif"),
    userId,
    message,
    type,
    read: false,
    meta: meta ?? null,
    createdAt: new Date(),
  });
}

export async function notifyUser(
  userId: string,
  message: string,
  type: AppNotification["type"],
  meta?: AppNotification["meta"]
) {
  await insertNotification(userId, message, type, meta);
}

async function addWeeklyXp(userId: string, amount: number) {
  const db = getDb();
  const week = weekStartKey();
  const id = `${userId}:${week}`;
  const existing = await db.query.weeklyXp.findFirst({
    where: and(eq(t.weeklyXp.userId, userId), eq(t.weeklyXp.weekStart, week)),
  });
  if (existing) {
    await db
      .update(t.weeklyXp)
      .set({ xp: existing.xp + amount })
      .where(eq(t.weeklyXp.id, existing.id));
  } else {
    await db.insert(t.weeklyXp).values({ id, userId, weekStart: week, xp: amount });
  }
}

async function markActivity(userId: string, date = todayKey()) {
  const db = getDb();
  const existing = await db.query.activityDates.findFirst({
    where: and(eq(t.activityDates.userId, userId), eq(t.activityDates.activityDate, date)),
  });
  if (!existing) {
    await db.insert(t.activityDates).values({
      id: `${userId}-${date}`,
      userId,
      activityDate: date,
    });
  }
  const dates = await db.query.activityDates.findMany({
    where: eq(t.activityDates.userId, userId),
  });
  const streak = calculateStreak(dates.map((d) => d.activityDate).sort());
  const user = await db.query.profiles.findFirst({ where: eq(t.profiles.id, userId) });
  if (user) {
    await db
      .update(t.profiles)
      .set({
        currentStreak: streak.currentStreak,
        longestStreak: Math.max(user.longestStreak, streak.longestStreak),
        updatedAt: new Date(),
      })
      .where(eq(t.profiles.id, userId));
  }
  return streak;
}

async function evaluateAchievements(userId: string) {
  const db = getDb();
  const user = await db.query.profiles.findFirst({ where: eq(t.profiles.id, userId) });
  if (!user) return [] as UserAchievement[];

  const earned = await db.query.userAchievements.findMany({
    where: eq(t.userAchievements.userId, userId),
  });
  const earnedIds = new Set(earned.map((a) => a.achievementId));

  const completed = await db.query.completedLessons.findMany({
    where: eq(t.completedLessons.userId, userId),
  });
  const quizzes = await db.query.quizAttempts.findMany({
    where: eq(t.quizAttempts.userId, userId),
  });
  const questions = await db.query.questionAttempts.findMany({
    where: eq(t.questionAttempts.userId, userId),
  });
  const battleRows = await db.query.battles.findMany();
  const battles = battleRows
    .map((b) => b.payload as LiveBattle)
    .filter(
      (b) =>
        b.status === "completed" && b.players.some((p) => p.userId === userId)
    );
  const battlesWon = battles.filter((b) => b.winnerId === userId).length;
  const streakRow = await db.query.battleWinStreaks.findFirst({
    where: eq(t.battleWinStreaks.userId, userId),
  });
  const winStreak = streakRow?.streak || 0;
  const perfectBattles = battles.filter((b) => {
    const me = b.players.find((p) => p.userId === userId);
    return me && me.correctAnswers === b.totalQuestions && me.timeouts === 0;
  }).length;

  const lessonsCompleted = completed.length;
  const quizzesCompleted = quizzes.length;
  const questionsAnswered = questions.length;
  const perfectScores = quizzes.filter((q) => q.score === q.totalQuestions).length;
  const newly: UserAchievement[] = [];

  for (const ach of ACHIEVEMENTS) {
    if (earnedIds.has(ach.id)) continue;
    let ok = false;
    switch (ach.requirementType) {
      case "lessons_completed":
        ok = lessonsCompleted >= ach.requirementValue;
        break;
      case "quizzes_completed":
        ok = quizzesCompleted >= ach.requirementValue;
        break;
      case "streak_days":
        ok = user.currentStreak >= ach.requirementValue;
        break;
      case "questions_answered":
        ok = questionsAnswered >= ach.requirementValue;
        break;
      case "perfect_score":
        ok = perfectScores >= ach.requirementValue;
        break;
      case "level_reached":
        ok = user.level >= ach.requirementValue;
        break;
      case "battles_completed":
        ok = battles.length >= ach.requirementValue;
        break;
      case "battles_won":
        ok = battlesWon >= ach.requirementValue;
        break;
      case "battle_win_streak":
        ok = winStreak >= ach.requirementValue;
        break;
      case "perfect_battle":
        ok = perfectBattles >= ach.requirementValue;
        break;
    }
    if (ok) {
      const row: UserAchievement = {
        id: uid("uach"),
        userId,
        achievementId: ach.id,
        earnedAt: new Date().toISOString(),
      };
      await db.insert(t.userAchievements).values({
        id: row.id,
        userId,
        achievementId: ach.id,
        earnedAt: new Date(),
      });
      newly.push(row);
      await insertNotification(userId, `🎉 You unlocked ${ach.name}!`, "achievement");
    }
  }
  return newly;
}

export async function getProfileById(userId: string): Promise<StoredUser | null> {
  const db = getDb();
  const row = await db.query.profiles.findFirst({ where: eq(t.profiles.id, userId) });
  return row ? userFromRow(row) : null;
}

export async function registerUser(input: {
  fullName: string;
  email: string;
  password: string;
}): Promise<{ ok: true; user: StoredUser } | { ok: false; error: string }> {
  const db = getDb();
  const email = input.email.trim().toLowerCase();
  if (!input.fullName.trim() || !email || input.password.length < 6) {
    return { ok: false, error: "Please fill all fields (password min 6 characters)." };
  }
  const existing = await db.query.profiles.findFirst({ where: eq(t.profiles.email, email) });
  if (existing) {
    return { ok: false, error: "An account with this email already exists." };
  }
  const now = new Date();
  const id = uid("user");
  await db.insert(t.profiles).values({
    id,
    fullName: input.fullName.trim(),
    email,
    password: input.password,
    level: 1,
    xp: 0,
    currentStreak: 0,
    longestStreak: 0,
    dailyGoalMinutes: 15,
    studyGoal: null,
    selectedSubjectIds: [],
    onboardingCompleted: false,
    createdAt: now,
    updatedAt: now,
  });
  await insertNotification(
    id,
    "🎯 Today's mission will be ready after onboarding.",
    "mission"
  );
  const user = await getProfileById(id);
  return { ok: true, user: user! };
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<{ ok: true; user: StoredUser } | { ok: false; error: string }> {
  const db = getDb();
  const email = input.email.trim().toLowerCase();
  const row = await db.query.profiles.findFirst({ where: eq(t.profiles.email, email) });
  if (!row || row.password !== input.password) {
    return { ok: false, error: "Invalid email or password." };
  }
  return { ok: true, user: userFromRow(row) };
}

export async function completeOnboarding(
  userId: string,
  input: {
    subjectIds: string[];
    studyGoal: StudyGoal;
    dailyGoalMinutes: number;
  }
): Promise<Profile | null> {
  const db = getDb();
  await db
    .update(t.profiles)
    .set({
      selectedSubjectIds: input.subjectIds,
      studyGoal: input.studyGoal,
      dailyGoalMinutes: input.dailyGoalMinutes,
      onboardingCompleted: true,
      updatedAt: new Date(),
    })
    .where(eq(t.profiles.id, userId));
  await ensureDailyMission(userId);
  await insertNotification(userId, "🎯 Today's mission is ready.", "mission");
  const user = await getProfileById(userId);
  return user?.profile || null;
}

export async function ensureDailyMission(userId: string): Promise<DailyMission> {
  const db = getDb();
  const today = todayKey();
  const existing = await db.query.dailyMissions.findFirst({
    where: and(eq(t.dailyMissions.userId, userId), eq(t.dailyMissions.missionDate, today)),
  });
  if (existing) {
    return {
      id: existing.id,
      userId: existing.userId,
      lessonId: existing.lessonId,
      missionDate: existing.missionDate,
      completed: existing.completed,
      xpReward: existing.xpReward,
      completedAt: existing.completedAt?.toISOString() || null,
    };
  }

  const user = await db.query.profiles.findFirst({ where: eq(t.profiles.id, userId) });
  const subjectIds =
    (user?.selectedSubjectIds as string[])?.length
      ? (user!.selectedSubjectIds as string[])
      : SUBJECTS.map((s) => s.id);
  const topicIds = TOPICS.filter((topic) => subjectIds.includes(topic.subjectId)).map(
    (topic) => topic.id
  );
  const pool = LESSONS.filter((l) => topicIds.includes(l.topicId));
  const done = await db.query.completedLessons.findMany({
    where: eq(t.completedLessons.userId, userId),
  });
  const completed = new Set(done.map((d) => d.lessonId));
  const unfinished = pool.filter((l) => !completed.has(l.id));
  const lesson =
    unfinished[Math.floor(Math.random() * Math.max(unfinished.length, 1))] ||
    pool[Math.floor(Math.random() * pool.length)] ||
    LESSONS[0];

  const mission = {
    id: uid("mission"),
    userId,
    lessonId: lesson.id,
    missionDate: today,
    completed: false,
    xpReward: 100,
    completedAt: null as Date | null,
  };
  await db.insert(t.dailyMissions).values(mission);
  return {
    ...mission,
    completedAt: null,
  };
}

export async function getDailyMission(userId: string) {
  return ensureDailyMission(userId);
}

export async function completeLessonSession(input: {
  userId: string;
  lessonId: string;
  durationSeconds: number;
}) {
  const db = getDb();
  const now = new Date();
  const session: StudySession = {
    id: uid("session"),
    userId: input.userId,
    lessonId: input.lessonId,
    startedAt: new Date(Date.now() - input.durationSeconds * 1000).toISOString(),
    completedAt: now.toISOString(),
    durationSeconds: input.durationSeconds,
  };
  await db.insert(t.studySessions).values({
    id: session.id,
    userId: session.userId,
    lessonId: session.lessonId,
    startedAt: new Date(session.startedAt),
    completedAt: now,
    durationSeconds: session.durationSeconds,
  });
  const existing = await db.query.completedLessons.findFirst({
    where: and(
      eq(t.completedLessons.userId, input.userId),
      eq(t.completedLessons.lessonId, input.lessonId)
    ),
  });
  if (!existing) {
    await db.insert(t.completedLessons).values({
      id: uid("cl"),
      userId: input.userId,
      lessonId: input.lessonId,
      completedAt: now,
    });
  }
  await evaluateAchievements(input.userId);
  return session;
}

export async function submitQuiz(input: {
  userId: string;
  lessonId: string;
  answers: { questionId: string; selectedAnswer: string }[];
  isDailyMission?: boolean;
  isChallenge?: boolean;
  challengeId?: string;
}) {
  const db = getDb();
  const user = await db.query.profiles.findFirst({
    where: eq(t.profiles.id, input.userId),
  });
  if (!user) throw new Error("User not found");

  const questionMap = new Map(QUESTIONS.map((q) => [q.id, q]));
  let correct = 0;
  const attemptId = uid("quiz");
  const now = new Date();

  const dbQuestions = await db.query.questions.findMany();
  for (const q of dbQuestions) {
    if (!questionMap.has(q.id)) {
      questionMap.set(q.id, {
        id: q.id,
        lessonId: q.lessonId,
        topicId: q.topicId,
        questionText: q.questionText,
        questionType: q.questionType as "multiple_choice" | "true_false",
        options: q.options as string[],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty as "easy" | "medium" | "hard",
      });
    }
  }

  const attemptRows: {
    id: string;
    userId: string;
    questionId: string;
    quizAttemptId: string;
    selectedAnswer: string;
    isCorrect: boolean;
    topicId: string;
    createdAt: Date;
  }[] = [];

  for (const ans of input.answers) {
    const question = questionMap.get(ans.questionId);
    if (!question) continue;
    const isCorrect = ans.selectedAnswer === question.correctAnswer;
    if (isCorrect) correct += 1;
    attemptRows.push({
      id: uid("qatt"),
      userId: input.userId,
      questionId: ans.questionId,
      quizAttemptId: attemptId,
      selectedAnswer: ans.selectedAnswer,
      isCorrect,
      topicId: question.topicId,
      createdAt: now,
    });
  }

  const priorToday = await db.query.activityDates.findFirst({
    where: and(
      eq(t.activityDates.userId, input.userId),
      eq(t.activityDates.activityDate, todayKey())
    ),
  });
  const streakMaintained = !priorToday;
  await markActivity(input.userId);

  const xpParts = quizXpBreakdown({
    correctCount: correct,
    totalQuestions: input.answers.length,
    isDailyMission: Boolean(input.isDailyMission),
    streakMaintained,
  });
  let xpAwarded = xpParts.total;
  if (input.isChallenge) xpAwarded += 100;

  const xpResult = applyXp(user.xp, xpAwarded);
  await db
    .update(t.profiles)
    .set({
      xp: xpResult.newXp,
      level: xpResult.newLevel,
      updatedAt: now,
    })
    .where(eq(t.profiles.id, input.userId));
  await addWeeklyXp(input.userId, xpAwarded);

  const attempt: QuizAttempt = {
    id: attemptId,
    userId: input.userId,
    lessonId: input.lessonId,
    score: correct,
    totalQuestions: input.answers.length,
    xpEarned: xpAwarded,
    completedAt: now.toISOString(),
  };
  await db.insert(t.quizAttempts).values({
    id: attempt.id,
    userId: attempt.userId,
    lessonId: attempt.lessonId,
    score: attempt.score,
    totalQuestions: attempt.totalQuestions,
    xpEarned: attempt.xpEarned,
    completedAt: now,
  });
  if (attemptRows.length) {
    await db.insert(t.questionAttempts).values(attemptRows);
  }

  const completedExisting = await db.query.completedLessons.findFirst({
    where: and(
      eq(t.completedLessons.userId, input.userId),
      eq(t.completedLessons.lessonId, input.lessonId)
    ),
  });
  if (!completedExisting) {
    await db.insert(t.completedLessons).values({
      id: uid("cl"),
      userId: input.userId,
      lessonId: input.lessonId,
      completedAt: now,
    });
  }

  if (input.isDailyMission) {
    const mission = await db.query.dailyMissions.findFirst({
      where: and(
        eq(t.dailyMissions.userId, input.userId),
        eq(t.dailyMissions.missionDate, todayKey()),
        eq(t.dailyMissions.lessonId, input.lessonId)
      ),
    });
    if (mission) {
      await db
        .update(t.dailyMissions)
        .set({ completed: true, completedAt: now })
        .where(eq(t.dailyMissions.id, mission.id));
    }
    if (streakMaintained) {
      const refreshed = await getProfileById(input.userId);
      await insertNotification(
        input.userId,
        `🔥 ${refreshed?.profile.currentStreak || 1}-day streak is alive!`,
        "streak"
      );
    }
  }

  if (input.isChallenge && input.challengeId) {
    const challenge = await db.query.challenges.findFirst({
      where: eq(t.challenges.id, input.challengeId),
    });
    if (challenge) {
      const opponentScore = Math.max(
        0,
        Math.min(
          input.answers.length,
          Math.floor(input.answers.length * (0.5 + Math.random() * 0.45))
        )
      );
      const winnerId =
        correct >= opponentScore ? challenge.challengerId : challenge.opponentId;
      await db
        .update(t.challenges)
        .set({
          challengerScore: correct,
          opponentScore,
          status: "completed",
          completedAt: now,
          winnerId,
        })
        .where(eq(t.challenges.id, challenge.id));
    }
  }

  const newAchievements = await evaluateAchievements(input.userId);
  if (xpResult.leveledUp) {
    await insertNotification(
      input.userId,
      `🎉 LEVEL UP! You reached Level ${xpResult.newLevel}!`,
      "achievement"
    );
  }

  const refreshed = await getProfileById(input.userId);
  return {
    attempt,
    xpAwarded,
    leveledUp: xpResult.leveledUp,
    newLevel: xpResult.newLevel,
    streakMaintained,
    currentStreak: refreshed?.profile.currentStreak || 0,
    newAchievements,
  };
}

export async function awardProfileXp(userId: string, amount: number) {
  const db = getDb();
  const user = await db.query.profiles.findFirst({ where: eq(t.profiles.id, userId) });
  if (!user || amount <= 0) return { xpAwarded: 0, leveledUp: false, newLevel: 1 };
  const xpResult = applyXp(user.xp, amount);
  await db
    .update(t.profiles)
    .set({
      xp: xpResult.newXp,
      level: xpResult.newLevel,
      updatedAt: new Date(),
    })
    .where(eq(t.profiles.id, userId));
  await addWeeklyXp(userId, amount);
  if (xpResult.leveledUp) {
    await insertNotification(
      userId,
      `🎉 LEVEL UP! You reached Level ${xpResult.newLevel}!`,
      "achievement"
    );
  }
  await evaluateAchievements(userId);
  return {
    xpAwarded: amount,
    leveledUp: xpResult.leveledUp,
    newLevel: xpResult.newLevel,
  };
}

export async function evaluateAchievementsForUser(userId: string) {
  return evaluateAchievements(userId);
}

export async function getWeakTopics(userId: string): Promise<WeakTopic[]> {
  const db = getDb();
  const attempts = await db.query.questionAttempts.findMany({
    where: eq(t.questionAttempts.userId, userId),
  });
  const byTopic = new Map<string, { attempted: number; correct: number }>();
  for (const a of attempts) {
    const row = byTopic.get(a.topicId) || { attempted: 0, correct: 0 };
    row.attempted += 1;
    if (a.isCorrect) row.correct += 1;
    byTopic.set(a.topicId, row);
  }
  const result: WeakTopic[] = [];
  for (const [topicId, stats] of byTopic) {
    const topic = TOPICS.find((x) => x.id === topicId);
    if (!topic) continue;
    const subject = SUBJECTS.find((s) => s.id === topic.subjectId);
    const accuracy = Math.round((stats.correct / stats.attempted) * 100);
    result.push({
      topicId,
      topicName: topic.name,
      subjectName: subject?.name || "",
      attempted: stats.attempted,
      correct: stats.correct,
      accuracy,
      strength: classifyTopicAccuracy(accuracy),
    });
  }
  return result.sort((a, b) => a.accuracy - b.accuracy);
}

export async function getWeeklyStats(userId: string): Promise<WeeklyStats> {
  const db = getDb();
  const start = weekStartKey();
  const sessions = await db.query.studySessions.findMany({
    where: eq(t.studySessions.userId, userId),
  });
  const weekSessions = sessions.filter(
    (s) => s.completedAt && s.completedAt.toISOString().slice(0, 10) >= start
  );
  const attempts = await db.query.questionAttempts.findMany({
    where: and(
      eq(t.questionAttempts.userId, userId),
      gte(t.questionAttempts.createdAt, new Date(`${start}T00:00:00.000Z`))
    ),
  });
  const correct = attempts.filter((a) => a.isCorrect).length;
  const user = await db.query.profiles.findFirst({ where: eq(t.profiles.id, userId) });
  return {
    studySeconds: weekSessions.reduce((sum, s) => sum + s.durationSeconds, 0),
    questionsAnswered: attempts.length,
    accuracy: attempts.length ? Math.round((correct / attempts.length) * 100) : 0,
    streakDays: user?.currentStreak || 0,
  };
}

export async function getLeaderboard(userId: string): Promise<{
  entries: LeaderboardEntry[];
  yourRank: number;
  xpToNext: number | null;
}> {
  const db = getDb();
  const week = weekStartKey();
  const user = await db.query.profiles.findFirst({ where: eq(t.profiles.id, userId) });
  const weekly = await db.query.weeklyXp.findFirst({
    where: and(eq(t.weeklyXp.userId, userId), eq(t.weeklyXp.weekStart, week)),
  });
  const yourWeekly = weekly?.xp || 0;

  const entries: LeaderboardEntry[] = DEMO_LEADERBOARD_USERS.map((d) => ({
    userId: d.id,
    fullName: d.fullName,
    xpThisWeek: d.xpThisWeek,
    level: d.level,
    rank: 0,
  }));

  if (user) {
    entries.push({
      userId: user.id,
      fullName: user.fullName,
      xpThisWeek: yourWeekly,
      level: user.level || levelFromXp(user.xp),
      rank: 0,
      isCurrentUser: true,
    });
  }

  entries.sort((a, b) => b.xpThisWeek - a.xpThisWeek);
  entries.forEach((e, i) => {
    e.rank = i + 1;
  });

  const you = entries.find((e) => e.isCurrentUser);
  const yourRank = you?.rank || entries.length;
  let xpToNext: number | null = null;
  if (you && yourRank > 1) {
    const above = entries[yourRank - 2];
    xpToNext = Math.max(0, above.xpThisWeek - you.xpThisWeek + 1);
  }

  return { entries, yourRank, xpToNext };
}

export async function getProfileStats(userId: string) {
  const db = getDb();
  const lessons = await db.query.completedLessons.findMany({
    where: eq(t.completedLessons.userId, userId),
  });
  const questions = await db.query.questionAttempts.findMany({
    where: eq(t.questionAttempts.userId, userId),
  });
  const sessions = await db.query.studySessions.findMany({
    where: eq(t.studySessions.userId, userId),
  });
  const correct = questions.filter((q) => q.isCorrect).length;
  const studySeconds = sessions.reduce((sum, s) => sum + s.durationSeconds, 0);
  const subjectAccuracy = SUBJECTS.map((subject) => {
    const topicIds = new Set(
      TOPICS.filter((topic) => topic.subjectId === subject.id).map((topic) => topic.id)
    );
    const relevant = questions.filter((q) => topicIds.has(q.topicId));
    const acc = relevant.length
      ? Math.round((relevant.filter((q) => q.isCorrect).length / relevant.length) * 100)
      : 0;
    return {
      subjectId: subject.id,
      name: subject.name,
      accuracy: acc,
      attempted: relevant.length,
    };
  });

  return {
    lessons: lessons.length,
    questions: questions.length,
    accuracy: questions.length ? Math.round((correct / questions.length) * 100) : 0,
    studySeconds,
    subjectAccuracy,
  };
}

export async function listChallenges(userId: string): Promise<Challenge[]> {
  const db = getDb();
  const rows = await db.query.challenges.findMany({
    orderBy: [desc(t.challenges.createdAt)],
  });
  return rows
    .filter((c) => c.challengerId === userId || c.opponentId === userId)
    .map((c) => ({
      id: c.id,
      challengerId: c.challengerId,
      opponentId: c.opponentId,
      opponentName: c.opponentName,
      topicId: c.topicId,
      lessonId: c.lessonId,
      status: c.status as Challenge["status"],
      challengerScore: c.challengerScore,
      opponentScore: c.opponentScore,
      winnerId: c.winnerId,
      createdAt: c.createdAt.toISOString(),
      completedAt: c.completedAt?.toISOString() || null,
    }));
}

export async function createChallenge(input: {
  userId: string;
  opponentId: string;
  opponentName: string;
  topicId: string;
}): Promise<Challenge> {
  const db = getDb();
  const lesson = LESSONS.find((l) => l.topicId === input.topicId) || LESSONS[0];
  const challenge: Challenge = {
    id: uid("chal"),
    challengerId: input.userId,
    opponentId: input.opponentId,
    opponentName: input.opponentName,
    topicId: input.topicId,
    lessonId: lesson.id,
    status: "active",
    challengerScore: null,
    opponentScore: null,
    winnerId: null,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
  await db.insert(t.challenges).values({
    id: challenge.id,
    challengerId: challenge.challengerId,
    opponentId: challenge.opponentId,
    opponentName: challenge.opponentName,
    topicId: challenge.topicId,
    lessonId: challenge.lessonId,
    status: challenge.status,
    challengerScore: null,
    opponentScore: null,
    winnerId: null,
    createdAt: new Date(),
    completedAt: null,
  });
  return challenge;
}

export async function getChallenge(id: string): Promise<Challenge | null> {
  const db = getDb();
  const c = await db.query.challenges.findFirst({ where: eq(t.challenges.id, id) });
  if (!c) return null;
  return {
    id: c.id,
    challengerId: c.challengerId,
    opponentId: c.opponentId,
    opponentName: c.opponentName,
    topicId: c.topicId,
    lessonId: c.lessonId,
    status: c.status as Challenge["status"],
    challengerScore: c.challengerScore,
    opponentScore: c.opponentScore,
    winnerId: c.winnerId,
    createdAt: c.createdAt.toISOString(),
    completedAt: c.completedAt?.toISOString() || null,
  };
}

export async function getNotifications(userId: string): Promise<AppNotification[]> {
  const db = getDb();
  const rows = await db.query.notifications.findMany({
    where: eq(t.notifications.userId, userId),
    orderBy: [desc(t.notifications.createdAt)],
    limit: 20,
  });
  return rows.map((n) => ({
    id: n.id,
    userId: n.userId,
    message: n.message,
    type: n.type as AppNotification["type"],
    read: n.read,
    createdAt: n.createdAt.toISOString(),
    meta: (n.meta as AppNotification["meta"]) || undefined,
  }));
}

export async function getQuizAttempt(id: string): Promise<QuizAttempt | null> {
  const db = getDb();
  const a = await db.query.quizAttempts.findFirst({ where: eq(t.quizAttempts.id, id) });
  if (!a) return null;
  return {
    id: a.id,
    userId: a.userId,
    lessonId: a.lessonId,
    score: a.score,
    totalQuestions: a.totalQuestions,
    xpEarned: a.xpEarned,
    completedAt: a.completedAt.toISOString(),
  };
}

export async function getQuestionAttemptsForQuiz(
  quizAttemptId: string
): Promise<QuestionAttempt[]> {
  const db = getDb();
  const rows = await db.query.questionAttempts.findMany({
    where: eq(t.questionAttempts.quizAttemptId, quizAttemptId),
  });
  return rows.map((a) => ({
    id: a.id,
    userId: a.userId,
    questionId: a.questionId,
    quizAttemptId: a.quizAttemptId,
    selectedAnswer: a.selectedAnswer,
    isCorrect: a.isCorrect,
    topicId: a.topicId,
    createdAt: a.createdAt.toISOString(),
  }));
}

export async function updateProfileName(userId: string, fullName: string) {
  const db = getDb();
  await db
    .update(t.profiles)
    .set({ fullName: fullName.trim(), updatedAt: new Date() })
    .where(eq(t.profiles.id, userId));
  const user = await getProfileById(userId);
  return user?.profile || null;
}

export async function updateSettings(
  userId: string,
  patch: Partial<Pick<Profile, "dailyGoalMinutes" | "selectedSubjectIds" | "studyGoal">>
) {
  const db = getDb();
  await db
    .update(t.profiles)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(t.profiles.id, userId));
  const user = await getProfileById(userId);
  return user?.profile || null;
}

export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  const db = getDb();
  const rows = await db.query.userAchievements.findMany({
    where: eq(t.userAchievements.userId, userId),
  });
  return rows.map((a) => ({
    id: a.id,
    userId: a.userId,
    achievementId: a.achievementId,
    earnedAt: a.earnedAt.toISOString(),
  }));
}

export async function getBootstrap(userId: string | null) {
  if (!userId) {
    return {
      profile: null,
      dailyMission: null,
      weeklyStats: null,
      weakTopics: [] as WeakTopic[],
      notifications: [] as AppNotification[],
      leaderboard: null,
      achievements: [] as UserAchievement[],
      challenges: [] as Challenge[],
    };
  }
  const user = await getProfileById(userId);
  if (!user) {
    return {
      profile: null,
      dailyMission: null,
      weeklyStats: null,
      weakTopics: [] as WeakTopic[],
      notifications: [] as AppNotification[],
      leaderboard: null,
      achievements: [] as UserAchievement[],
      challenges: [] as Challenge[],
    };
  }
  const [
    dailyMission,
    weeklyStats,
    weakTopics,
    notifications,
    leaderboard,
    achievements,
    challenges,
  ] = await Promise.all([
    user.profile.onboardingCompleted ? getDailyMission(userId) : Promise.resolve(null),
    getWeeklyStats(userId),
    getWeakTopics(userId),
    getNotifications(userId),
    getLeaderboard(userId),
    getUserAchievements(userId),
    listChallenges(userId),
  ]);
  return {
    profile: user.profile,
    dailyMission,
    weeklyStats,
    weakTopics,
    notifications,
    leaderboard,
    achievements,
    challenges,
  };
}

export async function getContentCatalog() {
  const db = getDb();
  const [subjects, topics, lessons, questions, achievements] = await Promise.all([
    db.query.subjects.findMany(),
    db.query.topics.findMany(),
    db.query.lessons.findMany(),
    db.query.questions.findMany(),
    db.query.achievements.findMany(),
  ]);
  if (!subjects.length) {
    return {
      subjects: SUBJECTS,
      topics: TOPICS,
      lessons: LESSONS,
      questions: QUESTIONS,
      achievements: ACHIEVEMENTS,
      source: "seed" as const,
    };
  }
  return {
    subjects: subjects.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      icon: s.icon,
    })),
    topics: topics.map((x) => ({
      id: x.id,
      subjectId: x.subjectId,
      name: x.name,
      description: x.description,
    })),
    lessons: lessons.map((l) => ({
      id: l.id,
      topicId: l.topicId,
      title: l.title,
      content: l.content as (typeof LESSONS)[number]["content"],
      estimatedMinutes: l.estimatedMinutes,
      difficulty: l.difficulty as (typeof LESSONS)[number]["difficulty"],
    })),
    questions: questions.map((q) => ({
      id: q.id,
      lessonId: q.lessonId,
      topicId: q.topicId,
      questionText: q.questionText,
      questionType: q.questionType as (typeof QUESTIONS)[number]["questionType"],
      options: q.options as string[],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty as (typeof QUESTIONS)[number]["difficulty"],
    })),
    achievements: achievements.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      icon: a.icon,
      requirementType: a.requirementType as (typeof ACHIEVEMENTS)[number]["requirementType"],
      requirementValue: a.requirementValue,
    })),
    source: "postgres" as const,
  };
}

/** Upsert a live battle payload (used by battle service via API). */
export async function upsertBattle(battle: LiveBattle) {
  const db = getDb();
  const existing = await db.query.battles.findFirst({
    where: eq(t.battles.id, battle.id),
  });
  if (existing) {
    await db
      .update(t.battles)
      .set({
        payload: battle,
        status: battle.status,
        updatedAt: new Date(),
      })
      .where(eq(t.battles.id, battle.id));
  } else {
    await db.insert(t.battles).values({
      id: battle.id,
      payload: battle,
      status: battle.status,
      createdBy: battle.createdBy,
      createdAt: new Date(battle.createdAt),
      updatedAt: new Date(),
    });
  }
  return battle;
}

export async function getBattle(id: string): Promise<LiveBattle | null> {
  const db = getDb();
  const row = await db.query.battles.findFirst({ where: eq(t.battles.id, id) });
  return row ? (row.payload as LiveBattle) : null;
}

export async function listBattles(): Promise<LiveBattle[]> {
  const db = getDb();
  const rows = await db.query.battles.findMany({
    orderBy: [desc(t.battles.createdAt)],
  });
  return rows.map((r) => r.payload as LiveBattle);
}

export async function setBattleWinStreak(userId: string, streak: number) {
  const db = getDb();
  const existing = await db.query.battleWinStreaks.findFirst({
    where: eq(t.battleWinStreaks.userId, userId),
  });
  if (existing) {
    await db
      .update(t.battleWinStreaks)
      .set({ streak })
      .where(eq(t.battleWinStreaks.userId, userId));
  } else {
    await db.insert(t.battleWinStreaks).values({ userId, streak });
  }
}

export async function getBattleWinStreak(userId: string) {
  const db = getDb();
  const row = await db.query.battleWinStreaks.findFirst({
    where: eq(t.battleWinStreaks.userId, userId),
  });
  return row?.streak || 0;
}

export async function healthCheck() {
  const db = getDb();
  await db.execute(sql`select 1`);
  return { ok: true as const };
}

export { DEMO_USER_ID };
