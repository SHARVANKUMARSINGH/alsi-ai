import { describe, expect, it } from "vitest";

describe("Expo export credential", () => {
  it("authenticates against Expo without exposing the configured token", async () => {
    const token = process.env.EXPO_TOKEN;

    expect(token).toBeTruthy();

    const response = await fetch("https://api.expo.dev/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: "query { me { id username } }" }),
    });

    expect(response.ok).toBe(true);
    const body = (await response.json()) as { data?: { me?: { id?: string; username?: string } } };
    expect(body.data?.me?.id).toBeTruthy();
    expect(body.data?.me?.username).toBeTruthy();
  }, 30_000);
});
