"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LessonContent } from "@/components/learning/lesson-card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { LESSONS, SUBJECTS, TOPICS } from "@/lib/content/seed-data";
import { useStudyLite } from "@/components/providers/studylite-provider";
import { ErrorState } from "@/components/ui/states";

export default function LessonPageContent() {
  const params = useParams<{ lessonId: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const { completeLesson } = useStudyLite();
  const isMission = search.get("mission") === "1";
  const [section, setSection] = useState(0);
  const [startedAt] = useState(() => Date.now());

  const lesson = useMemo(
    () => LESSONS.find((l) => l.id === params.lessonId),
    [params.lessonId]
  );

  useEffect(() => {
    setSection(0);
  }, [params.lessonId]);

  if (!lesson) {
    return (
      <ErrorState
        title="We couldn't load this lesson."
        onRetry={() => router.push("/learn")}
      />
    );
  }

  const topic = TOPICS.find((t) => t.id === lesson.topicId);
  const subject = SUBJECTS.find((s) => s.id === topic?.subjectId);
  const total = lesson.content.length;
  const percent = Math.round(((section + 1) / total) * 100);
  const isLast = section >= total - 1;

  async function next() {
    if (!isLast) {
      setSection((s) => s + 1);
      return;
    }
    const durationSeconds = Math.max(30, Math.round((Date.now() - startedAt) / 1000));
    await completeLesson(lesson!.id, durationSeconds);
    router.push(`/quiz/${lesson!.id}${isMission ? "?mission=1" : ""}`);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/learn" className="text-sm font-semibold text-slate-500 hover:text-slate-800">
        ← Back
      </Link>
      <p className="mt-4 text-sm font-bold uppercase tracking-wide text-emerald-600">
        {subject?.name}
      </p>
      <h1 className="font-display mt-1 text-3xl font-extrabold">{lesson.title}</h1>
      <div className="mt-4">
        <div className="mb-2 flex justify-between text-xs font-semibold text-slate-500">
          <span>Progress</span>
          <span>{percent}%</span>
        </div>
        <Progress value={percent} />
      </div>
      <div className="mt-8">
        <LessonContent lesson={lesson} sectionIndex={section} />
      </div>
      <div className="mt-10 flex justify-between gap-3">
        <Button
          variant="secondary"
          disabled={section === 0}
          onClick={() => setSection((s) => Math.max(0, s - 1))}
        >
          Previous
        </Button>
        <Button onClick={next}>
          {isLast ? "Continue to Quiz" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
