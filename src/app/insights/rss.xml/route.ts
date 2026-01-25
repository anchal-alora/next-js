import { SITE_URL } from "@/lib/seo";
import { getAllReports } from "@/lib/server/reports";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toUtcDate(value: string | undefined | null, fallback: string) {
  if (!value) return fallback;
  const ts = Date.parse(value);
  return Number.isFinite(ts) ? new Date(ts).toUTCString() : fallback;
}

export async function GET() {
  const reports = await getAllReports();

  const sorted = [...reports].sort((a, b) => {
    const da = a.date ? Date.parse(a.date) : 0;
    const db = b.date ? Date.parse(b.date) : 0;
    return (Number.isFinite(db) ? db : 0) - (Number.isFinite(da) ? da : 0);
  });

  const feedUrl = `${SITE_URL}/insights/rss.xml`;
  const channelUrl = `${SITE_URL}/insights`;
  const buildDate = new Date().toUTCString();

  const items = sorted.slice(0, 50).map((report) => {
    const link = `${SITE_URL}/insights/${report.slug}`;
    const pubDate = toUtcDate(report.date, buildDate);

    return `
    <item>
      <title>${escapeXml(report.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${escapeXml(pubDate)}</pubDate>
      <description>${escapeXml(report.description || "")}</description>
    </item>`;
  });

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Alora Advisory Insights</title>
    <link>${escapeXml(channelUrl)}</link>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
    <description>Research reports, case studies, and insights from Alora Advisory.</description>
    <language>en</language>
    <lastBuildDate>${escapeXml(buildDate)}</lastBuildDate>
    <ttl>60</ttl>
    ${items.join("\n")}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
