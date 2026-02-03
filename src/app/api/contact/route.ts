import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendInternalNotification } from "@/lib/email";
import { formRatelimit, getClientIp, checkRateLimit } from "@/lib/ratelimit";

const TRACKING_SCHEMA = {
  source: z.string().optional(),
  referrer: z.string().optional(),
  pagePath: z.string().optional(),
  pageUrl: z.string().optional(),
  meta: z.record(z.string(), z.string()).optional(),
};

const ContactPayloadSchema = z.object({
  formType: z.literal("contact"),
  fullName: z.string().min(1).max(100),
  email: z.string().email().max(254),
  phone: z.string().max(20).optional(),
  company: z.string().max(150).optional(),
  inquiryType: z.string().optional(),
  subject: z.string().max(100).optional(),
  message: z.string().max(750).optional(),
  ...TRACKING_SCHEMA,
});

const CareersPayloadSchema = z.object({
  formType: z.literal("careers"),
  fullName: z.string().min(1).max(100),
  email: z.string().email().max(254),
  phone: z.string().max(20),
  areaOfInterest: z.string().min(1).max(100),
  background: z.string().min(20).max(500),
  ...TRACKING_SCHEMA,
});

const NewsletterPayloadSchema = z.object({
  formType: z.literal("newsletter"),
  email: z.string().email().max(254),
  ...TRACKING_SCHEMA,
});

const AnyFormSchema = z.discriminatedUnion("formType", [
  ContactPayloadSchema,
  CareersPayloadSchema,
  NewsletterPayloadSchema,
]);

type Meta = Record<string, string>;

function pickMeta(meta: Meta | undefined, allowedKeys: readonly string[]): Meta | undefined {
  if (!meta) return undefined;
  const out: Meta = {};
  for (const key of allowedKeys) {
    const value = meta[key];
    if (typeof value === "string" && value.trim().length > 0) out[key] = value;
  }
  return Object.keys(out).length ? out : undefined;
}

function buildSubmissionIndexMeta(formType: string, data: Record<string, unknown>): Record<string, string> | undefined {
  if (formType === "contact") {
    const inquiryType = typeof data.inquiryType === "string" ? data.inquiryType : "";
    return inquiryType ? { inquiryType } : undefined;
  }

  if (formType === "careers") {
    const areaOfInterest = typeof data.areaOfInterest === "string" ? data.areaOfInterest : "";
    return areaOfInterest ? { areaOfInterest } : undefined;
  }

  return undefined;
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

  const parsed = AnyFormSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid form payload" }, { status: 400 });
  }

  const data = parsed.data;
  const pagePath = (data.pagePath ?? "").toString();
  const pageUrl = (data.pageUrl ?? "").toString();
  const referrer = data.referrer ?? null;
  const source = data.source ?? null;

  try {
    if (data.formType === "contact") {
      const meta = pickMeta(data.meta, ["additionalContext", "customField"]);

      const result = await prisma.$transaction(async (tx) => {
        const row = await tx.contactForm.create({
          data: {
            formType: "contact",
            fullName: data.fullName,
            email: data.email,
            phone: data.phone ?? null,
            company: data.company ?? null,
            inquiryType: data.inquiryType ?? null,
            subject: data.subject ?? null,
            message: data.message ?? null,
            source,
            pagePath,
            pageUrl,
            referrer,
            meta: meta ?? undefined,
          },
        });

        const indexMeta = buildSubmissionIndexMeta("contact", data);
        await tx.submissionIndex.create({
          data: {
            formType: "contact",
            email: row.email,
            name: row.fullName,
            phone: row.phone,
            reportSlug: null,
            source,
            pagePath,
            pageUrl,
            referrer,
            status: null,
            meta: indexMeta ?? undefined,
            sourceTable: "ContactForms",
            sourceId: row.id,
          },
        });

        return row;
      });

      await sendInternalNotification(
        "New contact submission",
        `<p><strong>Name:</strong> ${result.fullName}</p>
<p><strong>Email:</strong> ${result.email}</p>
${result.phone ? `<p><strong>Phone:</strong> ${result.phone}</p>` : ""}
${result.company ? `<p><strong>Company:</strong> ${result.company}</p>` : ""}
${result.inquiryType ? `<p><strong>Inquiry Type:</strong> ${result.inquiryType}</p>` : ""}
${result.subject ? `<p><strong>Subject:</strong> ${result.subject}</p>` : ""}
${result.message ? `<p><strong>Message:</strong> ${result.message}</p>` : ""}
${pageUrl ? `<p><strong>Page URL:</strong> ${pageUrl}</p>` : ""}`
      );

      return NextResponse.json({ ok: true });
    }

    if (data.formType === "careers") {
      const meta = pickMeta(data.meta, ["resumeUrl", "portfolioUrl", "linkedinUrl"]);

      const result = await prisma.$transaction(async (tx) => {
        const row = await tx.careersForm.create({
          data: {
            formType: "careers",
            fullName: data.fullName,
            email: data.email,
            phone: data.phone ?? null,
            areaOfInterest: data.areaOfInterest,
            background: data.background,
            source,
            pagePath,
            pageUrl,
            referrer,
            meta: meta ?? undefined,
          },
        });

        const indexMeta = buildSubmissionIndexMeta("careers", data);
        await tx.submissionIndex.create({
          data: {
            formType: "careers",
            email: row.email,
            name: row.fullName,
            phone: row.phone,
            reportSlug: null,
            source,
            pagePath,
            pageUrl,
            referrer,
            status: null,
            meta: indexMeta ?? undefined,
            sourceTable: "CareersForms",
            sourceId: row.id,
          },
        });

        return row;
      });

      await sendInternalNotification(
        "New careers submission",
        `<p><strong>Name:</strong> ${result.fullName}</p>
<p><strong>Email:</strong> ${result.email}</p>
${result.phone ? `<p><strong>Phone:</strong> ${result.phone}</p>` : ""}
<p><strong>Area of Interest:</strong> ${result.areaOfInterest}</p>
<p><strong>Background:</strong> ${result.background}</p>
${pageUrl ? `<p><strong>Page URL:</strong> ${pageUrl}</p>` : ""}`
      );

      return NextResponse.json({ ok: true });
    }

    // newsletter
    const meta = pickMeta(data.meta, ["consentVersion"]);

    const newsletter = await prisma.$transaction(async (tx) => {
      const row = await tx.newsletterForm.upsert({
        where: { email: data.email },
        update: {
          source,
          pagePath,
          pageUrl,
          referrer,
          meta: meta ?? undefined,
        },
        create: {
          formType: "newsletter",
          email: data.email,
          source,
          pagePath,
          pageUrl,
          referrer,
          meta: meta ?? undefined,
        },
      });

      // For newsletters we keep a single index entry per unique email.
      await tx.submissionIndex.upsert({
        where: {
          sourceTable_sourceId: { sourceTable: "NewsletterForms", sourceId: row.id },
        },
        update: {
          email: row.email,
          name: null,
          phone: null,
          reportSlug: null,
          source,
          pagePath,
          pageUrl,
          referrer,
          status: null,
          meta: undefined,
        },
        create: {
          formType: "newsletter",
          email: row.email,
          name: null,
          phone: null,
          reportSlug: null,
          source,
          pagePath,
          pageUrl,
          referrer,
          status: null,
          meta: undefined,
          sourceTable: "NewsletterForms",
          sourceId: row.id,
        },
      });

      return row;
    });

    await sendInternalNotification(
      "New newsletter subscription",
      `<p><strong>Email:</strong> ${newsletter.email}</p>${pageUrl ? `\n<p><strong>Page URL:</strong> ${pageUrl}</p>` : ""}`
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Form submission failed", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
