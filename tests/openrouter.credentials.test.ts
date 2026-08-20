import { describe, expect, it } from "vitest";

describe("OpenRouter credential", () => {
  it("authenticates against the model catalog", async () => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    expect(apiKey, "OPENROUTER_API_KEY must be available to the server").toBeTruthy();

    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    expect(response.status, await response.text()).toBe(200);
  }, 30_000);
});
