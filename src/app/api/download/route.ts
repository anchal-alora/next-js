import { NextResponse } from "next/server";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { getSignedReportDownloadUrl } from "@/lib/r2";
import { downloadRatelimit, getClientIp, checkRateLimit } from "@/lib/ratelimit";

async function tryLocalPublicFallback(objectKey: string, requestUrl: string): Promise<string | null> {
  // Dev-only escape hatch: if a PDF exists in `public/` locally, allow downloading it without R2.
  // This keeps local testing simple while production continues to use signed R2 URLs.
  const allow =
    process.env.NODE_ENV !== "production" || String(process.env.ALLOW_PUBLIC_DOWNLOAD_FALLBACK ?? "") === "1";
  if (!allow) return null;

  const cleanKey = String(objectKey ?? "").replace(/^\/+/, "");
  if (!cleanKey) return null;

  const publicPath = path.join(process.cwd(), "public", cleanKey);
  try {
    await fs.access(publicPath);
  } catch {
    return null;
  }

  return new URL(`/${cleanKey}`, requestUrl).toString();
}

export async function GET(request: Request) {
  // Rate limiting
  const clientIp = getClientIp(request);
  const rateLimitResult = await checkRateLimit(downloadRatelimit, clientIp);
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

  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const record = await prisma.downloadToken.findUnique({
    where: { tokenHash },
  });

  if (!record) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  }

  const now = new Date();
  if (record.expiresAt < now) {
    return NextResponse.json({ error: "Token expired" }, { status: 410 });
  }

  if (record.usedAt) {
    return NextResponse.json({ error: "Token already used" }, { status: 410 });
  }

  let signedUrl: string;
  try {
    signedUrl = await getSignedReportDownloadUrl(record.objectKey, 60 * 15);
  } catch (error) {
    const fallbackUrl = await tryLocalPublicFallback(record.objectKey, request.url);
    if (!fallbackUrl) {
      console.error("Failed to sign R2 download", error);
      return NextResponse.json({ error: "Download unavailable" }, { status: 500 });
    }
    signedUrl = fallbackUrl;
  }

  await prisma.downloadToken.update({
    where: { id: record.id },
    data: { usedAt: now },
  });

  const response = NextResponse.redirect(signedUrl);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
