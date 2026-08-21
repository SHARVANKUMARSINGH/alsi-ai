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

export async function requestAppwriteOtp(email: string) {
  return appwriteAccount.createEmailToken(ID.unique(), normalizeEmail(email));
}

export async function verifyAppwriteOtp(userId: string, secret: string) {
  return appwriteAccount.createSession(userId, secret);
}

export async function loadOrCreateAppwriteAccount(email: string, now = Date.now()): Promise<StoredAccount> {
  const normalizedEmail = normalizeEmail(email);
  const existing = await findUserDocument(normalizedEmail);

  if (existing) {
    return fromDocument(existing, now);
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
