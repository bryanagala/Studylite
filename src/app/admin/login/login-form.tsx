"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { adminLoginAction, adminRegisterBootstrapAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function AdminLoginForm() {
  const search = useSearchParams();
  const configError = search.get("error") === "config";
  const [mode, setMode] = useState<"login" | "register">("login");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(
    configError
      ? "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local."
      : ""
  );
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8">
        <p className="font-display text-2xl font-extrabold text-emerald-400">
          StudyLite Admin
        </p>
        <p className="mt-2 text-sm text-slate-400">
          Supabase-backed control plane for subjects, lessons, and questions.
        </p>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-xl px-3 py-1.5 text-sm font-bold ${mode === "login" ? "bg-emerald-500 text-white" : "bg-slate-800"}`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`rounded-xl px-3 py-1.5 text-sm font-bold ${mode === "register" ? "bg-emerald-500 text-white" : "bg-slate-800"}`}
          >
            Create account
          </button>
        </div>

        <form
          className="mt-6 space-y-4"
          action={(fd) => {
            setError("");
            setMessage("");
            startTransition(async () => {
              if (mode === "login") {
                const res = await adminLoginAction(fd);
                if (res?.error) setError(res.error);
              } else {
                const res = await adminRegisterBootstrapAction(fd);
                if (res && "error" in res && res.error) setError(res.error);
                if (res && "message" in res && res.message) setMessage(res.message);
              }
            });
          }}
        >
          {mode === "register" ? (
            <div>
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" name="fullName" required className="bg-slate-950 text-white" />
            </div>
          ) : null}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              className="bg-slate-950 text-white"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="bg-slate-950 text-white"
            />
          </div>
          {error ? (
            <p className="rounded-xl bg-rose-950/50 px-3 py-2 text-sm text-rose-300">{error}</p>
          ) : null}
          {message ? (
            <p className="rounded-xl bg-emerald-950/50 px-3 py-2 text-sm text-emerald-300">
              {message}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Please wait..." : mode === "login" ? "Admin log in" : "Create account"}
          </Button>
        </form>

        <p className="mt-5 text-xs text-slate-500">
          After first signup, promote in Supabase SQL:{" "}
          <code className="text-emerald-400">
            update public.profiles set role = &apos;admin&apos; where email =
            &apos;you@email.com&apos;;
          </code>
        </p>
        <Link href="/" className="mt-4 inline-block text-sm text-slate-400 hover:text-white">
          ← Back to StudyLite
        </Link>
      </div>
    </div>
  );
}
