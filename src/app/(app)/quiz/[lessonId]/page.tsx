"use client";

import { Suspense } from "react";
import QuizPageContent from "./quiz-content";
import { Skeleton } from "@/components/ui/states";

export default function QuizPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <QuizPageContent />
    </Suspense>
  );
}
