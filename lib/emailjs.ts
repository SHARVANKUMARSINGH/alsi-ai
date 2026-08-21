const EMAILJS_ENDPOINT = "https://api.emailjs.com/api/v1.0/email/send";

const serviceId = process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID;
const templateId = process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID;
const publicKey = process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY;

function getEmailJsError(status: number, responseText: string) {
  const normalized = responseText.toLowerCase();

  if (normalized.includes("recipient") || normalized.includes("to_email")) {
    return "Email delivery needs the EmailJS template recipient set to {{to_email}}. Update the template and try again.";
  }
  if (status === 401 || status === 403) {
    return "Email delivery is not authorized. Check the EmailJS service, template, and public key settings.";
  }
  if (status === 429) {
    return "Too many verification requests were sent. Please wait a moment and try again.";
  }
  return "We could not send the verification code. Please try again.";
}

export async function sendLoginOtp(email: string, otp: string) {
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
        to_email: email,
        email,
      },
    }),
  });

  if (!response.ok) {
    const responseText = await response.text().catch(() => "");
    throw new Error(getEmailJsError(response.status, responseText));
  }
}
