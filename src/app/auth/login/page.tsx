"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useStudyLite } from "@/components/providers/studylite-provider";
import { DEMO_CREDENTIALS } from "@/lib/store/local-db";

export default function LoginPage() {
  const router = useRouter();
  const { login, profile, ready } = useStudyLite();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ready || !profile) return;
    router.replace(profile.onboardingCompleted ? "/dashboard" : "/onboarding");
  }, [ready, profile, router]);

  async function doLogin(nextEmail: string, nextPassword: string) {
    setError("");
    setLoading(true);
    try {
      const res = await login({ email: nextEmail, password: nextPassword, remember });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    doLogin(email, password);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="font-display text-3xl font-extrabold text-emerald-600">StudyLite</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Log in to continue your streak.</p>

        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm dark:border-emerald-900 dark:bg-emerald-950/40">
          <p className="font-bold text-emerald-800 dark:text-emerald-200">Demo account</p>
          <p className="mt-1 text-emerald-700 dark:text-emerald-300">
            Email: <span className="font-semibold">{DEMO_CREDENTIALS.email}</span>
          </p>
          <p className="text-emerald-700 dark:text-emerald-300">
            Password: <span className="font-semibold">{DEMO_CREDENTIALS.password}</span>
          </p>
          <Button
            type="button"
            variant="secondary"
            className="mt-3 w-full"
            disabled={loading}
            onClick={() => {
              setEmail(DEMO_CREDENTIALS.email);
              setPassword(DEMO_CREDENTIALS.password);
              doLogin(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password);
            }}
          >
            Continue as demo user
          </Button>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Remember session
          </label>
          {error ? (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-500">
          New here?{" "}
          <Link href="/auth/register" className="font-bold text-emerald-600">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
