import { describe, expect, it } from "vitest";

import { ALSI_MODEL, buildAttachmentAwareMessages, buildOpenRouterPayload } from "../server/openrouter";

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
    expect(payload.model).toBe("nvidia/llama-nemotron-rerank-vl-1b-v2:free");
    expect(payload.messages[0].content).toContain("Reasoning summary");
    expect(payload.messages[0].content).toContain("Do not provide hidden chain-of-thought");
    expect(payload.messages).toHaveLength(2);
  });

  it("uses a simple string and the requested text route when no image is attached", () => {
    const requestMessages = buildAttachmentAwareMessages(messages);
    const payload = buildOpenRouterPayload(requestMessages, {
      mode: "normal",
      aggression: 0,
      modelId: "standard",
    });

    expect(payload.model).toBe("poolside/laguna-s-2.1:free");
    expect(payload.messages[1].content).toBe("Explain magnetic fields.");
  });

  it("uses the requested vision route and strict text-plus-data-URI parts for an image prompt", () => {
    const requestMessages = buildAttachmentAwareMessages(
      [{ role: "user", content: "What is visible in this image?" }],
      "aW1hZ2U=",
      "image/jpeg",
    );
    const payload = buildOpenRouterPayload(requestMessages, {
      mode: "normal",
      aggression: 1,
      modelId: "standard",
    });

    expect(payload.model).toBe("google/gemma-4-26b-a4b-it:free");
    expect(payload.messages[1].content).toEqual([
      { type: "text", text: "What is visible in this image?" },
      { type: "image_url", image_url: { url: "data:image/jpeg;base64,aW1hZ2U=" } },
    ]);
  });
});
