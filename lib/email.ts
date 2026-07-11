const FROM = process.env.EMAIL_FROM ?? "Bezoekje <onboarding@resend.dev>";

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV === "production")
      throw new Error("RESEND_API_KEY is not set");
    // Dev-only fallback so the flow is testable without a Resend account.
    console.log(`[dev] Inlogcode voor ${to}: ${otp}`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      subject: `Je inlogcode is ${otp}`,
      text: `Je inlogcode is ${otp}. De code is 10 minuten geldig.\n\nHeb je deze code niet zelf aangevraagd? Dan kun je deze e-mail gewoon negeren.`,
    }),
  });
  if (!res.ok) throw new Error(`Resend responded with ${res.status}`);
}
