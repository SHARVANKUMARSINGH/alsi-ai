import { describe, expect, it } from "vitest";

import {
  GUEST_STARTING_TOKENS,
  LOGGED_IN_STARTING_TOKENS,
  LOGGED_IN_TOKEN_RENEWAL_MS,
  canAccessModel,
  chargeTokens,
  createGuestAccount,
  createLoggedInAccount,
  getNextRenewalAt,
  refreshAccountTokens,
} from "../lib/account";

describe("ALSI account and token helpers", () => {
  it("creates a guest account with exactly 30 non-renewing tokens and Lite-only access", () => {
    const guest = createGuestAccount(100);

    expect(guest.tokens).toBe(GUEST_STARTING_TOKENS);
    expect(refreshAccountTokens(guest, 100 + LOGGED_IN_TOKEN_RENEWAL_MS * 3)).toEqual(guest);
    expect(canAccessModel(guest, "lite")).toBe(true);
    expect(canAccessModel(guest, "standard")).toBe(false);
  });

  it("renews a logged-in account to exactly 100 tokens every four hours", () => {
    const account = createLoggedInAccount("person@example.com", 1_000);
    const spent = chargeTokens(account, 5);
    const renewed = refreshAccountTokens(spent!, 1_000 + LOGGED_IN_TOKEN_RENEWAL_MS * 2 + 2);

    expect(account.tokens).toBe(LOGGED_IN_STARTING_TOKENS);
    expect(spent?.tokens).toBe(95);
    expect(renewed.tokens).toBe(LOGGED_IN_STARTING_TOKENS);
    expect(renewed.lastRenewedAt).toBe(1_000 + LOGGED_IN_TOKEN_RENEWAL_MS * 2);
    expect(getNextRenewalAt(renewed)).toBe(1_000 + LOGGED_IN_TOKEN_RENEWAL_MS * 3);
  });

  it("rejects token charges greater than the available balance", () => {
    expect(chargeTokens({ ...createGuestAccount(), tokens: 0 }, 1)).toBeNull();
  });

  it("keeps the balance unchanged until a completion has actually succeeded", () => {
    const account = createGuestAccount(100);

    expect(account.tokens).toBe(GUEST_STARTING_TOKENS);
    expect(chargeTokens(account, 1)?.tokens).toBe(GUEST_STARTING_TOKENS - 1);
    expect(account.tokens).toBe(GUEST_STARTING_TOKENS);
  });
});
