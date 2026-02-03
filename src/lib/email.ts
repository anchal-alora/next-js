import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.EMAIL_FROM;
const internalTo = process.env.EMAIL_TO_INTERNAL ?? "sales@aloraadvisory.com";

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendInternalNotification(subject: string, html: string) {
  if (!resend || !fromAddress || !internalTo) {
    console.warn("Resend not configured; skipping email send.");
    return;
  }

  const toList = internalTo
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  await resend.emails.send({
    from: fromAddress,
    to: toList.length > 1 ? toList : toList[0],
    subject,
    html,
  });
}
