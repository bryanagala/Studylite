/**
 * Push local seed content into Supabase.
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 * Usage: npm run admin:seed
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import {
  ACHIEVEMENTS,
  LESSONS,
  QUESTIONS,
  SUBJECTS,
  TOPICS,
} from "../src/lib/content/seed-data";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env / .env.local"
    );
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log("Seeding subjects...");
  const { error: sErr } = await supabase.from("subjects").upsert(
    SUBJECTS.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      icon: s.icon,
    }))
  );
  if (sErr) throw sErr;

  console.log("Seeding topics...");
  const { error: tErr } = await supabase.from("topics").upsert(
    TOPICS.map((t) => ({
      id: t.id,
      subject_id: t.subjectId,
      name: t.name,
      description: t.description,
    }))
  );
  if (tErr) throw tErr;

  console.log("Seeding lessons...");
  const { error: lErr } = await supabase.from("lessons").upsert(
    LESSONS.map((l) => ({
      id: l.id,
      topic_id: l.topicId,
      title: l.title,
      content: l.content,
      estimated_minutes: l.estimatedMinutes,
      difficulty: l.difficulty,
    }))
  );
  if (lErr) throw lErr;

  console.log("Seeding questions...");
  // Batch to avoid payload limits
  for (let i = 0; i < QUESTIONS.length; i += 50) {
    const chunk = QUESTIONS.slice(i, i + 50).map((q) => ({
      id: q.id,
      lesson_id: q.lessonId,
      topic_id: q.topicId,
      question_text: q.questionText,
      question_type: q.questionType,
      options: q.options,
      correct_answer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty,
    }));
    const { error } = await supabase.from("questions").upsert(chunk);
    if (error) throw error;
  }

  console.log("Seeding achievements...");
  const { error: aErr } = await supabase.from("achievements").upsert(
    ACHIEVEMENTS.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      icon: a.icon,
      requirement_type: a.requirementType,
      requirement_value: a.requirementValue,
    }))
  );
  if (aErr) throw aErr;

  console.log("Admin seed complete:", {
    subjects: SUBJECTS.length,
    topics: TOPICS.length,
    lessons: LESSONS.length,
    questions: QUESTIONS.length,
    achievements: ACHIEVEMENTS.length,
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
