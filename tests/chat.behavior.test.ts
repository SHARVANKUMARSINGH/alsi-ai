import { describe, expect, it } from "vitest";

import { ALSI_MODEL, buildOpenRouterPayload } from "../server/openrouter";

describe("ALSI OpenRouter payload", () => {
  const messages = [{ role: "user" as const, content: "Explain magnetic fields." }];

  it("creates a direct balanced request in Normal mode", () => {
    const payload = buildOpenRouterPayload(messages, { mode: "normal", aggression: 0 });

    expect(payload.model).toBe(ALSI_MODEL);
    expect(payload.temperature).toBe(0.7);
    expect(payload.messages[0].content).toContain("Answer directly");
    expect(payload.messages[0].content).not.toContain("Reasoning summary");
  });

  it("maps Thinking mode and maximum Aggressive Mode into a visible rationale request", () => {
    const payload = buildOpenRouterPayload(messages, { mode: "thinking", aggression: 3 });

    expect(payload.temperature).toBe(1.5);
    expect(payload.messages[0].content).toContain("Reasoning summary");
    expect(payload.messages[0].content).toContain("Do not provide hidden chain-of-thought");
    expect(payload.messages).toHaveLength(2);
  });
});
