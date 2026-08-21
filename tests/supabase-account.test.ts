import { describe, expect, it } from "vitest";

import { accountFromSupabaseRecord } from "../lib/supabase-account";

describe("Supabase account record mapping", () => {
  it("maps a users-table record into the authenticated token account", () => {
    const account = accountFromSupabaseRecord({
      email: "person@example.com",
      tokens: 67,
      last_login: "2026-08-21T00:00:00.000Z",
    });

    expect(account).toMatchObject({
      mode: "loggedIn",
      identifier: "person@example.com",
      tokens: 67,
      lastRenewedAt: Date.parse("2026-08-21T00:00:00.000Z"),
    });
  });
});
