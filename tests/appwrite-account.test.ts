import { beforeEach, describe, expect, it, vi } from "vitest";

const { appwriteAccountDeleteSession, appwriteAccountGet, createDocument, createEmailToken, createSession, listDocuments, updateDocument } = vi.hoisted(() => ({
  appwriteAccountDeleteSession: vi.fn(),
  appwriteAccountGet: vi.fn(),
  createDocument: vi.fn(),
  createEmailToken: vi.fn(),
  createSession: vi.fn(),
  listDocuments: vi.fn(),
  updateDocument: vi.fn(),
}));

vi.mock("../lib/appwrite", () => ({
  APPWRITE_DATABASE_ID: "database-id",
  APPWRITE_USERS_COLLECTION_ID: "users",
  ID: { unique: () => "new-document" },
  Query: { equal: vi.fn(() => "email-query"), limit: vi.fn(() => "limit-query") },
  appwriteAccount: { createEmailToken, createSession, deleteSession: appwriteAccountDeleteSession, get: appwriteAccountGet },
  appwriteDatabases: { createDocument, listDocuments, updateDocument },
}));

import {
  completeAppwriteAuth,
  requestAppwriteOtp,
  saveAppwriteAccount,
  verifyAppwriteOtp,
} from "../lib/appwrite-account";

describe("Appwrite account service", () => {
  beforeEach(() => {
    appwriteAccountDeleteSession.mockReset();
    appwriteAccountGet.mockReset();
    createDocument.mockReset();
    createEmailToken.mockReset();
    createSession.mockReset();
    listDocuments.mockReset();
    updateDocument.mockReset();
  });

  it("creates an Appwrite email token and session using the returned user ID", async () => {
    listDocuments.mockResolvedValue({ documents: [] });
    createEmailToken.mockResolvedValue({ userId: "appwrite-user" });
    appwriteAccountGet.mockRejectedValue(new Error("No active session"));
    createSession.mockResolvedValue({ $id: "session" });

    await requestAppwriteOtp("PERSON@example.com", "signUp");
    await verifyAppwriteOtp("appwrite-user", "123456");

    expect(createEmailToken).toHaveBeenCalledWith("new-document", "person@example.com");
    expect(createSession).toHaveBeenCalledWith("appwrite-user", "123456");
  });

  it("creates a 100-token document for a verified email without an existing record", async () => {
    listDocuments.mockResolvedValue({ documents: [] });
    createDocument.mockResolvedValue({ email: "person@example.com", tokens: 100, last_login: "2026-08-21T00:00:00.000Z" });

    const account = await completeAppwriteAuth("person@example.com", "signUp", Date.parse("2026-08-21T00:00:00.000Z"));

    expect(account.tokens).toBe(100);
    expect(createDocument).toHaveBeenCalledWith("database-id", "users", "new-document", expect.objectContaining({ email: "person@example.com", tokens: 100 }));
  });

  it("loads an existing Sign In account without resetting its saved tokens", async () => {
    listDocuments.mockResolvedValue({ documents: [{ $id: "doc-1", email: "person@example.com", tokens: 41, last_login: "2026-08-21T00:00:00.000Z" }] });

    const account = await completeAppwriteAuth("person@example.com", "signIn", Date.parse("2026-08-21T01:00:00.000Z"));

    expect(account.tokens).toBe(41);
    expect(createDocument).not.toHaveBeenCalled();
  });

  it("updates the existing Appwrite document after a token deduction", async () => {
    listDocuments.mockResolvedValue({ documents: [{ $id: "doc-1", email: "person@example.com", tokens: 100, last_login: "2026-08-21T00:00:00.000Z" }] });
    updateDocument.mockResolvedValue({});

    await saveAppwriteAccount({
      createdAt: Date.parse("2026-08-21T00:00:00.000Z"),
      identifier: "person@example.com",
      lastRenewedAt: Date.parse("2026-08-21T00:00:00.000Z"),
      mode: "loggedIn",
      selectedModelId: "pro",
      tokens: 95,
    });

    expect(updateDocument).toHaveBeenCalledWith("database-id", "users", "doc-1", expect.objectContaining({ tokens: 95 }));
  });
});
