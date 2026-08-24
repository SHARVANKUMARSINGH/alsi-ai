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

  it("starts the configured GitHub OAuth session redirect without signing a user in", async () => {
    const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT;
    const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
    const redirectUrl = `appwrite-callback-${projectId}://localhost`;
    const query = new URLSearchParams({ success: redirectUrl, failure: redirectUrl });
    query.append("scopes[]", "repo");

    const response = await fetch(`${endpoint}/account/sessions/oauth2/github?${query.toString()}`, {
      headers: {
        "X-Appwrite-Platform": "com.app.alsiai",
        "X-Appwrite-Project": projectId!,
      },
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
    });

    expect(response.status).toBe(301);
  }, 30_000);
});
