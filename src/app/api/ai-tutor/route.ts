import { NextResponse } from "next/server";
import { askStudyTutor } from "@/lib/ai/tutor";
import type { ChatMessage } from "@/lib/ai/types";
import { z } from "zod";

const bodySchema = z.object({
  message: z.string().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const history: ChatMessage[] = (parsed.data.history || []).map((m, i) => ({
      id: `h-${i}`,
      role: m.role,
      content: m.content,
      createdAt: new Date().toISOString(),
    }));

    const reply = await askStudyTutor(history, parsed.data.message);
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { error: "AI tutor is temporarily unavailable." },
      { status: 500 }
    );
  }
}
