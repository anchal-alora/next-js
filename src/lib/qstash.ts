import { Client } from "@upstash/qstash";

const qstashToken = process.env.QSTASH_TOKEN;
const crmWebhookUrl = process.env.CRM_WEBHOOK_URL;

const client = qstashToken ? new Client({ token: qstashToken }) : null;

export async function enqueueCrmSync(payload: Record<string, unknown>) {
  if (!client || !crmWebhookUrl) {
    console.warn("QStash or CRM webhook not configured; skipping CRM sync enqueue.");
    return;
  }

  await client.publishJSON({
    url: crmWebhookUrl,
    body: payload,
  });
}
