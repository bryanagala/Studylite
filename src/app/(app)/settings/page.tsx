"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useStudyLite } from "@/components/providers/studylite-provider";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardTitle } from "@/components/ui/card";
import { SUBJECTS } from "@/lib/content/seed-data";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const router = useRouter();
  const { profile, updateProfileName, updateSettings, logout } = useStudyLite();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [minutes, setMinutes] = useState(15);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!profile) return;
    setName(profile.fullName);
    setMinutes(profile.dailyGoalMinutes);
    setSubjects(profile.selectedSubjectIds);
  }, [profile]);

  if (!profile) return null;

  async function save() {
    await updateProfileName(name);
    await updateSettings(profile!.id, {
      dailyGoalMinutes: minutes,
      selectedSubjectIds: subjects,
    });
    toast("Settings saved");
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold">Settings</h1>
      </header>

      <Card>
        <CardTitle>Profile</CardTitle>
        <div className="mt-4 space-y-3">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={profile.email} disabled />
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle>Daily goal</CardTitle>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {[5, 15, 30, 60].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMinutes(m)}
              className={cn(
                "rounded-2xl border-2 py-3 text-sm font-bold",
                minutes === m
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                  : "border-slate-200 dark:border-slate-700"
              )}
            >
              {m === 60 ? "1 hour+" : `${m} minutes`}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>Subjects</CardTitle>
        <div className="mt-4 grid grid-cols-1 gap-2">
          {SUBJECTS.map((s) => {
            const active = subjects.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() =>
                  setSubjects((prev) =>
                    active ? prev.filter((id) => id !== s.id) : [...prev, s.id]
                  )
                }
                className={cn(
                  "rounded-2xl border-2 px-4 py-3 text-left font-semibold",
                  active
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                    : "border-slate-200 dark:border-slate-700"
                )}
              >
                {s.icon} {s.name}
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <CardTitle>Appearance</CardTitle>
        {mounted ? (
          <div className="mt-4 flex gap-2">
            {(["light", "dark", "system"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className={cn(
                  "rounded-2xl border-2 px-4 py-2 text-sm font-bold capitalize",
                  theme === t
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                    : "border-slate-200 dark:border-slate-700"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        ) : null}
      </Card>

      <div className="flex flex-col gap-3">
        <Button onClick={save}>Save changes</Button>
        <Button
          variant="danger"
          onClick={() => {
            logout();
            router.replace("/auth/login");
          }}
        >
          Log out
        </Button>
      </div>
    </div>
  );
}
