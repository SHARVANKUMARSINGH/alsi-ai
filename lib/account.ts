import AsyncStorage from "@react-native-async-storage/async-storage";

import type { AlsiModelId } from "@/lib/models";

const ACCOUNT_STORAGE_KEY = "alsi-ai.account.v1";
export const LOGGED_IN_TOKEN_RENEWAL_MS = 4 * 60 * 60 * 1000;
export const GUEST_STARTING_TOKENS = 30;
export const LOGGED_IN_STARTING_TOKENS = 100;

export type AccountMode = "guest" | "loggedIn";

export type StoredAccount = {
  mode: AccountMode;
  identifier?: string;
  tokens: number;
  lastRenewedAt: number;
  createdAt: number;
  selectedModelId: AlsiModelId;
};

export function createGuestAccount(now = Date.now()): StoredAccount {
  return {
    mode: "guest",
    tokens: GUEST_STARTING_TOKENS,
    lastRenewedAt: now,
    createdAt: now,
    selectedModelId: "lite",
  };
}

export function createLoggedInAccount(identifier: string, now = Date.now()): StoredAccount {
  return {
    mode: "loggedIn",
    identifier: identifier.trim(),
    tokens: LOGGED_IN_STARTING_TOKENS,
    lastRenewedAt: now,
    createdAt: now,
    selectedModelId: "lite",
  };
}

export function isStoredAccount(value: unknown): value is StoredAccount {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<StoredAccount>;
  return (
    (candidate.mode === "guest" || candidate.mode === "loggedIn") &&
    typeof candidate.tokens === "number" &&
    typeof candidate.lastRenewedAt === "number" &&
    typeof candidate.createdAt === "number" &&
    (candidate.selectedModelId === "lite" || candidate.selectedModelId === "standard" || candidate.selectedModelId === "pro")
  );
}

export function refreshAccountTokens(account: StoredAccount, now = Date.now()): StoredAccount {
  if (account.mode !== "loggedIn") return account;

  const elapsed = now - account.lastRenewedAt;
  const elapsedRenewals = Math.floor(elapsed / LOGGED_IN_TOKEN_RENEWAL_MS);
  if (elapsedRenewals < 1) return account;

  return {
    ...account,
    tokens: LOGGED_IN_STARTING_TOKENS,
    lastRenewedAt: account.lastRenewedAt + elapsedRenewals * LOGGED_IN_TOKEN_RENEWAL_MS,
  };
}

export function getNextRenewalAt(account: StoredAccount) {
  return account.mode === "loggedIn" ? account.lastRenewedAt + LOGGED_IN_TOKEN_RENEWAL_MS : null;
}

export function canAccessModel(account: StoredAccount, modelId: AlsiModelId) {
  return account.mode === "loggedIn" || modelId === "lite";
}

export function chargeTokens(account: StoredAccount, tokenCost: number): StoredAccount | null {
  if (tokenCost < 1 || account.tokens < tokenCost) return null;
  return { ...account, tokens: account.tokens - tokenCost };
}

export async function loadStoredAccount(): Promise<StoredAccount | null> {
  try {
    const raw = await AsyncStorage.getItem(ACCOUNT_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isStoredAccount(parsed) ? refreshAccountTokens(parsed) : null;
  } catch {
    return null;
  }
}

export async function saveStoredAccount(account: StoredAccount) {
  await AsyncStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(account));
}

export async function clearStoredAccount() {
  await AsyncStorage.removeItem(ACCOUNT_STORAGE_KEY);
}
