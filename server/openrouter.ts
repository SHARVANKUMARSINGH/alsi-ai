export const OPENROUTER_CHAT_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
export const ALSI_MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free";

export type OpenRouterChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type OpenRouterSettings = {
  mode: "normal" | "thinking";
  aggression: 0 | 1 | 2 | 3;
};

export const temperatureByAggression: Record<OpenRouterSettings["aggression"], number> = {
  0: 0.7,
  1: 1,
  2: 1.3,
  3: 1.5,
};

function getSystemInstruction(mode: OpenRouterSettings["mode"]) {
  const core =
    "You are ALSI Ai, a precise, warm, and capable assistant. Give useful answers, state uncertainty clearly, and format the response for easy reading on a phone.";

  if (mode === "thinking") {
    return `${core} When reasoning is useful, start with a concise section titled \"Reasoning summary\" that gives a user-facing explanation of the approach, then provide the answer. Do not provide hidden chain-of-thought, private deliberation, or internal reasoning.`;
  }

  return `${core} Answer directly without a separate reasoning section unless the user explicitly asks for an explanation.`;
}

export function buildOpenRouterPayload(messages: OpenRouterChatMessage[], settings: OpenRouterSettings) {
  return {
    model: ALSI_MODEL,
    messages: [
      { role: "system" as const, content: getSystemInstruction(settings.mode) },
      ...messages,
    ],
    temperature: temperatureByAggression[settings.aggression],
    max_tokens: 1600,
    stream: false,
  };
}

export function userSafeOpenRouterError(status: number) {
  if (status === 401 || status === 403) {
    return "ALSI Ai's connection credentials need attention. Please try again shortly.";
  }
  if (status === 429) {
    return "ALSI Ai is receiving too many requests right now. Please wait a moment and try again.";
  }
  if (status >= 500) {
    return "The AI service is temporarily unavailable. Please try your message again in a moment.";
  }
  return "ALSI Ai could not complete that request. Please try again.";
}
