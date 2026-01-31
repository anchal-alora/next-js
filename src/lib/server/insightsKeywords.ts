import { cache as reactCache } from "react";
import reportsData from "../../../reports-link.json";
import type { Report } from "@/lib/reportUtils";

// Same dev/prod caching behavior as other server loaders in this repo.
const cache: typeof reactCache =
  process.env.NODE_ENV === "production"
    ? reactCache
    : ((<T extends (...args: unknown[]) => unknown>(fn: T) => fn) as unknown as typeof reactCache);

type KeywordEntry = { keyword: string; count: number };

function normalize(value: string): string {
  return value.toLowerCase().replace(/,/g, "").trim();
}

const getKeywordCounts = cache(async (): Promise<KeywordEntry[]> => {
  const reports = (reportsData as { reports: Report[] }).reports ?? [];
  const counts = new Map<string, number>();
  for (const report of reports) {
    const taggings = Array.isArray(report.taggings) ? report.taggings : [];
    for (const raw of taggings) {
      if (typeof raw !== "string") continue;
      const keyword = raw.trim();
      if (!keyword) continue;
      counts.set(keyword, (counts.get(keyword) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.keyword.localeCompare(b.keyword);
    });
});

export async function getInsightsKeywordSuggestions(params: { query: string; limit: number }): Promise<string[]> {
  const entries = await getKeywordCounts();
  const q = normalize(params.query);

  if (!q) return entries.slice(0, params.limit).map((e) => e.keyword);

  const scored = entries
    .map((entry) => {
      const n = normalize(entry.keyword);
      const starts = n.startsWith(q);
      const includes = n.includes(q);
      if (!includes) return null;
      const score = (starts ? 2 : 0) + (includes ? 1 : 0) + Math.min(1, entry.count / 10);
      return { entry, score };
    })
    .filter(Boolean) as Array<{ entry: KeywordEntry; score: number }>;

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.entry.count !== a.entry.count) return b.entry.count - a.entry.count;
    return a.entry.keyword.localeCompare(b.entry.keyword);
  });

  return scored.slice(0, params.limit).map((s) => s.entry.keyword);
}
