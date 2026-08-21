import { createLoggedInAccount, type StoredAccount } from "./account";
import { supabase } from "./supabase";

type SupabaseUserRecord = {
  email: string;
  tokens: number;
  last_login: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function accountFromSupabaseRecord(record: SupabaseUserRecord, now = Date.now()): StoredAccount {
  const lastRenewedAt = Number.isNaN(Date.parse(record.last_login)) ? now : Date.parse(record.last_login);
  const account = createLoggedInAccount(record.email, lastRenewedAt);

  return {
    ...account,
    tokens: typeof record.tokens === "number" ? record.tokens : account.tokens,
  };
}

export async function loadOrCreateSupabaseAccount(email: string, now = Date.now()): Promise<StoredAccount> {
  const normalizedEmail = normalizeEmail(email);
  const { data: existing, error: readError } = await supabase
    .from("users")
    .select("email, tokens, last_login")
    .eq("email", normalizedEmail)
    .maybeSingle<SupabaseUserRecord>();

  if (readError) {
    throw new Error("Could not look up this account in Supabase. Please try again.");
  }

  if (existing) {
    return accountFromSupabaseRecord(existing, now);
  }

  const account = createLoggedInAccount(normalizedEmail, now);
  const { data: created, error: insertError } = await supabase
    .from("users")
    .insert({
      email: account.identifier,
      tokens: account.tokens,
      last_login: new Date(account.lastRenewedAt).toISOString(),
    })
    .select("email, tokens, last_login")
    .single<SupabaseUserRecord>();

  if (insertError || !created) {
    throw new Error("Could not create this account in Supabase. Please try again.");
  }

  return accountFromSupabaseRecord(created, now);
}

export async function saveSupabaseAccount(account: StoredAccount) {
  if (account.mode !== "loggedIn" || !account.identifier) return;

  const { error } = await supabase
    .from("users")
    .update({
      tokens: account.tokens,
      last_login: new Date(account.lastRenewedAt).toISOString(),
    })
    .eq("email", normalizeEmail(account.identifier));

  if (error) {
    throw new Error("Could not synchronize the account token balance.");
  }
}
