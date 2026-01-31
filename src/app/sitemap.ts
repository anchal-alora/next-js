import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { getReportSlugs } from "@/lib/server/reports";
import { getNewsroomSlugs } from "@/lib/server/newsroom";
import { getTeamSlugs } from "@/lib/server/team";

type ChangeFrequency = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: Array<{ route: string; changeFrequency: ChangeFrequency; priority: number }> = [
    { route: "/", changeFrequency: "weekly", priority: 1 },
    { route: "/insights", changeFrequency: "weekly", priority: 0.9 },
    { route: "/insights/explore", changeFrequency: "weekly", priority: 0.8 },
    { route: "/services", changeFrequency: "monthly", priority: 0.8 },
    { route: "/industries", changeFrequency: "monthly", priority: 0.8 },
    { route: "/about", changeFrequency: "monthly", priority: 0.7 },
    { route: "/careers", changeFrequency: "monthly", priority: 0.6 },
    { route: "/contact", changeFrequency: "monthly", priority: 0.7 },
    { route: "/privacy", changeFrequency: "yearly", priority: 0.3 },
    { route: "/terms", changeFrequency: "yearly", priority: 0.3 },
    { route: "/cookies", changeFrequency: "yearly", priority: 0.3 },
    { route: "/newsroom", changeFrequency: "weekly", priority: 0.8 },
  ];

  const reportSlugs = await getReportSlugs();
  const newsroomSlugs = await getNewsroomSlugs();
  const teamSlugs = await getTeamSlugs();

  return [
    ...staticRoutes.map(({ route, changeFrequency, priority }) => ({
      url: `${SITE_URL}${route}`,
      lastModified: now,
      changeFrequency,
      priority,
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
