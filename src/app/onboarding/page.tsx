"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useStudyLite } from "@/components/providers/studylite-provider";
import { SUBJECTS } from "@/lib/content/seed-data";
import type { StudyGoal } from "@/lib/types";
import { cn } from "@/lib/utils";

const GOALS: { id: StudyGoal; label: string }[] = [
  { id: "prepare_exam", label: "Prepare for an exam" },
  { id: "improve_grades", label: "Improve my grades" },
  { id: "build_habit", label: "Build a study habit" },
  { id: "learn_new", label: "Learn something new" },
];

const TIMES = [
  { minutes: 5, label: "5 minutes" },
  { minutes: 15, label: "15 minutes" },
  { minutes: 30, label: "30 minutes" },
  { minutes: 60, label: "1 hour+" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { ready, profile, completeOnboarding } = useStudyLite();
  const [step, setStep] = useState(0);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [goal, setGoal] = useState<StudyGoal | null>(null);
  const [minutes, setMinutes] = useState<number | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!profile) router.replace("/auth/register");
    else if (profile.onboardingCompleted) router.replace("/dashboard");
  }, [ready, profile, router]);

  function toggleSubject(id: string) {
    setSubjects((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  async function finish() {
    if (!goal || !minutes || subjects.length === 0) return;
    await completeOnboarding({
      subjectIds: subjects,
      studyGoal: goal,
      dailyGoalMinutes: minutes,
    });
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                i <= step ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"
              )}
            />
          ))}
        </div>

        {step === 0 && (
          <div>
            <h1 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">
              Welcome to StudyLite 👋
            </h1>
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              Let&apos;s build your study habit.
            </p>
            <Button className="mt-8 w-full" size="lg" onClick={() => setStep(1)}>
              Get Started
            </Button>
          </div>
        )}

        {step === 1 && (
          <div>
            <h1 className="font-display text-3xl font-extrabold">What are you studying?</h1>
            <p className="mt-2 text-sm text-slate-500">Select one or more subjects.</p>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {SUBJECTS.map((s) => {
                const active = subjects.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSubject(s.id)}
                    className={cn(
                      "rounded-2xl border-2 p-4 text-left transition",
                      active
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                        : "border-slate-200 dark:border-slate-700"
                    )}
                  >
                    <span className="text-2xl">{s.icon}</span>
                    <p className="mt-2 font-bold">{s.name}</p>
                  </button>
                );
              })}
            </div>
            <Button
              className="mt-8 w-full"
              disabled={subjects.length === 0}
              onClick={() => setStep(2)}
            >
              Continue
            </Button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="font-display text-3xl font-extrabold">What&apos;s your study goal?</h1>
            <div className="mt-6 space-y-3">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoal(g.id)}
                  className={cn(
                    "w-full rounded-2xl border-2 px-4 py-3 text-left font-semibold",
                    goal === g.id
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                      : "border-slate-200 dark:border-slate-700"
                  )}
                >
                  {g.label}
                </button>
              ))}
            </div>
            <Button className="mt-8 w-full" disabled={!goal} onClick={() => setStep(3)}>
              Continue
            </Button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="font-display text-3xl font-extrabold">
              How much time can you study each day?
            </h1>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {TIMES.map((t) => (
                <button
                  key={t.minutes}
                  type="button"
                  onClick={() => setMinutes(t.minutes)}
                  className={cn(
                    "rounded-2xl border-2 px-4 py-4 font-bold",
                    minutes === t.minutes
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                      : "border-slate-200 dark:border-slate-700"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <Button className="mt-8 w-full" size="lg" disabled={!minutes} onClick={finish}>
              Start Learning
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
