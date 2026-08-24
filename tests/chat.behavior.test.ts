import { describe, expect, it } from "vitest";

import { buildCompletionHistory } from "../lib/chat";
import { ALSI_MODEL, OPENROUTER_OVERLOAD_MESSAGE, buildAttachmentAwareMessages, buildOpenRouterPayload, parseOpenRouterCompletion, shouldUseFreeVisionFallback, userSafeOpenRouterError } from "../server/openrouter";

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
    expect(payload.model).toBe("openrouter/free");
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

    expect(payload.model).toBe("openrouter/free");
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

    expect(payload.model).toBe("google/gemma-4-31b-it:free");
    expect(payload.messages[1].content).toEqual([
      { type: "text", text: "What is visible in this image?" },
      { type: "image_url", image_url: { url: "data:image/jpeg;base64,aW1hZ2U=" } },
    ]);
  });

  it("gives image-only messages a useful analysis instruction without changing their stored label", () => {
    const requestMessages = buildAttachmentAwareMessages(
      [{ role: "user", content: "Image attachment" }],
      "aW1hZ2U=",
      "image/jpeg",
    );

    expect(requestMessages[0]?.content).toEqual([
      { type: "text", text: "Please analyze the attached image and describe the important details." },
      { type: "image_url", image_url: { url: "data:image/jpeg;base64,aW1hZ2U=" } },
    ]);
  });

  it("does not attempt JSON parsing for an upstream HTML or plain-text error body", () => {
    expect(parseOpenRouterCompletion("<html>Gateway timeout</html>")).toBeNull();
    expect(parseOpenRouterCompletion("error: provider unavailable")).toBeNull();
    expect(OPENROUTER_OVERLOAD_MESSAGE).toBe("The AI server is currently overloaded. Please try again in a few seconds.");
  });

  it("retries unavailable Lite and Standard image routes through the free vision router", () => {
    expect(shouldUseFreeVisionFallback("lite", true, 429)).toBe(true);
    expect(shouldUseFreeVisionFallback("standard", true, 502)).toBe(true);
    expect(shouldUseFreeVisionFallback("pro", true, 429)).toBe(false);
    expect(shouldUseFreeVisionFallback("lite", false, 429)).toBe(false);
    expect(shouldUseFreeVisionFallback("standard", true, 400)).toBe(false);
  });

  it("returns specific, recoverable messages for upstream credential and traffic failures", () => {
    expect(userSafeOpenRouterError(401)).toContain("credentials");
    expect(userSafeOpenRouterError(429)).toContain("too many requests");
    expect(userSafeOpenRouterError(503)).toContain("temporarily unavailable");
  });

  it("keeps only the newest valid context when a long chat exceeds the request limit", () => {
    const messages = Array.from({ length: 32 }, (_, index) => ({
      id: `message-${index}`,
      role: index % 2 === 0 ? "user" as const : "assistant" as const,
      content: `message ${index}`,
      createdAt: index,
      isError: index === 31,
    }));
    const nextMessage = { id: "next", role: "user" as const, content: "latest", createdAt: 33 };

    const history = buildCompletionHistory(messages, nextMessage);

    expect(history).toHaveLength(30);
    expect(history[0]?.content).toBe("message 2");
    expect(history.at(-1)?.content).toBe("latest");
    expect(history.some((message) => message.content === "message 31")).toBe(false);
  });

  it("builds retry context without resubmitting a failed assistant message", () => {
    const history = buildCompletionHistory([
      { id: "user", role: "user", content: "Explain closures", createdAt: 1 },
      { id: "failed", role: "assistant", content: "Service unavailable", createdAt: 2, isError: true },
    ]);

    expect(history).toEqual([{ role: "user", content: "Explain closures" }]);
  });
});
