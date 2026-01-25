import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getSignedDownloadUrl } from "@/lib/r2";
import { downloadRatelimit, getClientIp, checkRateLimit } from "@/lib/ratelimit";

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
    signedUrl = await getSignedDownloadUrl(record.objectKey, 60 * 15);
  } catch (error) {
    console.error("Failed to sign R2 download", error);
    return NextResponse.json({ error: "Download unavailable" }, { status: 500 });
  }

  await prisma.downloadToken.update({
    where: { id: record.id },
    data: { usedAt: now },
  });

  const response = NextResponse.redirect(signedUrl);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
