"use client";

import { Suspense } from "react";
import LearnPageContent from "./learn-content";
import { Skeleton } from "@/components/ui/states";

export default function LearnPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-40 w-full" />
        </div>
      }
    >
      <LearnPageContent />
    </Suspense>
  );
}
