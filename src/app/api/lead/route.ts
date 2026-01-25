import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getReportBySlug } from "@/lib/server/reports";
import { enqueueCrmSync } from "@/lib/qstash";
import { sendInternalNotification } from "@/lib/email";
import { formRatelimit, getClientIp, checkRateLimit } from "@/lib/ratelimit";

const LeadSchema = z.object({
  fullName: z.string().min(1).max(100),
  email: z.string().email().max(254),
  phone: z.string().max(20).optional(),

  reportSlug: z.string().min(1),
  reportTitle: z.string().optional(),
  reportIndustry: z.string().optional(),

  formType: z.enum(["downloadable-report", "non-downloadable-report"]),

  source: z.string().optional(),
  pagePath: z.string().optional(),
  pageUrl: z.string().optional(),
  referrer: z.string().optional(),
  meta: z.record(z.string(), z.string()).optional(),
});

type Meta = Record<string, string>;

function normalizeObjectKey(link: string): string {
  return link.startsWith("/") ? link.slice(1) : link;
}

function pickMeta(meta: Meta | undefined, allowedKeys: readonly string[]): Meta | undefined {
  if (!meta) return undefined;
  const out: Meta = {};
  for (const key of allowedKeys) {
    const value = meta[key];
    if (typeof value === "string" && value.trim().length > 0) out[key] = value;
  }
  return Object.keys(out).length ? out : undefined;
}

function createToken(): { token: string; tokenHash: string } {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  return { token, tokenHash };
}

export async function POST(request: Request) {
  // Rate limiting
  const clientIp = getClientIp(request);
  const rateLimitResult = await checkRateLimit(formRatelimit, clientIp);
  if (rateLimitResult && !rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
          "X-RateLimit-Reset": String(rateLimitResult.reset),
        },
      }
    );
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Honeypot field (optional; do not store)
  const botField =
    typeof payload["botField"] === "string"
      ? (payload["botField"] as string)
      : typeof payload["bot-field"] === "string"
        ? (payload["bot-field"] as string)
        : "";
  if (botField.trim()) {
    return NextResponse.json({ ok: true });
  }

  const parsed = LeadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid lead payload" }, { status: 400 });
  }

  const data = parsed.data;
  const report = await getReportBySlug(data.reportSlug);
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const pagePath = (data.pagePath ?? "").toString();
  const pageUrl = (data.pageUrl ?? "").toString();
  const referrer = data.referrer ?? null;
  const source = data.source ?? null;

  // Only store whitelisted meta keys for leads.
  const meta = pickMeta(data.meta, ["campaign", "variant"]);

  try {
    const ttlMinutes = Number(process.env.DOWNLOAD_TOKEN_TTL_MINUTES ?? 15);

    const result = await prisma.$transaction(async (tx) => {
      const lead = await tx.lead.create({
        data: {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone ?? null,
          reportSlug: report.slug ?? data.reportSlug,
          reportTitle: report.title ?? data.reportTitle ?? null,
          reportIndustry: report.industry ?? data.reportIndustry ?? null,
          formType: data.formType,
          source,
          pagePath,
          pageUrl,
          referrer,
          meta: meta ?? undefined,
        },
      });

      await tx.submissionIndex.create({
        data: {
          formType: data.formType,
          email: lead.email,
          name: lead.fullName,
          phone: lead.phone,
          reportSlug: lead.reportSlug,
          source,
          pagePath,
          pageUrl,
          referrer,
          status: null,
          meta: undefined,
          sourceTable: "Leads",
          sourceId: lead.id,
        },
      });

      // Create token only for downloadable reports.
      if (data.formType === "downloadable-report" && report.contentFormat === "downloadable" && report.link) {
        const { token, tokenHash } = createToken();
        const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
        const objectKey = normalizeObjectKey(report.link);

        await tx.downloadToken.create({
          data: {
            tokenHash,
            objectKey,
            expiresAt,
            usedAt: null,
            leadId: lead.id,
            reportSlug: lead.reportSlug,
            meta: undefined,
          },
        });

        return { lead, token };
      }

      return { lead, token: null };
    });

    await enqueueCrmSync({
      leadId: result.lead.id,
      email: result.lead.email,
      fullName: result.lead.fullName,
      reportSlug: result.lead.reportSlug,
      reportTitle: result.lead.reportTitle,
      reportIndustry: result.lead.reportIndustry,
      formType: result.lead.formType,
      source: result.lead.source,
    });

    await sendInternalNotification(
      "New insight lead",
      `<p><strong>Name:</strong> ${result.lead.fullName}</p>
<p><strong>Email:</strong> ${result.lead.email}</p>
<p><strong>Report:</strong> ${result.lead.reportTitle ?? result.lead.reportSlug ?? "(unknown)"}</p>
<p><strong>Form:</strong> ${result.lead.formType}</p>
${pageUrl ? `<p><strong>Page URL:</strong> ${pageUrl}</p>` : ""}`
    );

    if (result.token) {
      return NextResponse.json({ downloadUrl: `/api/download?token=${result.token}` });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Lead submission failed", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
