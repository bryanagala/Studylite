"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { LessonCard, getLessonsBySubject } from "@/components/learning/lesson-card";
import { SUBJECTS, TOPICS } from "@/lib/content/seed-data";
import { useStudyLite } from "@/components/providers/studylite-provider";
import { EmptyState } from "@/components/ui/states";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function LearnPageContent() {
  const search = useSearchParams();
  const topicFilter = search.get("topic") || undefined;
  const subjectFilter = search.get("subject") || undefined;
  const { profile } = useStudyLite();

  const lessons = useMemo(
    () => getLessonsBySubject(subjectFilter, topicFilter),
    [subjectFilter, topicFilter]
  );

  const selectedSubjects = profile?.selectedSubjectIds || [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold">Learn</h1>
        <p className="mt-1 text-slate-500">Short lessons built for daily progress.</p>
      </header>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/learn"
          className={cn(
            "rounded-full px-3 py-1.5 text-sm font-semibold",
            !subjectFilter && !topicFilter
              ? "bg-emerald-500 text-white"
              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
          )}
        >
          All
        </Link>
        {SUBJECTS.filter(
          (s) => selectedSubjects.length === 0 || selectedSubjects.includes(s.id)
        ).map((s) => (
          <Link
            key={s.id}
            href={`/learn?subject=${s.id}`}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-semibold",
              subjectFilter === s.id
                ? "bg-emerald-500 text-white"
                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            )}
          >
            {s.icon} {s.name}
          </Link>
        ))}
      </div>

      {topicFilter ? (
        <p className="text-sm font-medium text-amber-600">
          Reviewing: {TOPICS.find((t) => t.id === topicFilter)?.name}
        </p>
      ) : null}

      {lessons.length === 0 ? (
        <EmptyState title="No lessons found" description="Try another subject filter." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {lessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      )}
    </div>
  );
}
