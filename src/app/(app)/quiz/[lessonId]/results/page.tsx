"use client";

import { Suspense } from "react";
import QuizResultsContent from "./results-content";
import { Skeleton } from "@/components/ui/states";

export default function QuizResultsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <QuizResultsContent />
    </Suspense>
  );
}
