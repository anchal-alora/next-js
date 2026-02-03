import { NextResponse } from "next/server";
import { getSignedMediaKitDownloadUrl } from "@/lib/r2";
import { downloadRatelimit, getClientIp, checkRateLimit } from "@/lib/ratelimit";

const MEDIA_KIT_OBJECT_KEY = "logos.zip";

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

  let signedUrl: string;
  try {
    signedUrl = await getSignedMediaKitDownloadUrl(MEDIA_KIT_OBJECT_KEY, 60 * 15);
  } catch (error) {
    console.error("Failed to sign media kit download", error);
    return NextResponse.json({ error: "Download unavailable" }, { status: 500 });
  }

  const response = NextResponse.redirect(signedUrl);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

