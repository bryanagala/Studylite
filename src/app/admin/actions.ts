"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  getAdminSession,
  requireAdminSession,
  setAdminSessionCookie,
  slugifyId,
} from "@/lib/admin/auth";
import * as adminRepo from "@/lib/admin/repo";
import { isDatabaseConfigured } from "@/lib/db/client";

export async function adminLoginAction(formData: FormData) {
  if (!isDatabaseConfigured()) {
    return {
      error:
        "Postgres is not configured. Set DATABASE_URL (Railway) in .env.local.",
    };
  }
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const res = await adminRepo.adminLogin(email, password);
  if (!res.ok) return { error: res.error };
  await setAdminSessionCookie(res.userId);
  redirect("/admin");
}

export async function adminLogoutAction() {
  await setAdminSessionCookie(null);
  redirect("/admin/login");
}

export async function adminRegisterBootstrapAction(formData: FormData) {
  if (!isDatabaseConfigured()) {
    return { error: "Postgres is not configured. Set DATABASE_URL." };
  }
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const res = await adminRepo.adminRegisterBootstrap({ fullName, email, password });
  if (!res.ok) return { error: res.error };
  return { ok: true as const, message: res.message };
}

const subjectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().min(1),
});

export async function upsertSubjectAction(formData: FormData) {
  const parsed = subjectSchema.safeParse({
    id: String(formData.get("id") || "") || undefined,
    name: formData.get("name"),
    description: formData.get("description"),
    icon: formData.get("icon"),
  });
  if (!parsed.success) return { error: "Invalid subject fields." };
  await requireAdminSession();
  const id = parsed.data.id || slugifyId("sub", parsed.data.name);
  await adminRepo.upsertSubject({ id, ...parsed.data });
  revalidatePath("/admin/subjects");
  revalidatePath("/admin");
  return { ok: true as const, id };
}

export async function deleteSubjectAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "");
  await requireAdminSession();
  await adminRepo.deleteSubject(id);
  revalidatePath("/admin/subjects");
  revalidatePath("/admin");
}

const topicSchema = z.object({
  id: z.string().optional(),
  subject_id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
});

export async function upsertTopicAction(formData: FormData) {
  const parsed = topicSchema.safeParse({
    id: String(formData.get("id") || "") || undefined,
    subject_id: formData.get("subject_id"),
    name: formData.get("name"),
    description: formData.get("description"),
  });
  if (!parsed.success) return { error: "Invalid topic fields." };
  await requireAdminSession();
  const id = parsed.data.id || slugifyId("topic", parsed.data.name);
  await adminRepo.upsertTopic({ id, ...parsed.data });
  revalidatePath("/admin/topics");
  return { ok: true as const, id };
}

export async function deleteTopicAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "");
  await requireAdminSession();
  await adminRepo.deleteTopic(id);
  revalidatePath("/admin/topics");
}

const lessonSchema = z.object({
  id: z.string().optional(),
  topic_id: z.string().min(1),
  title: z.string().min(1),
  estimated_minutes: z.coerce.number().min(1).max(120),
  difficulty: z.enum(["easy", "medium", "hard"]),
  content_json: z.string().min(2),
});

export async function upsertLessonAction(formData: FormData) {
  const parsed = lessonSchema.safeParse({
    id: String(formData.get("id") || "") || undefined,
    topic_id: formData.get("topic_id"),
    title: formData.get("title"),
    estimated_minutes: formData.get("estimated_minutes"),
    difficulty: formData.get("difficulty"),
    content_json: formData.get("content_json"),
  });
  if (!parsed.success) return { error: "Invalid lesson fields." };

  let content: unknown;
  try {
    content = JSON.parse(parsed.data.content_json);
  } catch {
    return { error: "Lesson content must be valid JSON." };
  }

  await requireAdminSession();
  const id = parsed.data.id || slugifyId("lesson", parsed.data.title);
  await adminRepo.upsertLesson({
    id,
    topic_id: parsed.data.topic_id,
    title: parsed.data.title,
    estimated_minutes: parsed.data.estimated_minutes,
    difficulty: parsed.data.difficulty,
    content,
  });
  revalidatePath("/admin/lessons");
  return { ok: true as const, id };
}

export async function deleteLessonAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "");
  await requireAdminSession();
  await adminRepo.deleteLesson(id);
  revalidatePath("/admin/lessons");
}

const questionSchema = z.object({
  id: z.string().optional(),
  lesson_id: z.string().min(1),
  topic_id: z.string().min(1),
  question_text: z.string().min(1),
  question_type: z.enum(["multiple_choice", "true_false"]),
  options_json: z.string().min(2),
  correct_answer: z.string().min(1),
  explanation: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "hard"]),
});

export async function upsertQuestionAction(formData: FormData) {
  const parsed = questionSchema.safeParse({
    id: String(formData.get("id") || "") || undefined,
    lesson_id: formData.get("lesson_id"),
    topic_id: formData.get("topic_id"),
    question_text: formData.get("question_text"),
    question_type: formData.get("question_type"),
    options_json: formData.get("options_json"),
    correct_answer: formData.get("correct_answer"),
    explanation: formData.get("explanation"),
    difficulty: formData.get("difficulty"),
  });
  if (!parsed.success) return { error: "Invalid question fields." };

  let options: unknown;
  try {
    options = JSON.parse(parsed.data.options_json);
    if (!Array.isArray(options)) throw new Error("options must be an array");
  } catch {
    return { error: "Options must be a JSON array of strings." };
  }

  await requireAdminSession();
  const id = parsed.data.id || slugifyId("q", parsed.data.question_text);
  await adminRepo.upsertQuestion({
    id,
    lesson_id: parsed.data.lesson_id,
    topic_id: parsed.data.topic_id,
    question_text: parsed.data.question_text,
    question_type: parsed.data.question_type,
    options,
    correct_answer: parsed.data.correct_answer,
    explanation: parsed.data.explanation,
    difficulty: parsed.data.difficulty,
  });
  revalidatePath("/admin/questions");
  return { ok: true as const, id };
}

export async function deleteQuestionAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "");
  await requireAdminSession();
  await adminRepo.deleteQuestion(id);
  revalidatePath("/admin/questions");
}

export async function setUserRoleAction(formData: FormData): Promise<void> {
  const userId = String(formData.get("user_id") || "");
  const role = String(formData.get("role") || "");
  if (role !== "admin" && role !== "student") throw new Error("Invalid role.");
  const session = await requireAdminSession();
  if (userId === session.userId && role !== "admin") {
    throw new Error("You cannot demote yourself.");
  }
  await adminRepo.setUserRole(userId, role);
  revalidatePath("/admin/users");
}

export { getAdminSession };
