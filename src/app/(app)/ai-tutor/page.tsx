"use client";

import { useState } from "react";
import { QUICK_PROMPTS } from "@/lib/ai/types";
import type { ChatMessage } from "@/lib/ai/types";
import { Button } from "@/components/ui/button";
import { uid } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function AITutorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm StudyLite AI 🤖 — your personal study assistant. Ask me to explain a topic, give an example, or quiz you.",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const userMsg: ChatMessage = {
      id: uid("msg"),
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: next
            .filter((m) => m.id !== "welcome")
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      setMessages((prev) => [
        ...prev,
        {
          id: uid("msg"),
          role: "assistant",
          content: data.reply || data.error || "Sorry, I couldn't respond right now.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: uid("msg"),
          role: "assistant",
          content: "Network issue. Please try again.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-2xl flex-col">
      <header className="mb-4">
        <h1 className="font-display text-3xl font-extrabold">StudyLite AI 🤖</h1>
        <p className="mt-1 text-slate-500">Your personal study assistant.</p>
      </header>

      <div className="mb-3 flex flex-wrap gap-2">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => send(prompt)}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
              m.role === "user"
                ? "ml-auto bg-emerald-500 text-white"
                : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
            )}
          >
            <p className="mb-1 text-[10px] font-bold uppercase opacity-70">
              {m.role === "user" ? "You" : "AI"}
            </p>
            <p className="whitespace-pre-wrap">{m.content}</p>
          </div>
        ))}
        {loading ? (
          <p className="text-sm font-medium text-slate-400">Thinking...</p>
        ) : null}
      </div>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Explain photosynthesis simply..."
          className="h-12 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm dark:border-slate-700 dark:bg-slate-900"
          aria-label="Ask the AI tutor"
        />
        <Button type="submit" disabled={loading || !input.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
