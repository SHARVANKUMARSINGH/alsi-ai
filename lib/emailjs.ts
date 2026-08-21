import emailjs from "@emailjs/browser";

const serviceId = process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID;
const templateId = process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID;
const publicKey = process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY;

export async function sendLoginOtp(email: string, otp: string) {
  if (!serviceId || !templateId || !publicKey) {
    throw new Error("Email verification is not configured. Please try again later.");
  }

  await emailjs.send(
    serviceId,
    templateId,
    {
      otp,
      to_email: email,
      email,
    },
    publicKey,
  );
}
