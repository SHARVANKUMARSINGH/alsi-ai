import { describe, expect, it } from "vitest";

import { getAppwriteCallbackCredentials, getAppwriteCallbackError } from "../lib/appwrite-callback";

describe("Appwrite OAuth callback parameters", () => {
  it("extracts scalar userId and secret values", () => {
    expect(getAppwriteCallbackCredentials({ userId: "user-123", secret: "secret-456" })).toEqual({
      userId: "user-123",
      secret: "secret-456",
    });
  });

  it("uses the first value when a router exposes repeated query parameters", () => {
    expect(
      getAppwriteCallbackCredentials({ userId: ["user-123", "ignored"], secret: ["secret-456"] }),
    ).toEqual({ userId: "user-123", secret: "secret-456" });
  });

  it("normalizes missing and whitespace-only credentials", () => {
    expect(getAppwriteCallbackCredentials({ userId: "   ", secret: undefined })).toEqual({
      userId: null,
      secret: null,
    });
  });

  it("supports Appwrite provider errors and both description spellings", () => {
    expect(getAppwriteCallbackError({ error: "access_denied", error_description: "Cancelled" })).toEqual({
      code: "access_denied",
      description: "Cancelled",
    });
    expect(getAppwriteCallbackError({ errorDescription: "Expired" })).toEqual({
      code: null,
      description: "Expired",
    });
  });
});
