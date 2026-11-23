// Sends one plain email through Resend. Server code only.
// Without RESEND_API_KEY it quietly does nothing, so the site works before email is set up.
// MAIL_FROM can be set in Vercel to change the sender; the domain of the sender must be verified in Resend.
export async function sendMail(to: string, subject: string, text: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.MAIL_FROM ?? "Sweet & Salty Diaries <noreply@sweetnsaltydiaries.com>",
      to: [to],
      subject,
      text,
    }),
  });
}
