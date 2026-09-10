import {
  ACHIEVEMENTS,
  DEMO_LEADERBOARD_USERS,
  LESSONS,
  QUESTIONS,
  SUBJECTS,
  TOPICS,
} from "@/lib/content/seed-data";
import { calculateStreak, classifyTopicAccuracy } from "@/lib/gamification/streaks";
import { applyXp, levelFromXp, quizXpBreakdown } from "@/lib/gamification/xp";
import type {
  AppNotification,
  BattleInvite,
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

const STORAGE_KEY = "studylite_v1";

/** Demo login for local MVP testing */
export const DEMO_CREDENTIALS = {
  email: "demo@studylite.app",
  password: "demo1234",
  fullName: "Sarah Johnson",
} as const;

const DEMO_USER_ID = "user_demo_sarah";

export interface StudyLiteDB {
  users: StoredUser[];
  sessionUserId: string | null;
  quizAttempts: QuizAttempt[];
  questionAttempts: QuestionAttempt[];
  dailyMissions: DailyMission[];
  userAchievements: UserAchievement[];
  studySessions: StudySession[];
  challenges: Challenge[];
  notifications: AppNotification[];
  weeklyXp: Record<string, number>; // `${userId}:${weekStart}`
  activityDates: Record<string, string[]>; // userId -> YYYY-MM-DD[]
  completedLessons: Record<string, string[]>; // userId -> lessonIds
  battles: LiveBattle[];
  battleInvites: BattleInvite[];
  battleWinStreaks: Record<string, number>;
}

function emptyDb(): StudyLiteDB {
  return {
    users: [],
    sessionUserId: null,
    quizAttempts: [],
    questionAttempts: [],
    dailyMissions: [],
    userAchievements: [],
    studySessions: [],
    challenges: [],
    notifications: [],
    weeklyXp: {},
    activityDates: {},
    completedLessons: {},
    battles: [],
    battleInvites: [],
    battleWinStreaks: {},
  };
}

function createDemoUser(): StoredUser {
  const now = new Date().toISOString();
  return {
    id: DEMO_USER_ID,
    email: DEMO_CREDENTIALS.email,
    password: DEMO_CREDENTIALS.password,
    profile: {
      id: DEMO_USER_ID,
      fullName: DEMO_CREDENTIALS.fullName,
      email: DEMO_CREDENTIALS.email,
      avatarUrl: null,
      level: 6,
      xp: 1080,
      currentStreak: 3,
      longestStreak: 7,
      dailyGoalMinutes: 15,
      studyGoal: "build_habit",
      selectedSubjectIds: SUBJECTS.map((s) => s.id),
      onboardingCompleted: true,
      createdAt: now,
      updatedAt: now,
    },
  };
}

/** Ensures the demo account exists so login works without registering. */
export function ensureDemoUser(db: StudyLiteDB): StudyLiteDB {
  const exists = db.users.some(
    (u) => u.email === DEMO_CREDENTIALS.email || u.id === DEMO_USER_ID
  );
  if (!exists) {
    const user = createDemoUser();
    db.users.push(user);
    // Streak through yesterday so today's mission still matters
    db.activityDates[DEMO_USER_ID] = [
      todayKey(new Date(Date.now() - 3 * 86400000)),
      todayKey(new Date(Date.now() - 2 * 86400000)),
      todayKey(new Date(Date.now() - 86400000)),
    ];
    user.profile.currentStreak = 3;
    db.completedLessons[DEMO_USER_ID] = [
      "lesson-bio-intro-cells",
      "lesson-math-variables",
      "lesson-bio-intro-genetics",
    ];
    db.weeklyXp[`${DEMO_USER_ID}:${weekStartKey()}`] = 980;
    seedDemoWeakTopics(db);
    pushNotification(
      db,
      DEMO_USER_ID,
      "🎯 Today's mission is ready.",
      "mission"
    );
    pushNotification(
      db,
      DEMO_USER_ID,
      "🔥 Your 3-day streak is waiting — keep it alive!",
      "streak"
    );
    saveDb(db);
    return db;
  }

  // Backfill recommendation data for older demo saves
  const hasGeneticsAttempts = db.questionAttempts.some(
    (a) => a.userId === DEMO_USER_ID && a.topicId === "topic-bio-genetics"
  );
  if (!hasGeneticsAttempts) {
    seedDemoWeakTopics(db);
    saveDb(db);
  }
  return db;
}

/** Seed ~54% Genetics accuracy so the study recommendation is demo-ready. */
function seedDemoWeakTopics(db: StudyLiteDB) {
  const geneticsQuestions = QUESTIONS.filter((q) => q.topicId === "topic-bio-genetics");
  const cellQuestions = QUESTIONS.filter((q) => q.topicId === "topic-bio-cells").slice(0, 6);
  const now = new Date().toISOString();
  const quizId = uid("quiz");

  // 7 correct / 13 attempts ≈ 54%
  const geneticsCorrectFlags = [
    false,
    false,
    true,
    false,
    true,
    true,
    false,
    true,
    true,
    false,
    true,
    false,
    true,
  ];

  geneticsCorrectFlags.forEach((isCorrect, i) => {
    const q = geneticsQuestions[i % geneticsQuestions.length];
    db.questionAttempts.push({
      id: uid("qatt"),
      userId: DEMO_USER_ID,
      questionId: q.id,
      quizAttemptId: quizId,
      selectedAnswer: isCorrect
        ? q.correctAnswer
        : q.options.find((o) => o !== q.correctAnswer) || "",
      isCorrect,
      topicId: q.topicId,
      createdAt: now,
    });
  });

  cellQuestions.forEach((q, i) => {
    const isCorrect = i !== 0;
    db.questionAttempts.push({
      id: uid("qatt"),
      userId: DEMO_USER_ID,
      questionId: q.id,
      quizAttemptId: `${quizId}_cells`,
      selectedAnswer: isCorrect
        ? q.correctAnswer
        : q.options.find((o) => o !== q.correctAnswer) || "",
      isCorrect,
      topicId: q.topicId,
      createdAt: now,
    });
  });

  db.quizAttempts.push({
    id: quizId,
    userId: DEMO_USER_ID,
    lessonId: "lesson-bio-intro-genetics",
    score: 7,
    totalQuestions: 13,
    xpEarned: 120,
    completedAt: now,
  });
}

export function loadDb(): StudyLiteDB {
  if (typeof window === "undefined") return emptyDb();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const db = raw
      ? { ...emptyDb(), ...(JSON.parse(raw) as StudyLiteDB) }
      : emptyDb();
    if (!db.battles) db.battles = [];
    if (!db.battleInvites) db.battleInvites = [];
    if (!db.battleWinStreaks) db.battleWinStreaks = {};
    return ensureDemoUser(db);
  } catch {
    return ensureDemoUser(emptyDb());
  }
}

export function saveDb(db: StudyLiteDB) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function pushNotification(
  db: StudyLiteDB,
  userId: string,
  message: string,
  type: AppNotification["type"],
  meta?: AppNotification["meta"]
) {
  db.notifications.unshift({
    id: uid("notif"),
    userId,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString(),
    meta,
  });
}

function addWeeklyXp(db: StudyLiteDB, userId: string, amount: number) {
  const key = `${userId}:${weekStartKey()}`;
  db.weeklyXp[key] = (db.weeklyXp[key] || 0) + amount;
}

function markActivity(db: StudyLiteDB, userId: string, date = todayKey()) {
  const list = new Set(db.activityDates[userId] || []);
  list.add(date);
  db.activityDates[userId] = [...list].sort();
  const streak = calculateStreak(db.activityDates[userId]);
  const user = db.users.find((u) => u.id === userId);
  if (user) {
    user.profile.currentStreak = streak.currentStreak;
    user.profile.longestStreak = Math.max(
      user.profile.longestStreak,
      streak.longestStreak
    );
    user.profile.updatedAt = new Date().toISOString();
  }
  return streak;
}

function evaluateAchievements(db: StudyLiteDB, userId: string) {
  const user = db.users.find((u) => u.id === userId);
  if (!user) return [] as UserAchievement[];

  const earnedIds = new Set(
    db.userAchievements.filter((a) => a.userId === userId).map((a) => a.achievementId)
  );
  const lessonsCompleted = (db.completedLessons[userId] || []).length;
  const quizzesCompleted = db.quizAttempts.filter((q) => q.userId === userId).length;
  const questionsAnswered = db.questionAttempts.filter((q) => q.userId === userId).length;
  const perfectScores = db.quizAttempts.filter(
    (q) => q.userId === userId && q.score === q.totalQuestions
  ).length;
  const completedBattles = (db.battles || []).filter(
    (b) =>
      b.status === "completed" &&
      b.players.some((p) => p.userId === userId)
  );
  const battlesWon = completedBattles.filter((b) => b.winnerId === userId).length;
  const winStreak = db.battleWinStreaks?.[userId] || 0;
  const perfectBattles = completedBattles.filter((b) => {
    const me = b.players.find((p) => p.userId === userId);
    return me && me.correctAnswers === b.totalQuestions && me.timeouts === 0;
  }).length;
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
        ok = user.profile.currentStreak >= ach.requirementValue;
        break;
      case "questions_answered":
        ok = questionsAnswered >= ach.requirementValue;
        break;
      case "perfect_score":
        ok = perfectScores >= ach.requirementValue;
        break;
      case "level_reached":
        ok = user.profile.level >= ach.requirementValue;
        break;
      case "battles_completed":
        ok = completedBattles.length >= ach.requirementValue;
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
      db.userAchievements.push(row);
      newly.push(row);
      pushNotification(
        db,
        userId,
        `🎉 You unlocked ${ach.name}!`,
        "achievement"
      );
    }
  }
  return newly;
}

export function evaluateAchievementsForUser(userId: string) {
  const db = loadDb();
  const newly = evaluateAchievements(db, userId);
  saveDb(db);
  return newly;
}

export function awardProfileXp(userId: string, amount: number) {
  const db = loadDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user || amount <= 0) return { xpAwarded: 0, leveledUp: false, newLevel: 1 };
  const xpResult = applyXp(user.profile.xp, amount);
  user.profile.xp = xpResult.newXp;
  user.profile.level = xpResult.newLevel;
  user.profile.updatedAt = new Date().toISOString();
  addWeeklyXp(db, userId, amount);
  if (xpResult.leveledUp) {
    pushNotification(
      db,
      userId,
      `🎉 LEVEL UP! You reached Level ${xpResult.newLevel}!`,
      "achievement"
    );
  }
  evaluateAchievements(db, userId);
  saveDb(db);
  return {
    xpAwarded: amount,
    leveledUp: xpResult.leveledUp,
    newLevel: xpResult.newLevel,
  };
}

export function registerUser(input: {
  fullName: string;
  email: string;
  password: string;
}): { ok: true; user: StoredUser } | { ok: false; error: string } {
  const db = loadDb();
  const email = input.email.trim().toLowerCase();
  if (!input.fullName.trim() || !email || input.password.length < 6) {
    return { ok: false, error: "Please fill all fields (password min 6 characters)." };
  }
  if (db.users.some((u) => u.email === email)) {
    return { ok: false, error: "An account with this email already exists." };
  }
  const now = new Date().toISOString();
  const id = uid("user");
  const user: StoredUser = {
    id,
    email,
    password: input.password,
    profile: {
      id,
      fullName: input.fullName.trim(),
      email,
      avatarUrl: null,
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
    },
  };
  db.users.push(user);
  db.sessionUserId = id;
  db.activityDates[id] = [];
  db.completedLessons[id] = [];
  pushNotification(db, id, "🎯 Today's mission will be ready after onboarding.", "mission");
  saveDb(db);
  return { ok: true, user };
}

export function loginUser(input: {
  email: string;
  password: string;
  remember?: boolean;
}): { ok: true; user: StoredUser } | { ok: false; error: string } {
  const db = loadDb();
  const email = input.email.trim().toLowerCase();
  const user = db.users.find((u) => u.email === email);
  if (!user || user.password !== input.password) {
    return { ok: false, error: "Invalid email or password." };
  }
  db.sessionUserId = user.id;
  saveDb(db);
  if (typeof window !== "undefined") {
    if (input.remember === false) {
      sessionStorage.setItem("studylite_session_only", "1");
    } else {
      sessionStorage.removeItem("studylite_session_only");
    }
  }
  return { ok: true, user };
}

export function logoutUser() {
  const db = loadDb();
  db.sessionUserId = null;
  saveDb(db);
}

export function getSessionUser(): StoredUser | null {
  const db = loadDb();
  if (!db.sessionUserId) return null;
  return db.users.find((u) => u.id === db.sessionUserId) || null;
}

export function completeOnboarding(input: {
  subjectIds: string[];
  studyGoal: StudyGoal;
  dailyGoalMinutes: number;
}): Profile | null {
  const db = loadDb();
  const user = db.users.find((u) => u.id === db.sessionUserId);
  if (!user) return null;
  user.profile.selectedSubjectIds = input.subjectIds;
  user.profile.studyGoal = input.studyGoal;
  user.profile.dailyGoalMinutes = input.dailyGoalMinutes;
  user.profile.onboardingCompleted = true;
  user.profile.updatedAt = new Date().toISOString();
  ensureDailyMission(db, user.id);
  pushNotification(db, user.id, "🎯 Today's mission is ready.", "mission");
  saveDb(db);
  return user.profile;
}

export function ensureDailyMission(db: StudyLiteDB, userId: string): DailyMission {
  const today = todayKey();
  const existing = db.dailyMissions.find(
    (m) => m.userId === userId && m.missionDate === today
  );
  if (existing) return existing;

  const user = db.users.find((u) => u.id === userId);
  const subjectIds = user?.profile.selectedSubjectIds.length
    ? user.profile.selectedSubjectIds
    : SUBJECTS.map((s) => s.id);
  const topicIds = TOPICS.filter((t) => subjectIds.includes(t.subjectId)).map((t) => t.id);
  const pool = LESSONS.filter((l) => topicIds.includes(l.topicId));
  const completed = new Set(db.completedLessons[userId] || []);
  const unfinished = pool.filter((l) => !completed.has(l.id));
  const lesson =
    unfinished[Math.floor(Math.random() * Math.max(unfinished.length, 1))] ||
    pool[Math.floor(Math.random() * pool.length)] ||
    LESSONS[0];

  const mission: DailyMission = {
    id: uid("mission"),
    userId,
    lessonId: lesson.id,
    missionDate: today,
    completed: false,
    xpReward: 100,
    completedAt: null,
  };
  db.dailyMissions.push(mission);
  return mission;
}

export function getDailyMission(userId: string): DailyMission {
  const db = loadDb();
  const mission = ensureDailyMission(db, userId);
  saveDb(db);
  return mission;
}

export function completeLessonSession(input: {
  userId: string;
  lessonId: string;
  durationSeconds: number;
}) {
  const db = loadDb();
  const session: StudySession = {
    id: uid("session"),
    userId: input.userId,
    lessonId: input.lessonId,
    startedAt: new Date(Date.now() - input.durationSeconds * 1000).toISOString(),
    completedAt: new Date().toISOString(),
    durationSeconds: input.durationSeconds,
  };
  db.studySessions.push(session);
  const list = new Set(db.completedLessons[input.userId] || []);
  list.add(input.lessonId);
  db.completedLessons[input.userId] = [...list];
  evaluateAchievements(db, input.userId);
  saveDb(db);
  return session;
}

export function submitQuiz(input: {
  userId: string;
  lessonId: string;
  answers: { questionId: string; selectedAnswer: string }[];
  isDailyMission?: boolean;
  isChallenge?: boolean;
  challengeId?: string;
}): {
  attempt: QuizAttempt;
  xpAwarded: number;
  leveledUp: boolean;
  newLevel: number;
  streakMaintained: boolean;
  currentStreak: number;
  newAchievements: UserAchievement[];
} {
  const db = loadDb();
  const user = db.users.find((u) => u.id === input.userId);
  if (!user) throw new Error("User not found");

  const questionMap = new Map(QUESTIONS.map((q) => [q.id, q]));
  let correct = 0;
  const attemptId = uid("quiz");
  const now = new Date().toISOString();

  for (const ans of input.answers) {
    const question = questionMap.get(ans.questionId);
    if (!question) continue;
    const isCorrect = ans.selectedAnswer === question.correctAnswer;
    if (isCorrect) correct += 1;
    db.questionAttempts.push({
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

  const beforeDates = db.activityDates[input.userId] || [];
  const hadActivityToday = beforeDates.includes(todayKey());
  markActivity(db, input.userId);
  const streakMaintained = !hadActivityToday;

  const xpParts = quizXpBreakdown({
    correctCount: correct,
    totalQuestions: input.answers.length,
    isDailyMission: Boolean(input.isDailyMission),
    streakMaintained,
  });
  let xpAwarded = xpParts.total;
  if (input.isChallenge) xpAwarded += 100;

  const xpResult = applyXp(user.profile.xp, xpAwarded);
  user.profile.xp = xpResult.newXp;
  user.profile.level = xpResult.newLevel;
  user.profile.updatedAt = now;
  addWeeklyXp(db, input.userId, xpAwarded);

  const attempt: QuizAttempt = {
    id: attemptId,
    userId: input.userId,
    lessonId: input.lessonId,
    score: correct,
    totalQuestions: input.answers.length,
    xpEarned: xpAwarded,
    completedAt: now,
  };
  db.quizAttempts.push(attempt);

  const list = new Set(db.completedLessons[input.userId] || []);
  list.add(input.lessonId);
  db.completedLessons[input.userId] = [...list];

  if (input.isDailyMission) {
    const mission = db.dailyMissions.find(
      (m) =>
        m.userId === input.userId &&
        m.missionDate === todayKey() &&
        m.lessonId === input.lessonId
    );
    if (mission) {
      mission.completed = true;
      mission.completedAt = now;
    }
    if (streakMaintained) {
      pushNotification(
        db,
        input.userId,
        `🔥 ${user.profile.currentStreak}-day streak is alive!`,
        "streak"
      );
    }
  }

  if (input.isChallenge && input.challengeId) {
    const challenge = db.challenges.find((c) => c.id === input.challengeId);
    if (challenge) {
      challenge.challengerScore = correct;
      challenge.opponentScore = Math.max(
        0,
        Math.min(input.answers.length, Math.floor(input.answers.length * (0.5 + Math.random() * 0.45)))
      );
      challenge.status = "completed";
      challenge.completedAt = now;
      challenge.winnerId =
        (challenge.challengerScore || 0) >= (challenge.opponentScore || 0)
          ? challenge.challengerId
          : challenge.opponentId;
    }
  }

  const newAchievements = evaluateAchievements(db, input.userId);
  if (xpResult.leveledUp) {
    pushNotification(
      db,
      input.userId,
      `🎉 LEVEL UP! You reached Level ${xpResult.newLevel}!`,
      "achievement"
    );
  }

  saveDb(db);
  return {
    attempt,
    xpAwarded,
    leveledUp: xpResult.leveledUp,
    newLevel: xpResult.newLevel,
    streakMaintained,
    currentStreak: user.profile.currentStreak,
    newAchievements,
  };
}

export function getWeakTopics(userId: string): WeakTopic[] {
  const db = loadDb();
  const attempts = db.questionAttempts.filter((a) => a.userId === userId);
  const byTopic = new Map<string, { attempted: number; correct: number }>();
  for (const a of attempts) {
    const row = byTopic.get(a.topicId) || { attempted: 0, correct: 0 };
    row.attempted += 1;
    if (a.isCorrect) row.correct += 1;
    byTopic.set(a.topicId, row);
  }
  const result: WeakTopic[] = [];
  for (const [topicId, stats] of byTopic) {
    const topic = TOPICS.find((t) => t.id === topicId);
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

export function getWeeklyStats(userId: string): WeeklyStats {
  const db = loadDb();
  const start = weekStartKey();
  const sessions = db.studySessions.filter(
    (s) => s.userId === userId && s.completedAt && s.completedAt.slice(0, 10) >= start
  );
  const attempts = db.questionAttempts.filter(
    (a) => a.userId === userId && a.createdAt.slice(0, 10) >= start
  );
  const correct = attempts.filter((a) => a.isCorrect).length;
  const user = db.users.find((u) => u.id === userId);
  return {
    studySeconds: sessions.reduce((sum, s) => sum + s.durationSeconds, 0),
    questionsAnswered: attempts.length,
    accuracy: attempts.length ? Math.round((correct / attempts.length) * 100) : 0,
    streakDays: user?.profile.currentStreak || 0,
  };
}

export function getLeaderboard(userId: string): {
  entries: LeaderboardEntry[];
  yourRank: number;
  xpToNext: number | null;
} {
  const db = loadDb();
  const week = weekStartKey();
  const user = db.users.find((u) => u.id === userId);
  const yourWeekly = db.weeklyXp[`${userId}:${week}`] || 0;

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
      fullName: user.profile.fullName,
      xpThisWeek: yourWeekly,
      level: user.profile.level || levelFromXp(user.profile.xp),
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

export function getProfileStats(userId: string) {
  const db = loadDb();
  const lessons = (db.completedLessons[userId] || []).length;
  const questions = db.questionAttempts.filter((q) => q.userId === userId);
  const correct = questions.filter((q) => q.isCorrect).length;
  const studySeconds = db.studySessions
    .filter((s) => s.userId === userId)
    .reduce((sum, s) => sum + s.durationSeconds, 0);
  const subjectAccuracy = SUBJECTS.map((subject) => {
    const topicIds = new Set(TOPICS.filter((t) => t.subjectId === subject.id).map((t) => t.id));
    const relevant = questions.filter((q) => topicIds.has(q.topicId));
    const acc = relevant.length
      ? Math.round((relevant.filter((q) => q.isCorrect).length / relevant.length) * 100)
      : 0;
    return { subjectId: subject.id, name: subject.name, accuracy: acc, attempted: relevant.length };
  });

  return {
    lessons,
    questions: questions.length,
    accuracy: questions.length ? Math.round((correct / questions.length) * 100) : 0,
    studySeconds,
    subjectAccuracy,
  };
}

export function listChallenges(userId: string) {
  const db = loadDb();
  return db.challenges
    .filter((c) => c.challengerId === userId || c.opponentId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createChallenge(input: {
  userId: string;
  opponentId: string;
  opponentName: string;
  topicId: string;
}): Challenge {
  const db = loadDb();
  const lesson =
    LESSONS.find((l) => l.topicId === input.topicId) || LESSONS[0];
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
  db.challenges.push(challenge);
  saveDb(db);
  return challenge;
}

export function getChallenge(id: string) {
  return loadDb().challenges.find((c) => c.id === id) || null;
}

export function getNotifications(userId: string) {
  return loadDb().notifications.filter((n) => n.userId === userId).slice(0, 20);
}

export function getQuizAttempt(id: string) {
  return loadDb().quizAttempts.find((a) => a.id === id) || null;
}

export function getQuestionAttemptsForQuiz(quizAttemptId: string) {
  return loadDb().questionAttempts.filter((a) => a.quizAttemptId === quizAttemptId);
}

export function updateProfileName(userId: string, fullName: string) {
  const db = loadDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return null;
  user.profile.fullName = fullName.trim();
  user.profile.updatedAt = new Date().toISOString();
  saveDb(db);
  return user.profile;
}

export function updateSettings(
  userId: string,
  patch: Partial<Pick<Profile, "dailyGoalMinutes" | "selectedSubjectIds" | "studyGoal">>
) {
  const db = loadDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return null;
  user.profile = { ...user.profile, ...patch, updatedAt: new Date().toISOString() };
  saveDb(db);
  return user.profile;
}

export function getUserAchievements(userId: string) {
  return loadDb().userAchievements.filter((a) => a.userId === userId);
}

export { SUBJECTS, TOPICS, LESSONS, QUESTIONS, ACHIEVEMENTS };
