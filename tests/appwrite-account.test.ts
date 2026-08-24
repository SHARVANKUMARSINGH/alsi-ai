import { beforeEach, describe, expect, it, vi } from "vitest";

const { appwriteAccountDeleteSession, appwriteAccountGet, createDocument, createEmailToken, createOAuth2Session, createSession, getSession, listDocuments, openAuthSessionAsync, updateDocument } = vi.hoisted(() => ({
  appwriteAccountDeleteSession: vi.fn(),
  appwriteAccountGet: vi.fn(),
  createDocument: vi.fn(),
  createEmailToken: vi.fn(),
  createOAuth2Session: vi.fn(),
  createSession: vi.fn(),
  getSession: vi.fn(),
  listDocuments: vi.fn(),
  openAuthSessionAsync: vi.fn(),
  updateDocument: vi.fn(),
}));

vi.mock("expo-linking", () => ({ createURL: vi.fn(() => "appwrite-callback-project-id://localhost") }));
vi.mock("expo-web-browser", () => ({ openAuthSessionAsync }));

vi.mock("../lib/appwrite", () => ({
  APPWRITE_DATABASE_ID: "database-id",
  APPWRITE_OAUTH_CALLBACK_SCHEME: "appwrite-callback-project-id",
  APPWRITE_USERS_COLLECTION_ID: "users",
  ID: { unique: () => "new-document" },
  Query: { equal: vi.fn(() => "email-query"), limit: vi.fn(() => "limit-query") },
  appwriteAccount: { createEmailToken, createOAuth2Session, createSession, deleteSession: appwriteAccountDeleteSession, get: appwriteAccountGet, getSession },
  appwriteDatabases: { createDocument, listDocuments, updateDocument },
}));

import {
  completeAppwriteAuth,
  completeAppwriteSocialAuth,
  requestAppwriteOtp,
  saveAppwriteAccount,
  signInWithAppwriteGoogle,
  verifyAppwriteOtp,
} from "../lib/appwrite-account";

describe("Appwrite account service", () => {
  beforeEach(() => {
    appwriteAccountDeleteSession.mockReset();
    appwriteAccountGet.mockReset();
    createDocument.mockReset();
    createEmailToken.mockReset();
    createOAuth2Session.mockReset();
    createSession.mockReset();
    getSession.mockReset();
    listDocuments.mockReset();
    openAuthSessionAsync.mockReset();
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

  it("keeps an existing social sign-in token balance instead of resetting it", async () => {
    listDocuments.mockResolvedValue({ documents: [{ $id: "doc-1", email: "person@example.com", tokens: 41, last_login: "2026-08-21T00:00:00.000Z" }] });

    const account = await completeAppwriteSocialAuth("PERSON@example.com", Date.parse("2026-08-21T01:00:00.000Z"));

    expect(account.tokens).toBe(41);
    expect(createDocument).not.toHaveBeenCalled();
  });

  it("uses the secure browser Google session and provisions a token record when needed", async () => {
    createOAuth2Session.mockReturnValue(new URL("https://fra.cloud.appwrite.io/google"));
    openAuthSessionAsync.mockResolvedValue({ type: "success", url: "appwrite-callback-project-id://localhost" });
    getSession.mockResolvedValue({ provider: "google" });
    appwriteAccountGet.mockResolvedValue({ email: "person@example.com" });
    listDocuments.mockResolvedValue({ documents: [] });
    createDocument.mockResolvedValue({ email: "person@example.com", tokens: 100, last_login: "2026-08-21T00:00:00.000Z" });

    const account = await signInWithAppwriteGoogle();

    expect(createOAuth2Session).toHaveBeenCalledWith(expect.objectContaining({ provider: "google", success: "appwrite-callback-project-id://localhost" }));
    expect(openAuthSessionAsync).toHaveBeenCalledWith("https://fra.cloud.appwrite.io/google", "appwrite-callback-project-id://localhost");
    expect(account.tokens).toBe(100);
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
