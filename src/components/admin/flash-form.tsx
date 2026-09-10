"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

export function AdminFlashForm({
  action,
  title,
  fields,
}: {
  action: (formData: FormData) => Promise<{ error?: string; ok?: boolean } | void>;
  title: string;
  fields: React.ReactNode;
}) {
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900 p-5"
      action={(fd) => {
        setError("");
        setOk("");
        startTransition(async () => {
          const res = await action(fd);
          if (res && "error" in res && res.error) setError(res.error);
          else setOk("Saved.");
        });
      }}
    >
      <p className="text-sm font-bold uppercase tracking-wide text-slate-400">{title}</p>
      <div className="grid gap-3 md:grid-cols-2">{fields}</div>
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      {ok ? <p className="text-sm text-emerald-400">{ok}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
