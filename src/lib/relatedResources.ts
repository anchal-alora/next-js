import type { NewsroomArticle } from "@/lib/newsroomTypes";

export const INDUSTRY_MATCH_SCORE = 100;
export const TAG_MATCH_SCORE = 10;
export const KEYWORD_MATCH_SCORE = 5;
export const RECENCY_BONUS_MAX = 15;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const STOPWORDS = new Set<string>([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "but",
  "by",
  "for",
  "from",
  "has",
  "have",
  "in",
  "into",
  "is",
  "it",
  "its",
  "of",
  "on",
  "or",
  "that",
  "the",
  "their",
  "this",
  "to",
  "up",
  "was",
  "were",
  "with",
  "within",
]);

export type RelatedResourceCandidate = {
  id: string;
  title: string;
  date: string | Date;
  industry: string;
  tags?: string[];
  url: string;
  type?: string;
  description?: string;
};

export type RelatedResource = {
  id: string;
  title: string;
  date: Date;
  industry: string;
  tags: string[];
  url: string;
  type?: string;
  description?: string;
};

export function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function normalize(input: string): string {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return "";
  const noDiacritics = trimmed.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  return noDiacritics
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeTags(tags?: string[]): Set<string> {
  const set = new Set<string>();
  for (const tag of tags ?? []) {
    const normalized = normalize(String(tag));
    if (normalized) set.add(normalized);
  }
  return set;
}

function tokenize(text: string): string[] {
  const normalized = normalize(text);
  if (!normalized) return [];
  const parts = normalized.split(/\s+/g);
  const tokens: string[] = [];
  for (const part of parts) {
    if (!part) continue;
    for (const sub of part.split("-")) {
      if (sub) tokens.push(sub);
    }
  }
  return tokens;
}

export function extractKeywordSet(text: string): Set<string> {
  const set = new Set<string>();
  for (const token of tokenize(text)) {
    if (token.length < 3) continue;
    if (STOPWORDS.has(token)) continue;
    set.add(token);
  }
  return set;
}

function intersectionSize(a: Set<string>, b: Set<string>): number {
  let count = 0;
  for (const value of a) {
    if (b.has(value)) count++;
  }
  return count;
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseMonthYear(value: string): Date | null {
  const match = value.trim().match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (!match) return null;
  const [, monthNameRaw, yearRaw] = match;
  const monthName = monthNameRaw.toLowerCase();
  const year = Number(yearRaw);
  if (!Number.isFinite(year)) return null;
  const monthMap: Record<string, number> = {
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    may: 4,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11,
  };
  const monthIndex = monthMap[monthName];
  if (monthIndex === undefined) return null;
  const date = new Date(year, monthIndex, 1);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function coerceDate(value: string | Date): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const monthYear = parseMonthYear(trimmed);
  if (monthYear) return monthYear;

  const isoParsed = new Date(trimmed);
  if (!Number.isNaN(isoParsed.getTime())) return isoParsed;

  return null;
}

function computeRecencyBonus(today: Date, itemDate: Date): number {
  const todayStart = startOfLocalDay(today);
  const itemStart = startOfLocalDay(itemDate);
  const ageDays = Math.max(0, Math.floor((todayStart.getTime() - itemStart.getTime()) / MS_PER_DAY));

  if (ageDays <= 7) return 15;
  if (ageDays <= 30) return 10;
  if (ageDays <= 90) return 5;
  return 0;
}

export type ScoreBreakdown = {
  score: number;
  industryMatch: boolean;
  tagMatches: number;
  keywordMatches: number;
  recencyBonus: number;
  date: Date;
};

export function scoreRelatedResource(
  article: Pick<NewsroomArticle, "industry" | "tags" | "title" | "subheader">,
  candidate: RelatedResource,
  today: Date
): ScoreBreakdown {
  let score = 0;

  const articleIndustry = normalize(article.industry ?? "");
  const itemIndustry = normalize(candidate.industry ?? "");
  const industryMatch = Boolean(articleIndustry) && articleIndustry === itemIndustry;
  if (industryMatch) score += INDUSTRY_MATCH_SCORE;

  const articleTagSet = normalizeTags(article.tags);
  const itemTagSet = normalizeTags(candidate.tags);
  const tagMatches = intersectionSize(articleTagSet, itemTagSet);
  score += tagMatches * TAG_MATCH_SCORE;

  const articleKeywordSet = new Set<string>([
    ...extractKeywordSet(article.title ?? ""),
    ...extractKeywordSet(article.subheader ?? ""),
  ]);

  const itemKeywordSet = new Set<string>([
    ...extractKeywordSet(candidate.title ?? ""),
    ...extractKeywordSet((candidate.tags ?? []).join(" ")),
  ]);

  const keywordMatches = intersectionSize(articleKeywordSet, itemKeywordSet);
  score += keywordMatches * KEYWORD_MATCH_SCORE;

  const recencyBonus = computeRecencyBonus(today, candidate.date);
  score += recencyBonus;

  return {
    score,
    industryMatch,
    tagMatches,
    keywordMatches,
    recencyBonus,
    date: candidate.date,
  };
}

function compareUrlAsc(a: string, b: string): number {
  return a.localeCompare(b, "en", { sensitivity: "base" });
}

export function selectRelatedResourcesForNewsroomArticle(
  article: Pick<NewsroomArticle, "slug" | "date" | "industry" | "tags" | "title" | "subheader">,
  candidates: RelatedResourceCandidate[],
  options?: { today?: Date; count?: number }
): RelatedResource[] {
  const desiredCount = options?.count ?? 4;
  const today = options?.today ?? new Date();

  const seenUrls = new Set<string>();
  const cleaned: RelatedResource[] = [];

  for (const item of candidates) {
    if (!item?.id || !item?.title || !item?.url || !item?.date) continue;
    if (typeof item.url !== "string" || item.url.trim().length === 0) continue;

    const url = item.url.trim();
    if (seenUrls.has(url)) continue;
    seenUrls.add(url);

    if (url.includes(`/newsroom/${article.slug}`)) continue;

    const date = coerceDate(item.date);
    if (!date) continue;

    cleaned.push({
      id: String(item.id),
      title: String(item.title),
      url,
      date,
      industry: String(item.industry ?? ""),
      tags: (item.tags ?? []).map(String),
      type: item.type ? String(item.type) : undefined,
      description: item.description ? String(item.description) : undefined,
    });
  }

  const scored = cleaned.map((item) => {
    const breakdown = scoreRelatedResource(article, item, today);
    return { item, breakdown };
  });

  const primary = scored.filter((s) => s.breakdown.industryMatch);
  const secondary = scored.filter((s) => !s.breakdown.industryMatch);

  const sortScored = (a: typeof scored[number], b: typeof scored[number]) => {
    if (b.breakdown.score !== a.breakdown.score) return b.breakdown.score - a.breakdown.score;
    const timeDiff = b.item.date.getTime() - a.item.date.getTime();
    if (timeDiff !== 0) return timeDiff;
    return compareUrlAsc(a.item.url, b.item.url);
  };

  primary.sort(sortScored);
  secondary.sort(sortScored);

  const selected: RelatedResource[] = [];
  for (const s of primary) {
    selected.push(s.item);
    if (selected.length >= desiredCount) return selected;
  }
  for (const s of secondary) {
    selected.push(s.item);
    if (selected.length >= desiredCount) return selected;
  }

  return selected;
}

// Backward compatibility alias
export const selectRelatedResourcesForPressRelease = selectRelatedResourcesForNewsroomArticle;
