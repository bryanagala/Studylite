"use client";

import Link from "next/link";
import { LESSONS, SUBJECTS, TOPICS } from "@/lib/content/seed-data";
import { Card } from "@/components/ui/card";
import type { Lesson } from "@/lib/types";

export function LessonCard({ lesson }: { lesson: Lesson }) {
  const topic = TOPICS.find((t) => t.id === lesson.topicId);
  const subject = SUBJECTS.find((s) => s.id === topic?.subjectId);
  return (
    <Link href={`/learn/${lesson.id}`}>
      <Card className="h-full transition hover:-translate-y-0.5 hover:border-emerald-300 dark:hover:border-emerald-800">
        <p className="text-sm font-semibold text-emerald-600">
          {subject?.icon} {subject?.name}
        </p>
        <h3 className="mt-2 font-display text-xl font-bold text-slate-900 dark:text-white">
          {lesson.title}
        </h3>
        <p className="mt-2 text-sm text-slate-500">{topic?.name}</p>
        <div className="mt-4 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400">
          <span>{lesson.estimatedMinutes} min</span>
          <span>{lesson.difficulty}</span>
        </div>
      </Card>
    </Link>
  );
}

export function LessonContent({
  lesson,
  sectionIndex,
}: {
  lesson: Lesson;
  sectionIndex: number;
}) {
  const section = lesson.content[sectionIndex];
  if (!section) return null;
  return (
    <div>
      <h2 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">
        {section.heading}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-slate-700 dark:text-slate-300">
        {section.body}
      </p>
      {section.keyConcept ? (
        <div className="mt-6 rounded-2xl border border-teal-200 bg-teal-50 p-4 dark:border-teal-900 dark:bg-teal-950/30">
          <p className="text-xs font-bold uppercase tracking-wide text-teal-700 dark:text-teal-300">
            Key Concept
          </p>
          <p className="mt-1 font-medium text-teal-900 dark:text-teal-100">
            {section.keyConcept}
          </p>
        </div>
      ) : null}
      {section.remember ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">
            Remember
          </p>
          <p className="mt-1 font-medium text-amber-900 dark:text-amber-100">
            {section.remember}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function getLessonsBySubject(subjectId?: string, topicId?: string) {
  let lessons = LESSONS;
  if (topicId) lessons = lessons.filter((l) => l.topicId === topicId);
  else if (subjectId) {
    const topicIds = new Set(
      TOPICS.filter((t) => t.subjectId === subjectId).map((t) => t.id)
    );
    lessons = lessons.filter((l) => topicIds.has(l.topicId));
  }
  return lessons;
}
