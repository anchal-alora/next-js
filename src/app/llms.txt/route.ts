import { SITE_URL } from "@/lib/seo";

const body = `# Alora Advisory

## About
Alora Advisory provides market research and strategic advisory insights for technology, healthcare, energy, and mobility sectors.

## Primary discovery
- ${SITE_URL}/sitemap.xml
- ${SITE_URL}/insights/rss.xml
- ${SITE_URL}/newsroom/rss.xml

## Key sections
- ${SITE_URL}/insights
- ${SITE_URL}/insights/explore
- ${SITE_URL}/newsroom
- ${SITE_URL}/services
- ${SITE_URL}/industries
- ${SITE_URL}/who-we-are
- ${SITE_URL}/contact

## Crawling guidance
- Prefer canonical URLs with no query parameters.
- Insights detail pages live at /insights/{slug}.
- Newsroom detail pages live at /newsroom/{slug}.
`;

export async function GET() {
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
