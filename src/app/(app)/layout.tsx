"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { useStudyLite } from "@/components/providers/studylite-provider";
import { Skeleton } from "@/components/ui/states";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { ready, profile } = useStudyLite();

  useEffect(() => {
    if (!ready) return;
    if (!profile) router.replace("/auth/login");
    else if (!profile.onboardingCompleted) router.replace("/onboarding");
  }, [ready, profile, router]);

  if (!ready || !profile || !profile.onboardingCompleted) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
