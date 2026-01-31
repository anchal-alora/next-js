import { cache as reactCache } from "react";
import reportsData from "../../../reports-link.json";
import type { Report } from "@/lib/reportUtils";
import { getAllNewsroomArticles } from "@/lib/server/newsroom";
import { industriesData } from "@/lib/industriesData";
import { servicesData } from "@/lib/servicesData";
import { getSearchSuggestions } from "@/lib/search/suggestions";
import type { SearchMode, SearchResponse, SearchResult, SearchScope, SearchResultType } from "@/lib/search/types";
import { getIndustryShortLabel } from "@/lib/industryConfig";

// Same dev/prod caching behavior as other server loaders in this repo.
const cache: typeof reactCache =
  process.env.NODE_ENV === "production"
    ? reactCache
    : ((<T extends (...args: unknown[]) => unknown>(fn: T) => fn) as unknown as typeof reactCache);

type SearchDoc = {
  id: string;
  type: SearchResultType;
  title: string;
  href: string;
  text: string;
  snippet?: string;
  industry?: string;
  contentType?: string;
  date?: string;
  tags?: string[];
  dateMs?: number;
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/,/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function scoreDoc(doc: SearchDoc, query: string, mode: SearchMode): number {
  const q = normalize(query);
  if (!q) return 0;

  const title = normalize(doc.title);
  const text = normalize(doc.text);
  const tokens = q.split(" ").filter(Boolean);

  const haystack = `${title} ${text}`;

  const allTokensPresent = tokens.every((t) => haystack.includes(t));
  if (!allTokensPresent) return 0;

  let score = 0;

  if (title === q) score += 1200;
  if (title.startsWith(q)) score += 800;

  const titleWords = title.split(" ").filter(Boolean);
  if (titleWords.some((w) => w.startsWith(q))) score += 650;

  if (title.includes(q)) score += 450;
  if (text.includes(q)) score += 200;

  if (tokens.length > 1) score += Math.min(200, tokens.length * 40);

  if (mode === "prefix") {
    // When the user has typed only 1–2 chars, keep results very relevant.
    const prefixHit = title.startsWith(q) || titleWords.some((w) => w.startsWith(q));
    if (!prefixHit) return 0;
    score += 100;
  }

  return score;
}

const getPageDocs = cache(async (): Promise<SearchDoc[]> => {
  const pages: SearchDoc[] = [
    { id: "page:/", type: "page", title: "Home", href: "/", text: "Alora Advisory home", snippet: "Homepage" },
    { id: "page:/about", type: "page", title: "About", href: "/about", text: "About Alora Advisory", snippet: "About Alora Advisory" },
    { id: "page:/services", type: "page", title: "Services", href: "/services", text: "Market research competitive intelligence go-to-market growth strategy", snippet: "Advisory and research services" },
    { id: "page:/industries", type: "page", title: "Industries", href: "/industries", text: "Technology healthcare automotive mobility energy sustainability", snippet: "Industry coverage and expertise" },
    { id: "page:/insights", type: "page", title: "Insights", href: "/insights", text: "Insights reports case studies analysis", snippet: "Research reports and case studies" },
    { id: "page:/insights/explore", type: "page", title: "Insights Explore", href: "/insights/explore", text: "Browse insights by topic industry type", snippet: "Browse the insights library" },
    { id: "page:/newsroom", type: "page", title: "Newsroom", href: "/newsroom", text: "Announcements press releases", snippet: "Announcements and press releases" },
    { id: "page:/careers", type: "page", title: "Careers", href: "/careers", text: "Join Alora Advisory", snippet: "Open roles and careers" },
    { id: "page:/contact", type: "page", title: "Contact", href: "/contact", text: "Get in touch", snippet: "Get in touch" },
    { id: "page:/privacy", type: "page", title: "Privacy Policy", href: "/privacy", text: "Privacy policy", snippet: "Privacy policy" },
    { id: "page:/terms", type: "page", title: "Terms", href: "/terms", text: "Terms and conditions", snippet: "Terms and conditions" },
    { id: "page:/cookies", type: "page", title: "Cookies", href: "/cookies", text: "Cookie policy", snippet: "Cookie policy" },
    { id: "page:/search", type: "page", title: "Search", href: "/search", text: "Search across Alora Advisory", snippet: "Search the site" },
  ];

  const serviceAnchors: SearchDoc[] = servicesData.map((service) => ({
    id: `services:${service.id}`,
    type: "service",
    title: service.shortTitle ?? service.title,
    href: `/services#${service.id}`,
    text: `Service ${service.title}`,
    snippet: service.title,
  }));

  const industryAnchors: SearchDoc[] = industriesData.map((industry) => ({
    id: `industries:${industry.id}`,
    type: "industry",
    title: industry.shortTitle ?? industry.title,
    href: `/industries#${industry.id}`,
    text: `Industry ${industry.title}`,
    snippet: industry.title,
  }));

  return [...pages, ...serviceAnchors, ...industryAnchors];
});

const getInsightsDocs = cache(async (): Promise<SearchDoc[]> => {
  const reports = (reportsData as { reports: Report[] }).reports ?? [];
  return reports.map((report) => {
    const date = typeof report.date === "string" ? report.date : undefined;
    const dateMs = date ? new Date(date).getTime() : undefined;
    const tags = Array.isArray(report.taggings) ? report.taggings : [];
    const industry = report.industry ? getIndustryShortLabel(report.industry) : undefined;
    const contentType = typeof report.type === "string" ? report.type : undefined;
    return {
      id: `insight:${report.id ?? report.slug}`,
      type: "insight",
      title: report.title ?? report.slug,
      href: `/insights/${report.slug}`,
      snippet: report.description,
      industry,
      contentType,
      text: [
        report.title,
        report.description,
        report.industry,
        report.type,
        report.placement,
        report.contentFormat,
        ...(tags ?? []),
      ]
        .filter(Boolean)
        .join(" "),
      date,
      dateMs,
      tags,
    } satisfies SearchDoc;
  });
});

const getNewsroomDocs = cache(async (): Promise<SearchDoc[]> => {
  const articles = await getAllNewsroomArticles();
  return articles.map((article) => {
    const date = article.date;
    const dateMs = date ? new Date(date).getTime() : undefined;
    const tags = article.tags ?? [];
    const industry = article.industry ? getIndustryShortLabel(article.industry) : undefined;
    return {
      id: `newsroom:${article.slug}`,
      type: "newsroom",
      title: article.title,
      href: `/newsroom/${article.slug}`,
      snippet: article.summary || article.subheader,
      industry,
      text: [article.title, article.subheader, article.summary, article.industry, ...(tags ?? [])]
        .filter(Boolean)
        .join(" "),
      date,
      dateMs,
      tags,
    };
  });
});

const getInsightsFacetDocs = cache(async (): Promise<SearchDoc[]> => {
  const reports = (reportsData as { reports: Report[] }).reports ?? [];
  const industries = Array.from(
    new Set(
      reports
        .map((r) => r.industry)
        .filter(Boolean)
        .map((industry) => getIndustryShortLabel(industry as string)),
    ),
  ).sort();

  const types = Array.from(new Set(reports.map((r) => r.type).filter(Boolean) as string[])).sort();

  const industryDocs: SearchDoc[] = industries.map((industry) => ({
    id: `insights-industry:${industry}`,
    type: "industry",
    title: industry,
    href: `/insights/explore?industry=${encodeURIComponent(industry)}`,
    text: `Industry ${industry}`,
    snippet: "Industry",
    industry,
  }));

  const typeDocs: SearchDoc[] = types.map((t) => ({
    id: `insights-type:${t}`,
    type: "contentType",
    title: t,
    href: `/insights/explore?type=${encodeURIComponent(t)}`,
    text: `Content type ${t}`,
    snippet: "Content Type",
    contentType: t,
  }));

  return [...industryDocs, ...typeDocs];
});

async function getDocs(scope: SearchScope): Promise<SearchDoc[]> {
  if (scope === "insights") {
    // Insights search must only return Insights content + Insights facets (industries/types).
    return [...(await getInsightsDocs()), ...(await getInsightsFacetDocs())];
  }
  if (scope === "newsroom") {
    // Newsroom search must only return Newsroom articles.
    return await getNewsroomDocs();
  }
  return [...(await getPageDocs()), ...(await getInsightsDocs()), ...(await getNewsroomDocs())];
}

function inferMode(query: string): SearchMode {
  const q = query.trim();
  if (!q) return "suggest";
  return normalize(q).length < 3 ? "prefix" : "full";
}

export async function searchSite(params: {
  scope: SearchScope;
  query: string;
  limit: number;
  offset?: number;
  mode?: SearchMode;
}): Promise<SearchResponse> {
  const query = params.query ?? "";
  const mode = params.mode ?? inferMode(query);

  if (mode === "suggest") {
    if (params.scope === "newsroom") {
      const docs = (await getNewsroomDocs()).sort((a, b) => (b.dateMs ?? 0) - (a.dateMs ?? 0));
      const results = docs.slice(0, params.limit).map((doc) => ({
        id: doc.id,
        type: doc.type,
        title: doc.title,
        href: doc.href,
        snippet: doc.snippet,
        industry: doc.industry,
        date: doc.date,
        tags: doc.tags,
      }));
      return { scope: params.scope, query: "", mode, results };
    }

    if (params.scope === "insights") {
      const docs = (await getInsightsDocs()).sort((a, b) => (b.dateMs ?? 0) - (a.dateMs ?? 0));
      const results = docs.slice(0, params.limit).map((doc) => ({
        id: doc.id,
        type: doc.type,
        title: doc.title,
        href: doc.href,
        snippet: doc.snippet,
        industry: doc.industry,
        contentType: doc.contentType,
        date: doc.date,
        tags: doc.tags,
      }));
      return { scope: params.scope, query: "", mode, results };
    }

    return {
      scope: params.scope,
      query: "",
      mode,
      results: getSearchSuggestions(params.scope).slice(0, params.limit),
    };
  }

  const docs = await getDocs(params.scope);
  const scored = docs
    .map((doc) => ({
      doc,
      score: scoreDoc(doc, query, mode),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const aDate = a.doc.dateMs ?? 0;
      const bDate = b.doc.dateMs ?? 0;
      return bDate - aDate;
    });

  const start = Math.max(0, params.offset ?? 0);
  const results = scored.slice(start, start + params.limit).map(({ doc }) => {
    const fallbackSnippet = doc.text.length > 220 ? `${doc.text.slice(0, 217)}...` : doc.text;
    const result: SearchResult = {
      id: doc.id,
      type: doc.type,
      title: doc.title,
      href: doc.href,
      snippet: doc.snippet ?? fallbackSnippet,
      industry: doc.industry,
      contentType: doc.contentType,
      date: doc.date,
      tags: doc.tags,
    };
    return result;
  });

  return {
    scope: params.scope,
    query: query.trim(),
    mode,
    results,
  };
}
