import { describe, expect, it } from "vitest";

describe("GitHub repository write credential", () => {
  it("has push permission for the ALSI Ai repository without exposing the token", async () => {
    const token = process.env.GITHUB_WRITE_TOKEN;

    expect(token).toBeTruthy();

    const response = await fetch("https://api.github.com/repos/SHARVANKUMARSINGH/alsi-ai", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    expect(response.ok).toBe(true);
    const body = (await response.json()) as { permissions?: { push?: boolean } };
    expect(body.permissions?.push).toBe(true);
  }, 30_000);
});
