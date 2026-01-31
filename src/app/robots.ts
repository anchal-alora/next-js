import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const vercelEnv = process.env.VERCEL_ENV;

  const base: MetadataRoute.Robots = {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/_next/"],
    },
  };

  // Only advertise sitemap/host for production to avoid confusing crawlers on previews.
  if (vercelEnv === "production") {
    return {
      ...base,
      sitemap: `${SITE_URL}/sitemap.xml`,
      host: SITE_URL,
    };
  }

  return base;
}
