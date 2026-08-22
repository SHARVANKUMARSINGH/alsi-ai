import { describe, expect, it } from "vitest";

import { ALSI_MODEL, buildOpenRouterPayload } from "../server/openrouter";

describe("ALSI OpenRouter payload", () => {
  const messages = [{ role: "user" as const, content: "Explain magnetic fields." }];

  it("creates a direct balanced request in Normal mode", () => {
    const payload = buildOpenRouterPayload(messages, { mode: "normal", aggression: 0, modelId: "pro" });

    expect(payload.model).toBe(ALSI_MODEL);
    expect(payload.temperature).toBe(0.7);
    expect(payload.messages[0].content).toContain("Answer directly");
    expect(payload.messages[0].content).not.toContain("Reasoning summary");
  });

  it("maps Thinking mode and maximum Aggressive Mode into a visible rationale request", () => {
    const payload = buildOpenRouterPayload(messages, { mode: "thinking", aggression: 3, modelId: "lite" });

    expect(payload.temperature).toBe(1.5);
    expect(payload.model).toBe("meta-llama/llama-3.2-11b-vision-instruct:free");
    expect(payload.messages[0].content).toContain("Reasoning summary");
    expect(payload.messages[0].content).toContain("Do not provide hidden chain-of-thought");
    expect(payload.messages).toHaveLength(2);
  });

  it("preserves text and data-URI image content parts for vision models", () => {
    const content = [
      { type: "text" as const, text: "What is visible in this image?" },
      { type: "image_url" as const, image_url: { url: "data:image/jpeg;base64,aW1hZ2U=" } },
    ];
    const payload = buildOpenRouterPayload([{ role: "user", content }], {
      mode: "normal",
      aggression: 1,
      modelId: "standard",
    });

    expect(payload.model).toBe("nvidia/nemotron-nano-12b-vl:free");
    expect(payload.messages[1].content).toEqual(content);
  });
});
