"use client";

import { Suspense } from "react";
import LessonPageContent from "./lesson-content";
import { Skeleton } from "@/components/ui/states";

export default function LessonPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <LessonPageContent />
    </Suspense>
  );
}
