export type ChatMode = "normal" | "thinking";

export type AggressionLevel = 0 | 1 | 2 | 3;

export type ChatSettings = {
  mode: ChatMode;
  aggression: AggressionLevel;
  quickCopyButtons?: boolean;
};

export type ChatImageAttachment = {
  uri: string;
  base64: string;
  mimeType: string;
};

export type GeneratedProjectFile = {
  path: string;
  language: string;
  content: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  isError?: boolean;
  attachment?: ChatImageAttachment;
  commandProposals?: string[];
  projectFiles?: GeneratedProjectFile[];
};

export type ChatCompletionMessage = Pick<ChatMessage, "role" | "content">;

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
  options?: Pick<ChatMessage, "isError" | "attachment" | "commandProposals" | "projectFiles">,
): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    createdAt: Date.now(),
    isError: options?.isError,
    attachment: options?.attachment,
    commandProposals: options?.commandProposals,
    projectFiles: options?.projectFiles,
  };
}

/**
 * Keeps a request within the server-side message limit while preserving the
 * newest useful context. Failed assistant messages are local feedback only and
 * must not be sent back to the model as conversational context.
 */
export function buildCompletionHistory(
  messages: ChatMessage[],
  nextMessage?: ChatMessage,
  limit = 30,
): ChatCompletionMessage[] {
  return [...messages, ...(nextMessage ? [nextMessage] : [])]
    .filter((message) => !message.isError)
    .slice(-limit)
    .map(({ role, content }) => ({ role, content }));
}

export function getModeSummary(mode: ChatMode) {
  return mode === "thinking"
    ? "Concise rationale before the answer"
    : "Direct, focused answers";
}
