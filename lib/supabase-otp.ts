import { supabase } from "./supabase";

function readableOtpError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("rate limit")) {
    return "Too many codes were requested. Please wait a moment and try again.";
  }
  if (normalized.includes("invalid") || normalized.includes("expired")) {
    return "That verification code is invalid or expired. Request a new code and try again.";
  }
  return "We could not verify your email with Supabase. Please try again.";
}

export async function requestSupabaseOtp(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });

  if (error) {
    throw new Error(readableOtpError(error.message));
  }
}

export async function verifySupabaseOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error || !data.session) {
    throw new Error(readableOtpError(error?.message ?? "The verification session is unavailable."));
  }

  return data;
}
