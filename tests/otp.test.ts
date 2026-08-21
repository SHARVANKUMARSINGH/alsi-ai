import { describe, expect, it } from "vitest";

import { OTP_EXPIRY_MS, generateOtp, isValidOtp } from "../lib/otp";

describe("email login OTP", () => {
  it("creates a zero-padded six-digit code", () => {
    expect(generateOtp(() => 0.42)).toBe("420000");
    expect(generateOtp(() => 0.000001)).toBe("000001");
  });

  it("only accepts the matching, unexpired code", () => {
    const issuedAt = 1_000;

    expect(isValidOtp("123456", "123456", issuedAt, issuedAt + OTP_EXPIRY_MS)).toBe(true);
    expect(isValidOtp("123456", "123456", issuedAt, issuedAt + OTP_EXPIRY_MS + 1)).toBe(false);
    expect(isValidOtp("111111", "123456", issuedAt, issuedAt + 1)).toBe(false);
  });
});
