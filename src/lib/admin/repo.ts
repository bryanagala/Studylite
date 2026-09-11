import { asc, count, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import * as t from "@/lib/db/schema";
import { uid } from "@/lib/utils";

export async function getAdminCounts() {
  const db = getDb();
  const [s, topics, lessons, questions, users] = await Promise.all([
    db.select({ n: count() }).from(t.subjects),
    db.select({ n: count() }).from(t.topics),
    db.select({ n: count() }).from(t.lessons),
    db.select({ n: count() }).from(t.questions),
    db.select({ n: count() }).from(t.profiles),
  ]);
  return {
    subjects: s[0]?.n || 0,
    topics: topics[0]?.n || 0,
    lessons: lessons[0]?.n || 0,
    questions: questions[0]?.n || 0,
    users: users[0]?.n || 0,
  };
}

export async function listSubjectsAdmin() {
  const db = getDb();
  const rows = await db.query.subjects.findMany({ orderBy: [asc(t.subjects.name)] });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    icon: r.icon,
  }));
}

export async function upsertSubject(input: {
  id: string;
  name: string;
  description: string;
  icon: string;
}) {
  const db = getDb();
  const existing = await db.query.subjects.findFirst({
    where: eq(t.subjects.id, input.id),
  });
  if (existing) {
    await db
      .update(t.subjects)
      .set({
        name: input.name,
        description: input.description,
        icon: input.icon,
      })
      .where(eq(t.subjects.id, input.id));
  } else {
    await db.insert(t.subjects).values(input);
  }
}

export async function deleteSubject(id: string) {
  const db = getDb();
  await db.delete(t.subjects).where(eq(t.subjects.id, id));
}

export async function listTopicsAdmin() {
  const db = getDb();
  const rows = await db.query.topics.findMany({ orderBy: [asc(t.topics.name)] });
  return rows.map((r) => ({
    id: r.id,
    subject_id: r.subjectId,
    name: r.name,
    description: r.description,
  }));
}

export async function upsertTopic(input: {
  id: string;
  subject_id: string;
  name: string;
  description: string;
}) {
  const db = getDb();
  const existing = await db.query.topics.findFirst({
    where: eq(t.topics.id, input.id),
  });
  if (existing) {
    await db
      .update(t.topics)
      .set({
        subjectId: input.subject_id,
        name: input.name,
        description: input.description,
      })
      .where(eq(t.topics.id, input.id));
  } else {
    await db.insert(t.topics).values({
      id: input.id,
      subjectId: input.subject_id,
      name: input.name,
      description: input.description,
    });
  }
}

export async function deleteTopic(id: string) {
  const db = getDb();
  await db.delete(t.topics).where(eq(t.topics.id, id));
}

export async function listLessonsAdmin() {
  const db = getDb();
  const rows = await db.query.lessons.findMany({
    orderBy: [desc(t.lessons.createdAt)],
  });
  return rows.map((r) => ({
    id: r.id,
    topic_id: r.topicId,
    title: r.title,
    estimated_minutes: r.estimatedMinutes,
    difficulty: r.difficulty,
    content: r.content,
  }));
}

export async function upsertLesson(input: {
  id: string;
  topic_id: string;
  title: string;
  estimated_minutes: number;
  difficulty: string;
  content: unknown;
}) {
  const db = getDb();
  const existing = await db.query.lessons.findFirst({
    where: eq(t.lessons.id, input.id),
  });
  if (existing) {
    await db
      .update(t.lessons)
      .set({
        topicId: input.topic_id,
        title: input.title,
        estimatedMinutes: input.estimated_minutes,
        difficulty: input.difficulty,
        content: input.content,
      })
      .where(eq(t.lessons.id, input.id));
  } else {
    await db.insert(t.lessons).values({
      id: input.id,
      topicId: input.topic_id,
      title: input.title,
      estimatedMinutes: input.estimated_minutes,
      difficulty: input.difficulty,
      content: input.content,
    });
  }
}

export async function deleteLesson(id: string) {
  const db = getDb();
  await db.delete(t.lessons).where(eq(t.lessons.id, id));
}

export async function listQuestionsAdmin(limit = 100) {
  const db = getDb();
  const rows = await db.query.questions.findMany({
    orderBy: [desc(t.questions.createdAt)],
    limit,
  });
  return rows.map((r) => ({
    id: r.id,
    lesson_id: r.lessonId,
    topic_id: r.topicId,
    question_text: r.questionText,
    question_type: r.questionType,
    options: r.options,
    correct_answer: r.correctAnswer,
    explanation: r.explanation,
    difficulty: r.difficulty,
  }));
}

export async function upsertQuestion(input: {
  id: string;
  lesson_id: string;
  topic_id: string;
  question_text: string;
  question_type: string;
  options: unknown;
  correct_answer: string;
  explanation: string;
  difficulty: string;
}) {
  const db = getDb();
  const existing = await db.query.questions.findFirst({
    where: eq(t.questions.id, input.id),
  });
  if (existing) {
    await db
      .update(t.questions)
      .set({
        lessonId: input.lesson_id,
        topicId: input.topic_id,
        questionText: input.question_text,
        questionType: input.question_type,
        options: input.options,
        correctAnswer: input.correct_answer,
        explanation: input.explanation,
        difficulty: input.difficulty,
      })
      .where(eq(t.questions.id, input.id));
  } else {
    await db.insert(t.questions).values({
      id: input.id,
      lessonId: input.lesson_id,
      topicId: input.topic_id,
      questionText: input.question_text,
      questionType: input.question_type,
      options: input.options,
      correctAnswer: input.correct_answer,
      explanation: input.explanation,
      difficulty: input.difficulty,
    });
  }
}

export async function deleteQuestion(id: string) {
  const db = getDb();
  await db.delete(t.questions).where(eq(t.questions.id, id));
}

export async function listUsersAdmin() {
  const db = getDb();
  const rows = await db.query.profiles.findMany({
    orderBy: [desc(t.profiles.createdAt)],
  });
  return rows.map((r) => ({
    id: r.id,
    full_name: r.fullName,
    email: r.email,
    role: (r.role as "student" | "admin") || "student",
    level: r.level,
    xp: r.xp,
    created_at: r.createdAt.toISOString(),
  }));
}

export async function setUserRole(userId: string, role: "student" | "admin") {
  const db = getDb();
  await db
    .update(t.profiles)
    .set({ role, updatedAt: new Date() })
    .where(eq(t.profiles.id, userId));
}

export async function adminLogin(email: string, password: string) {
  const db = getDb();
  const normalized = email.trim().toLowerCase();
  const row = await db.query.profiles.findFirst({
    where: eq(t.profiles.email, normalized),
  });
  if (!row || row.password !== password) {
    return { ok: false as const, error: "Invalid email or password." };
  }
  if (row.role !== "admin") {
    return {
      ok: false as const,
      error:
        "This account is not an admin. Promote with: UPDATE profiles SET role='admin' WHERE email='...';",
    };
  }
  return { ok: true as const, userId: row.id, email: row.email };
}

export async function adminRegisterBootstrap(input: {
  fullName: string;
  email: string;
  password: string;
}) {
  const db = getDb();
  const email = input.email.trim().toLowerCase();
  if (!input.fullName.trim() || !email || input.password.length < 6) {
    return { ok: false as const, error: "Fill all fields (password min 6 characters)." };
  }
  const existing = await db.query.profiles.findFirst({
    where: eq(t.profiles.email, email),
  });
  if (existing) {
    return { ok: false as const, error: "An account with this email already exists." };
  }
  const id = uid("user");
  const now = new Date();
  await db.insert(t.profiles).values({
    id,
    fullName: input.fullName.trim(),
    email,
    password: input.password,
    role: "student",
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
  return {
    ok: true as const,
    message: `Account created for ${email}. Promote in SQL/DB: UPDATE profiles SET role = 'admin' WHERE email = '${email}'; then log in.`,
  };
}
