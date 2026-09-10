export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export const QUICK_PROMPTS = [
  "Explain this simply",
  "Give me an example",
  "Quiz me",
  "Summarize this",
  "Explain my mistake",
] as const;
