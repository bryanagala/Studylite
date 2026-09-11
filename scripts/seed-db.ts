import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  ACHIEVEMENTS,
  LESSONS,
  QUESTIONS,
  SUBJECTS,
  TOPICS,
} from "../src/lib/content/seed-data";
import {
  achievements,
  activityDates,
  battleInvites,
  battles,
  battleWinStreaks,
  challenges,
  completedLessons,
  dailyMissions,
  lessons,
  notifications,
  profiles,
  questionAttempts,
  questions,
  quizAttempts,
  studySessions,
  subjects,
  topics,
  userAchievements,
  weeklyXp,
} from "../src/lib/db/schema";

const connectionString =
  process.env.DATABASE_URL ||
  "postgres://studylite:studylite@127.0.0.1:5433/studylite";

const DEMO_USER_ID = "user_demo_sarah";

async function main() {
  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  console.log("Seeding StudyLite database...");

  await db.delete(battleWinStreaks);
  await db.delete(battleInvites);
  await db.delete(battles);
  await db.delete(notifications);
  await db.delete(challenges);
  await db.delete(userAchievements);
  await db.delete(questionAttempts);
  await db.delete(quizAttempts);
  await db.delete(dailyMissions);
  await db.delete(studySessions);
  await db.delete(completedLessons);
  await db.delete(weeklyXp);
  await db.delete(activityDates);
  await db.delete(questions);
  await db.delete(lessons);
  await db.delete(topics);
  await db.delete(subjects);
  await db.delete(achievements);
  await db.delete(profiles);

  await db.insert(subjects).values(
    SUBJECTS.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      icon: s.icon,
    }))
  );

  await db.insert(topics).values(
    TOPICS.map((t) => ({
      id: t.id,
      subjectId: t.subjectId,
      name: t.name,
      description: t.description,
    }))
  );

  await db.insert(lessons).values(
    LESSONS.map((l) => ({
      id: l.id,
      topicId: l.topicId,
      title: l.title,
      content: l.content,
      estimatedMinutes: l.estimatedMinutes,
      difficulty: l.difficulty,
    }))
  );

  await db.insert(questions).values(
    QUESTIONS.map((q) => ({
      id: q.id,
      lessonId: q.lessonId,
      topicId: q.topicId,
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty,
    }))
  );

  await db.insert(achievements).values(
    ACHIEVEMENTS.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      icon: a.icon,
      requirementType: a.requirementType,
      requirementValue: a.requirementValue,
    }))
  );

  const now = new Date();
  await db.insert(profiles).values([
    {
      id: DEMO_USER_ID,
      fullName: "Sarah Johnson",
      email: "demo@studylite.app",
      password: "demo1234",
      role: "student",
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
    {
      id: "user_admin",
      fullName: "StudyLite Admin",
      email: "admin@studylite.app",
      password: "admin1234",
      role: "admin",
      level: 1,
      xp: 0,
      currentStreak: 0,
      longestStreak: 0,
      dailyGoalMinutes: 15,
      studyGoal: null,
      selectedSubjectIds: [],
      onboardingCompleted: true,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  const day = (offset: number) =>
    new Date(Date.now() - offset * 86400000).toISOString().slice(0, 10);

  await db.insert(activityDates).values([
    { id: `${DEMO_USER_ID}-${day(3)}`, userId: DEMO_USER_ID, activityDate: day(3) },
    { id: `${DEMO_USER_ID}-${day(2)}`, userId: DEMO_USER_ID, activityDate: day(2) },
    { id: `${DEMO_USER_ID}-${day(1)}`, userId: DEMO_USER_ID, activityDate: day(1) },
  ]);

  const weekStart = (() => {
    const d = new Date();
    const dow = d.getUTCDay();
    const diff = dow === 0 ? -6 : 1 - dow;
    d.setUTCDate(d.getUTCDate() + diff);
    return d.toISOString().slice(0, 10);
  })();

  await db.insert(weeklyXp).values({
    id: `${DEMO_USER_ID}:${weekStart}`,
    userId: DEMO_USER_ID,
    weekStart,
    xp: 980,
  });

  await db.insert(completedLessons).values([
    {
      id: `${DEMO_USER_ID}-lesson-bio-intro-cells`,
      userId: DEMO_USER_ID,
      lessonId: "lesson-bio-intro-cells",
      completedAt: now,
    },
    {
      id: `${DEMO_USER_ID}-lesson-math-variables`,
      userId: DEMO_USER_ID,
      lessonId: "lesson-math-variables",
      completedAt: now,
    },
    {
      id: `${DEMO_USER_ID}-lesson-bio-intro-genetics`,
      userId: DEMO_USER_ID,
      lessonId: "lesson-bio-intro-genetics",
      completedAt: now,
    },
  ]);

  // ~54% Genetics accuracy for study recommendation demo
  const geneticsQuestions = QUESTIONS.filter((q) => q.topicId === "topic-bio-genetics");
  const cellQuestions = QUESTIONS.filter((q) => q.topicId === "topic-bio-cells").slice(0, 6);
  const quizId = "quiz_demo_genetics";
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

  await db.insert(quizAttempts).values([
    {
      id: quizId,
      userId: DEMO_USER_ID,
      lessonId: "lesson-bio-intro-genetics",
      score: 7,
      totalQuestions: 13,
      xpEarned: 120,
      completedAt: now,
    },
    {
      id: `${quizId}_cells`,
      userId: DEMO_USER_ID,
      lessonId: "lesson-bio-intro-cells",
      score: 5,
      totalQuestions: 6,
      xpEarned: 80,
      completedAt: now,
    },
  ]);

  await db.insert(questionAttempts).values(
    geneticsCorrectFlags.map((isCorrect, i) => {
      const q = geneticsQuestions[i % geneticsQuestions.length];
      return {
        id: `qatt_demo_gen_${i}`,
        userId: DEMO_USER_ID,
        questionId: q.id,
        quizAttemptId: quizId,
        selectedAnswer: isCorrect
          ? q.correctAnswer
          : q.options.find((o) => o !== q.correctAnswer) || "",
        isCorrect,
        topicId: q.topicId,
        createdAt: now,
      };
    })
  );

  await db.insert(questionAttempts).values(
    cellQuestions.map((q, i) => {
      const isCorrect = i !== 0;
      return {
        id: `qatt_demo_cell_${i}`,
        userId: DEMO_USER_ID,
        questionId: q.id,
        quizAttemptId: `${quizId}_cells`,
        selectedAnswer: isCorrect
          ? q.correctAnswer
          : q.options.find((o) => o !== q.correctAnswer) || "",
        isCorrect,
        topicId: q.topicId,
        createdAt: now,
      };
    })
  );
  await db.insert(notifications).values([
    {
      id: "notif_demo_mission",
      userId: DEMO_USER_ID,
      message: "🎯 Today's mission is ready.",
      type: "mission",
      read: false,
      createdAt: now,
    },
    {
      id: "notif_demo_streak",
      userId: DEMO_USER_ID,
      message: "🔥 Your 3-day streak is waiting — keep it alive!",
      type: "streak",
      read: false,
      createdAt: now,
    },
  ]);

  console.log("Seed complete:");
  console.log(`  subjects: ${SUBJECTS.length}`);
  console.log(`  topics: ${TOPICS.length}`);
  console.log(`  lessons: ${LESSONS.length}`);
  console.log(`  questions: ${QUESTIONS.length}`);
  console.log(`  achievements: ${ACHIEVEMENTS.length}`);
  console.log("  demo user: demo@studylite.app / demo1234");
  console.log("  admin user: admin@studylite.app / admin1234");

  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
