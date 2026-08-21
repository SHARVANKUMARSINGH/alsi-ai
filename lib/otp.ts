export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MS = 10 * 60 * 1000;

export function generateOtp(random = Math.random) {
  const value = Math.floor(random() * 1_000_000);
  return value.toString().padStart(OTP_LENGTH, "0");
}

export function isValidOtp(input: string, expected: string, issuedAt: number, now = Date.now()) {
  return input.trim() === expected && now - issuedAt <= OTP_EXPIRY_MS;
}
