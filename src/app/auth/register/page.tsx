"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useStudyLite } from "@/components/providers/studylite-provider";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useStudyLite();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await register({ fullName, email, password });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push("/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="font-display text-3xl font-extrabold text-emerald-600">StudyLite</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Create account</h1>
        <p className="mt-1 text-sm text-slate-500">Start building your study habit today.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
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
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error ? (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Sign up"}
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-bold text-emerald-600">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
