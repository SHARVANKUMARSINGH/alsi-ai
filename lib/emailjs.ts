const EMAILJS_ENDPOINT = "https://api.emailjs.com/api/v1.0/email/send";

const serviceId = process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID;
const templateId = process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID;
const publicKey = process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY;

export async function sendLoginOtp(_email: string, otp: string) {
  if (!serviceId || !templateId || !publicKey) {
    throw new Error("Email verification is not configured. Please try again later.");
  }

  const response = await fetch(EMAILJS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        otp,
      },
    }),
  });

  if (!response.ok) {
    throw new Error("We could not send the verification code. Please try again.");
  }
}
