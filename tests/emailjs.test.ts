import { afterEach, describe, expect, it, vi } from "vitest";

import { sendLoginOtp } from "../lib/emailjs";

describe("EmailJS OTP delivery", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts the one-time code through the EmailJS REST endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await sendLoginOtp("person@example.com", "123456");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.emailjs.com/api/v1.0/email/send",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      service_id: "service_aj8d6zc",
      template_id: "template_ck1yhuo",
      user_id: "PlbY0CXjoMSgJsIVM",
      template_params: { otp: "123456", to_email: "person@example.com", email: "person@example.com" },
    });
  });

  it("explains how to configure an EmailJS recipient when the service rejects delivery", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => "The recipients address is empty",
    }));

    await expect(sendLoginOtp("person@example.com", "123456")).rejects.toThrow("{{to_email}}");
  });
});
