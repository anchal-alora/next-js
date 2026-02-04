import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { PUBLIC_ROUTES } from "@/lib/publicRoutes";
import { getReportSlugs } from "@/lib/server/reports";
import { getNewsroomSlugs } from "@/lib/server/newsroom";
import { getTeamSlugs } from "@/lib/server/team";

type ChangeFrequency = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const changeFrequencyByRoute: Partial<Record<(typeof PUBLIC_ROUTES)[number], ChangeFrequency>> = {
    "/": "weekly",
    "/insights": "weekly",
    "/insights/explore": "weekly",
    "/newsroom": "weekly",
    "/services": "monthly",
    "/industries": "monthly",
    "/about": "monthly",
    "/contact": "monthly",
    "/careers": "monthly",
    "/privacy": "yearly",
    "/terms": "yearly",
    "/cookies": "yearly",
  };

  const priorityByRoute: Partial<Record<(typeof PUBLIC_ROUTES)[number], number>> = {
    "/": 1,
    "/insights": 0.9,
    "/insights/explore": 0.8,
    "/newsroom": 0.8,
    "/services": 0.8,
    "/industries": 0.8,
    "/about": 0.7,
    "/contact": 0.7,
    "/careers": 0.6,
    "/privacy": 0.3,
    "/terms": 0.3,
    "/cookies": 0.3,
  };

  const reportSlugs = await getReportSlugs();
  const newsroomSlugs = await getNewsroomSlugs();
  const teamSlugs = await getTeamSlugs();

  return [
    ...PUBLIC_ROUTES.map((route) => ({
      url: `${SITE_URL}${route}`,
      lastModified: now,
      changeFrequency: changeFrequencyByRoute[route] ?? ("monthly" as ChangeFrequency),
      priority: priorityByRoute[route] ?? 0.5,
    })),
    ...reportSlugs.map((slug) => ({
      url: `${SITE_URL}/insights/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as ChangeFrequency,
      priority: 0.7,
    })),
    ...newsroomSlugs.map((slug) => ({
      url: `${SITE_URL}/newsroom/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as ChangeFrequency,
      priority: 0.6,
    })),
    ...teamSlugs.map((slug) => ({
      url: `${SITE_URL}/team/${slug}`,
      lastModified: now,
      changeFrequency: "yearly" as ChangeFrequency,
      priority: 0.3,
    })),
  ];
}
