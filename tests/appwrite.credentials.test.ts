import { describe, expect, it } from "vitest";

describe("Appwrite project configuration", () => {
  it("reaches the configured Appwrite project and receives an expected unauthenticated account response", async () => {
    const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT;
    const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;

    expect(endpoint).toBeTruthy();
    expect(projectId).toBeTruthy();

    const response = await fetch(`${endpoint}/account`, {
      headers: { "X-Appwrite-Project": projectId! },
    });

    expect(response.status).toBe(401);
  }, 30_000);
});
