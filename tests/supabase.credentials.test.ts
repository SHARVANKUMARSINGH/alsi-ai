import { describe, expect, it } from "vitest";

describe("Supabase publishable configuration", () => {
  it("authenticates with the configured project endpoint", async () => {
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    expect(url, "EXPO_PUBLIC_SUPABASE_URL must be configured").toMatch(/^https:\/\//);
    expect(anonKey, "EXPO_PUBLIC_SUPABASE_ANON_KEY must be configured").toBeTruthy();

    const response = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: anonKey! },
    });

    expect(response.status).toBe(200);
  }, 30_000);
});
