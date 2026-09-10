import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const subjects = pgTable("subjects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const topics = pgTable("topics", {
  id: text("id").primaryKey(),
  subjectId: text("subject_id")
    .notNull()
    .references(() => subjects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull(),
});

export const lessons = pgTable("lessons", {
  id: text("id").primaryKey(),
  topicId: text("topic_id")
    .notNull()
    .references(() => topics.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: jsonb("content").notNull(),
  estimatedMinutes: integer("estimated_minutes").notNull().default(5),
  difficulty: text("difficulty").notNull().default("easy"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const questions = pgTable("questions", {
  id: text("id").primaryKey(),
  lessonId: text("lesson_id")
    .notNull()
    .references(() => lessons.id, { onDelete: "cascade" }),
  topicId: text("topic_id")
    .notNull()
    .references(() => topics.id, { onDelete: "cascade" }),
  questionText: text("question_text").notNull(),
  questionType: text("question_type").notNull(),
  options: jsonb("options").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation").notNull(),
  difficulty: text("difficulty").notNull().default("easy"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const achievements = pgTable("achievements", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  requirementType: text("requirement_type").notNull(),
  requirementValue: integer("requirement_value").notNull(),
});

export const profiles = pgTable("profiles", {
  id: text("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  avatarUrl: text("avatar_url"),
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  dailyGoalMinutes: integer("daily_goal_minutes").notNull().default(15),
  studyGoal: text("study_goal"),
  selectedSubjectIds: jsonb("selected_subject_ids").notNull().default([]),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  lessonId: text("lesson_id")
    .notNull()
    .references(() => lessons.id),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  xpEarned: integer("xp_earned").notNull().default(0),
  completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow().notNull(),
});

export const questionAttempts = pgTable("question_attempts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  questionId: text("question_id")
    .notNull()
    .references(() => questions.id),
  quizAttemptId: text("quiz_attempt_id")
    .notNull()
    .references(() => quizAttempts.id, { onDelete: "cascade" }),
  selectedAnswer: text("selected_answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  topicId: text("topic_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const dailyMissions = pgTable(
  "daily_missions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id),
    missionDate: text("mission_date").notNull(),
    completed: boolean("completed").notNull().default(false),
    xpReward: integer("xp_reward").notNull().default(100),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [uniqueIndex("daily_missions_user_date").on(table.userId, table.missionDate)]
);

export const studySessions = pgTable("study_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  lessonId: text("lesson_id")
    .notNull()
    .references(() => lessons.id),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  durationSeconds: integer("duration_seconds").notNull().default(0),
});

export const userAchievements = pgTable(
  "user_achievements",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    achievementId: text("achievement_id")
      .notNull()
      .references(() => achievements.id),
    earnedAt: timestamp("earned_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("user_achievements_unique").on(table.userId, table.achievementId),
  ]
);

export const activityDates = pgTable(
  "activity_dates",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    activityDate: text("activity_date").notNull(),
  },
  (table) => [
    uniqueIndex("activity_dates_unique").on(table.userId, table.activityDate),
  ]
);

export const weeklyXp = pgTable(
  "weekly_xp",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    weekStart: text("week_start").notNull(),
    xp: integer("xp").notNull().default(0),
  },
  (table) => [uniqueIndex("weekly_xp_unique").on(table.userId, table.weekStart)]
);

export const completedLessons = pgTable(
  "completed_lessons",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("completed_lessons_unique").on(table.userId, table.lessonId),
  ]
);

export const challenges = pgTable("challenges", {
  id: text("id").primaryKey(),
  challengerId: text("challenger_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  opponentId: text("opponent_id").notNull(),
  opponentName: text("opponent_name").notNull(),
  topicId: text("topic_id")
    .notNull()
    .references(() => topics.id),
  lessonId: text("lesson_id")
    .notNull()
    .references(() => lessons.id),
  status: text("status").notNull().default("active"),
  challengerScore: integer("challenger_score"),
  opponentScore: integer("opponent_score"),
  winnerId: text("winner_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  type: text("type").notNull(),
  read: boolean("read").notNull().default(false),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const battles = pgTable("battles", {
  id: text("id").primaryKey(),
  payload: jsonb("payload").notNull(),
  status: text("status").notNull().default("waiting"),
  createdBy: text("created_by").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const battleInvites = pgTable("battle_invites", {
  id: text("id").primaryKey(),
  payload: jsonb("payload").notNull(),
  battleId: text("battle_id").notNull(),
  senderId: text("sender_id").notNull(),
  receiverId: text("receiver_id").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const battleWinStreaks = pgTable("battle_win_streaks", {
  userId: text("user_id")
    .primaryKey()
    .references(() => profiles.id, { onDelete: "cascade" }),
  streak: integer("streak").notNull().default(0),
});

