import { describe, expect, it } from "vitest";

describe("OpenRouter credential", () => {
  it("is injected into the server environment", () => {
    const apiKey = process.env.OPENROUTER_API_KEY;

    expect(apiKey, "OPENROUTER_API_KEY must be available to the server").toBeTruthy();
    expect(apiKey).toMatch(/^sk-or-v1-/);
  });
});
