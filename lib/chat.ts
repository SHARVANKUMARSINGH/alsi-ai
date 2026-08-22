export type ChatMode = "normal" | "thinking";

export type AggressionLevel = 0 | 1 | 2 | 3;

export type ChatSettings = {
  mode: ChatMode;
  aggression: AggressionLevel;
};

export type ChatImageAttachment = {
  uri: string;
  base64: string;
  mimeType: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  isError?: boolean;
  attachment?: ChatImageAttachment;
};

export const aggressionLabels: Record<AggressionLevel, string> = {
  0: "Balanced",
  1: "Expressive",
  2: "Bold",
  3: "Maximum",
};

export const aggressionTemperatures: Record<AggressionLevel, number> = {
  0: 0.7,
  1: 1,
  2: 1.3,
  3: 1.5,
};

export function createMessage(
  role: ChatMessage["role"],
  content: string,
  options?: Pick<ChatMessage, "isError" | "attachment">,
): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    createdAt: Date.now(),
    isError: options?.isError,
    attachment: options?.attachment,
  };
}

export function getModeSummary(mode: ChatMode) {
  return mode === "thinking"
    ? "Concise rationale before the answer"
    : "Direct, focused answers";
}
