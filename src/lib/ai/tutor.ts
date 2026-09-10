import type { ChatMessage } from "@/lib/ai/types";

const MOCK_RESPONSES: Record<string, string> = {
  explain:
    "Here's a simple take: break the idea into cause → process → result. Start with the core definition in one sentence, then add one concrete example from everyday life. Want a quick quiz to lock it in?",
  example:
    "Example: Think of a phone battery. Energy stored inside is used to power the screen and apps — similar to how mitochondria release usable energy for a cell's activities.",
  quiz: "Quick check: What organelle is called the powerhouse of the cell?\nA) Nucleus\nB) Ribosome\nC) Mitochondria\nD) Golgi apparatus\n\nReply with your answer and I'll explain.",
  summarize:
    "Summary: Focus on the main claim, 2–3 supporting points, and one must-remember fact. Drop side details until the core is solid.",
  mistake:
    "Common mix-up: similar terms often get swapped. Re-check definitions side by side, then re-test with one targeted question. Mistakes are useful signals — they show exactly what to review next.",
};

function detectIntent(message: string): keyof typeof MOCK_RESPONSES {
  const lower = message.toLowerCase();
  if (lower.includes("quiz") || lower.includes("test me")) return "quiz";
  if (lower.includes("example")) return "example";
  if (lower.includes("summar")) return "summarize";
  if (lower.includes("mistake") || lower.includes("wrong")) return "mistake";
  return "explain";
}

function mockReply(userMessage: string): string {
  const intent = detectIntent(userMessage);
  const base = MOCK_RESPONSES[intent];
  return `${base}\n\n(You asked: “${userMessage.slice(0, 120)}${userMessage.length > 120 ? "…" : ""}”)`;
}

export async function askStudyTutor(
  messages: ChatMessage[],
  userMessage: string
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;

  if (!apiKey) {
    await new Promise((r) => setTimeout(r, 450));
    return mockReply(userMessage);
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || "gpt-4o-mini",
        temperature: 0.5,
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content:
              "You are StudyLite AI, a concise educational tutor for secondary school and exam students. Be clear, encouraging, and keep answers short. Offer a quick quiz when helpful. Never invent false facts.",
          },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!res.ok) {
      return mockReply(userMessage);
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return data.choices?.[0]?.message?.content?.trim() || mockReply(userMessage);
  } catch {
    return mockReply(userMessage);
  }
}
