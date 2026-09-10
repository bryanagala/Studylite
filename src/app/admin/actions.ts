"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSession, slugifyId } from "@/lib/supabase/admin-auth";

async function requireAdminClient() {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");
  const supabase = await createServerSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured");
  return { supabase, session };
}

export async function adminLoginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { error: "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and ANON KEY." };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Login failed." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    await supabase.auth.signOut();
    return {
      error:
        "This account is not an admin. Run: update profiles set role='admin' where email='...'",
    };
  }

  redirect("/admin");
}

export async function adminLogoutAction() {
  const supabase = await createServerSupabaseClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function adminRegisterBootstrapAction(formData: FormData) {
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { error: "Supabase is not configured." };
  }
  if (!fullName || !email || password.length < 6) {
    return { error: "Fill all fields (password min 6 characters)." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role: "student" } },
  });
  if (error) return { error: error.message };

  return {
    ok: true as const,
    message: data.user
      ? `Account created for ${email}. Promote in SQL: update public.profiles set role = 'admin' where email = '${email}';`
      : "Check your email to confirm, then promote the profile to admin in SQL.",
  };
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

  const { supabase } = await requireAdminClient();
  const id = parsed.data.id || slugifyId("sub", parsed.data.name);
  const { error } = await supabase.from("subjects").upsert({
    id,
    name: parsed.data.name,
    description: parsed.data.description,
    icon: parsed.data.icon,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/subjects");
  revalidatePath("/admin");
  return { ok: true as const, id };
}

export async function deleteSubjectAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "");
  const { supabase } = await requireAdminClient();
  const { error } = await supabase.from("subjects").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/subjects");
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
  const { supabase } = await requireAdminClient();
  const id = parsed.data.id || slugifyId("topic", parsed.data.name);
  const { error } = await supabase.from("topics").upsert({
    id,
    subject_id: parsed.data.subject_id,
    name: parsed.data.name,
    description: parsed.data.description,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/topics");
  return { ok: true as const, id };
}

export async function deleteTopicAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "");
  const { supabase } = await requireAdminClient();
  const { error } = await supabase.from("topics").delete().eq("id", id);
  if (error) throw new Error(error.message);
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

  const { supabase } = await requireAdminClient();
  const id = parsed.data.id || slugifyId("lesson", parsed.data.title);
  const { error } = await supabase.from("lessons").upsert({
    id,
    topic_id: parsed.data.topic_id,
    title: parsed.data.title,
    estimated_minutes: parsed.data.estimated_minutes,
    difficulty: parsed.data.difficulty,
    content,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/lessons");
  return { ok: true as const, id };
}

export async function deleteLessonAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "");
  const { supabase } = await requireAdminClient();
  const { error } = await supabase.from("lessons").delete().eq("id", id);
  if (error) throw new Error(error.message);
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

  const { supabase } = await requireAdminClient();
  const id = parsed.data.id || slugifyId("q", parsed.data.question_text);
  const { error } = await supabase.from("questions").upsert({
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
  if (error) return { error: error.message };
  revalidatePath("/admin/questions");
  return { ok: true as const, id };
}

export async function deleteQuestionAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "");
  const { supabase } = await requireAdminClient();
  const { error } = await supabase.from("questions").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/questions");
}

export async function setUserRoleAction(formData: FormData): Promise<void> {
  const userId = String(formData.get("user_id") || "");
  const role = String(formData.get("role") || "");
  if (role !== "admin" && role !== "student") throw new Error("Invalid role.");
  const { supabase, session } = await requireAdminClient();
  if (userId === session.userId && role !== "admin") {
    throw new Error("You cannot demote yourself.");
  }
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
}
