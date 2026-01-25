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

export async function GET() {
  const reports = await getAllReports();
  const items = reports.map((report) => {
    const link = `${SITE_URL}/insights/${report.slug}`;
    const pubDate = report.date ? new Date(report.date).toUTCString() : new Date().toUTCString();

    return `\n    <item>\n      <title>${escapeXml(report.title)}</title>\n      <link>${escapeXml(link)}</link>\n      <guid>${escapeXml(link)}</guid>\n      <pubDate>${escapeXml(pubDate)}</pubDate>\n      <description>${escapeXml(report.description || "")}</description>\n    </item>`;
  });

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>\n<rss version="2.0">\n  <channel>\n    <title>Alora Advisory Insights</title>\n    <link>${SITE_URL}/insights</link>\n    <description>Research reports, case studies, and insights from Alora Advisory.</description>\n    ${items.join("\n")}\n  </channel>\n</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
