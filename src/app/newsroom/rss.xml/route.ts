import { SITE_URL } from "@/lib/seo";
import { getAllNewsroomArticles } from "@/lib/server/newsroom";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const articles = await getAllNewsroomArticles();
  const items = articles.map((article) => {
    const link = `${SITE_URL}/newsroom/${article.slug}`;
    const pubDate = article.date ? new Date(article.date).toUTCString() : new Date().toUTCString();

    return `\n    <item>\n      <title>${escapeXml(article.title)}</title>\n      <link>${escapeXml(link)}</link>\n      <guid>${escapeXml(link)}</guid>\n      <pubDate>${escapeXml(pubDate)}</pubDate>\n      <description>${escapeXml(article.summary || article.subheader || "")}</description>\n    </item>`;
  });

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>\n<rss version="2.0">\n  <channel>\n    <title>Alora Advisory Newsroom</title>\n    <link>${SITE_URL}/newsroom</link>\n    <description>Press releases and announcements from Alora Advisory.</description>\n    ${items.join("\n")}\n  </channel>\n</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
