import { beforeEach, describe, expect, it, vi } from "vitest";

const { signInWithOtp, verifyOtp } = vi.hoisted(() => ({
  signInWithOtp: vi.fn(),
  verifyOtp: vi.fn(),
}));

vi.mock("../lib/supabase", () => ({
  supabase: { auth: { signInWithOtp, verifyOtp } },
}));

import { requestSupabaseOtp, verifySupabaseOtp } from "../lib/supabase-otp";

describe("Supabase native email OTP", () => {
  beforeEach(() => {
    signInWithOtp.mockReset();
    verifyOtp.mockReset();
  });

  it("requests an OTP through Supabase auth", async () => {
    signInWithOtp.mockResolvedValue({ error: null });

    await requestSupabaseOtp("person@example.com");

    expect(signInWithOtp).toHaveBeenCalledWith({
      email: "person@example.com",
      options: { shouldCreateUser: true },
    });
  });

  it("verifies a six-digit email token through Supabase auth", async () => {
    const session = { access_token: "session-token" };
    verifyOtp.mockResolvedValue({ data: { session }, error: null });

    await expect(verifySupabaseOtp("person@example.com", "123456")).resolves.toEqual({ session });
    expect(verifyOtp).toHaveBeenCalledWith({ email: "person@example.com", token: "123456", type: "email" });
  });

  it("turns Supabase rate-limit errors into useful recovery guidance", async () => {
    signInWithOtp.mockResolvedValue({ error: { message: "Email rate limit exceeded" } });

    await expect(requestSupabaseOtp("person@example.com")).rejects.toThrow("Too many codes");
  });
});
