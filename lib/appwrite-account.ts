import type { Models } from "react-native-appwrite";

import { createLoggedInAccount, type StoredAccount } from "./account";
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_USERS_COLLECTION_ID,
  ID,
  Query,
  appwriteAccount,
  appwriteDatabases,
} from "./appwrite";

type AppwriteUserDocument = Models.Document & {
  email: string;
  tokens: number;
  last_login: string;
};

export type AppwriteAuthIntent = "signIn" | "signUp";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function fromDocument(document: AppwriteUserDocument, now = Date.now()): StoredAccount {
  const lastRenewedAt = Number.isNaN(Date.parse(document.last_login)) ? now : Date.parse(document.last_login);
  const account = createLoggedInAccount(document.email, lastRenewedAt);

  return {
    ...account,
    tokens: typeof document.tokens === "number" ? document.tokens : account.tokens,
  };
}

async function findUserDocument(email: string) {
  const result = await appwriteDatabases.listDocuments<AppwriteUserDocument>(
    APPWRITE_DATABASE_ID,
    APPWRITE_USERS_COLLECTION_ID,
    [Query.equal("email", [normalizeEmail(email)]), Query.limit(1)],
  );

  return result.documents[0] ?? null;
}

export async function requestAppwriteOtp(email: string, intent: AppwriteAuthIntent) {
  const existing = await findUserDocument(email);
  if (intent === "signIn" && !existing) {
    throw new Error("We could not find an account for that email. Choose Sign Up to create one.");
  }
  if (intent === "signUp" && existing) {
    throw new Error("An account already exists for that email. Choose Sign In to keep your saved tokens.");
  }

  return appwriteAccount.createEmailToken(ID.unique(), normalizeEmail(email));
}

export async function verifyAppwriteOtp(userId: string, secret: string) {
  try {
    const activeUser = await appwriteAccount.get();
    await appwriteAccount.deleteSession(activeUser.$id);
  } catch {
    // No active session exists, which is expected for a fresh verification.
  }

  return appwriteAccount.createSession(userId, secret);
}

export async function signOutAppwriteSession() {
  try {
    await appwriteAccount.deleteSession("current");
  } catch {
    // A missing or expired session is already equivalent to being signed out.
  }
}

export async function completeAppwriteAuth(email: string, intent: AppwriteAuthIntent, now = Date.now()): Promise<StoredAccount> {
  const normalizedEmail = normalizeEmail(email);
  const existing = await findUserDocument(normalizedEmail);

  if (existing) {
    if (intent === "signUp") {
      throw new Error("An account already exists for that email. Choose Sign In to keep your saved tokens.");
    }
    return fromDocument(existing, now);
  }

  if (intent === "signIn") {
    throw new Error("We could not find an account for that email. Choose Sign Up to create one.");
  }

  const account = createLoggedInAccount(normalizedEmail, now);
  const created = await appwriteDatabases.createDocument<AppwriteUserDocument>(
    APPWRITE_DATABASE_ID,
    APPWRITE_USERS_COLLECTION_ID,
    ID.unique(),
    {
      email: normalizedEmail,
      tokens: account.tokens,
      last_login: new Date(account.lastRenewedAt).toISOString(),
    },
  );

  return fromDocument(created, now);
}

export async function saveAppwriteAccount(account: StoredAccount) {
  const identifier = account.identifier;
  if (account.mode !== "loggedIn" || !identifier) return;

  const document = await findUserDocument(identifier);
  if (!document) {
    throw new Error("Your Appwrite token record is unavailable. Please sign in again.");
  }

  await appwriteDatabases.updateDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_USERS_COLLECTION_ID,
    document.$id,
    {
      tokens: account.tokens,
      last_login: new Date(account.lastRenewedAt).toISOString(),
    },
  );
}
