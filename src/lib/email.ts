import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.EMAIL_FROM;
const internalTo = process.env.EMAIL_TO_INTERNAL;

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendInternalNotification(subject: string, html: string) {
  if (!resend || !fromAddress || !internalTo) {
    console.warn("Resend not configured; skipping email send.");
    return;
  }

  await resend.emails.send({
    from: fromAddress,
    to: internalTo,
    subject,
    html,
  });
}
