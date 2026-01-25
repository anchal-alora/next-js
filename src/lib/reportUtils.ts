import reportsData from "../../reports-link.json";
import { formatIstDateLong } from "@/lib/istDate";

type JsonReport = (typeof reportsData)["reports"][number];
export type Report = JsonReport & {
  // Legacy fields (ignored; kept for backward compatibility in runtime data).
  sortDate?: string;
  // Optional fields that may not be in all reports
  link?: string;
  heroImage?: string;
};

// Stable hash function for deterministic tie-breaking
export function stableHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function legacyDateToSortDate(dateValue: unknown): string {
  if (typeof dateValue !== "string") return "";
  const s = dateValue.trim();
  if (!s) return "";

  if (isIsoDate(s)) return s;
  const isoMonth = s.match(/^(\d{4})-(\d{1,2})$/);
  if (isoMonth) {
    return `${isoMonth[1]}-${pad2(Number(isoMonth[2]))}-01`;
  }

  const quarter = s.match(/^(?:Q([1-4])\s*(\d{4})|(\d{4})\s*Q([1-4]))$/i);
  if (quarter) {
    const q = Number(quarter[1] ?? quarter[4]);
    const y = Number(quarter[2] ?? quarter[3]);
    const startMonth = (q - 1) * 3 + 1;
    return `${y}-${pad2(startMonth)}-01`;
  }

  const yearOnly = s.match(/^(\d{4})$/);
  if (yearOnly) return `${yearOnly[1]}-01-01`;

  const monthMap: Record<string, number> = {
    january: 1,
    february: 2,
    march: 3,
    april: 4,
    may: 5,
    june: 6,
    july: 7,
    august: 8,
    september: 9,
    october: 10,
    november: 11,
    december: 12,
  };

  const monthYear = s.replace(/,/g, "").match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (monthYear) {
    const month = monthMap[monthYear[1].toLowerCase()] ?? 0;
    const year = Number(monthYear[2]);
    if (year && month) return `${year}-${pad2(month)}-01`;
  }

  return "";
}

function getComparableSortDate(report: Report): string {
  const date = report.date;
  if (isIsoDate(date)) return date;
  const sortDate = report.sortDate;
  if (sortDate && isIsoDate(sortDate)) return sortDate;
  return legacyDateToSortDate(date) || (sortDate ? legacyDateToSortDate(sortDate) : "");
}

export function formatReportDate(dateString?: string): string {
  return formatIstDateLong(dateString);
}

// Sort reports: pinned first, then priority, then date, then stable hash of id
export function sortReportsForSection(reports: Report[]): Report[] {
  return [...reports].sort((a, b) => {
    // 1. Pinned first (pinned === true)
    const aPinned = a.pinned ?? false;
    const bPinned = b.pinned ?? false;
    if (aPinned !== bPinned) {
      return bPinned ? 1 : -1; // bPinned true comes first
    }

    // 2. Then by priority (higher first)
    const aPriority = a.priority ?? 0;
    const bPriority = b.priority ?? 0;
    if (bPriority !== aPriority) {
      return bPriority - aPriority;
    }

    // 3. Then by date (newest first)
    const dateA = getComparableSortDate(a);
    const dateB = getComparableSortDate(b);
    if (dateA !== dateB) {
      return dateB.localeCompare(dateA);
    }

    // 4. If still tied, use stable hash of id as tie-breaker (descending consistently)
    return stableHash(b.id) - stableHash(a.id);
  });
}

// Sort for Recent Articles
export function sortRecentArticles(reports: Report[]): Report[] {
  return [...reports].sort((a, b) => {
    // 1. Pinned first
    const aPinned = a.pinned ?? false;
    const bPinned = b.pinned ?? false;
    if (aPinned !== bPinned) {
      return bPinned ? 1 : -1;
    }

    // 2. Then by priority (higher first)
    const aPriority = a.priority ?? 0;
    const bPriority = b.priority ?? 0;
    if (bPriority !== aPriority) {
      return bPriority - aPriority;
    }

    // 3. Date (newest first)
    const dateA = getComparableSortDate(a);
    const dateB = getComparableSortDate(b);
    if (dateA !== dateB) {
      return dateB.localeCompare(dateA);
    }

    // 4. Stable hash tie-breaker (descending consistently)
    return stableHash(b.id) - stableHash(a.id);
  });
}

// Sequential selection with strict de-duplication
export function assignReportsToSections(reports: Report[]): {
  featuredInsights: Report[];
  caseStudies: Report[];
  researchReports: Report[];
  recentArticles: Report[];
} {
  const assignedIds = new Set<string>();

  // 1) Select Featured Insights (Max 2)
  const featuredEligible = reports.filter(
    (r) => r.placement === "Featured Insights" && !assignedIds.has(r.id)
  );
  const featuredSorted = sortReportsForSection(featuredEligible);
  const featuredInsights = featuredSorted.slice(0, 2);
  featuredInsights.forEach((r) => assignedIds.add(r.id));

  // 2) Select Case Studies (Max 3)
  const caseStudiesEligible = reports.filter(
    (r) => r.placement === "Case Studies" && !assignedIds.has(r.id)
  );
  const caseStudiesSorted = sortReportsForSection(caseStudiesEligible);
  const caseStudies = caseStudiesSorted.slice(0, 3);
  caseStudies.forEach((r) => assignedIds.add(r.id));

  // 3) Select In-Depth Research Reports (Max 8)
  const researchEligible = reports.filter(
    (r) => r.placement === "In-Depth Research Reports" && !assignedIds.has(r.id)
  );
  const researchSorted = sortReportsForSection(researchEligible);
  const researchReports = researchSorted.slice(0, 8);
  researchReports.forEach((r) => assignedIds.add(r.id));

  // 4) Build Recent Articles (All remaining reports)
  const recentArticlesEligible = reports.filter((r) => !assignedIds.has(r.id));
  const recentArticles = sortRecentArticles(recentArticlesEligible);

  return {
    featuredInsights,
    caseStudies,
    researchReports,
    recentArticles,
  };
}

// Sequential selection with Insights Hero (strict de-duplication)
export function assignReportsToSectionsWithInsightsHero(reports: Report[]): {
  insightsHeroReport: Report | null;
  featuredInsights: Report[];
  caseStudies: Report[];
  researchReports: Report[];
  recentArticles: Report[];
} {
  const assignedIds = new Set<string>();

  // 1) Select Insights Hero (Max 1)
  const insightsHeroEligible = reports.filter(
    (r) => r.placement === "Insights Hero" && !assignedIds.has(r.id)
  );
  const insightsHeroSorted = sortReportsForSection(insightsHeroEligible);
  const insightsHeroReport = insightsHeroSorted.length > 0 ? insightsHeroSorted[0] : null;
  if (insightsHeroReport) {
    assignedIds.add(insightsHeroReport.id);
  }

  // 2) Select Featured Insights (Max 2)
  const featuredEligible = reports.filter(
    (r) => r.placement === "Featured Insights" && !assignedIds.has(r.id)
  );
  const featuredSorted = sortReportsForSection(featuredEligible);
  const featuredInsights = featuredSorted.slice(0, 2);
  featuredInsights.forEach((r) => assignedIds.add(r.id));

  // 3) Select Case Studies (Max 3)
  const caseStudiesEligible = reports.filter(
    (r) => r.placement === "Case Studies" && !assignedIds.has(r.id)
  );
  const caseStudiesSorted = sortReportsForSection(caseStudiesEligible);
  const caseStudies = caseStudiesSorted.slice(0, 3);
  caseStudies.forEach((r) => assignedIds.add(r.id));

  // 4) Select In-Depth Research Reports (Max 8)
  const researchEligible = reports.filter(
    (r) => r.placement === "In-Depth Research Reports" && !assignedIds.has(r.id)
  );
  const researchSorted = sortReportsForSection(researchEligible);
  const researchReports = researchSorted.slice(0, 8);
  researchReports.forEach((r) => assignedIds.add(r.id));

  // 5) Build Recent Articles (All remaining reports, including any unselected Insights Hero items)
  const recentArticlesEligible = reports.filter((r) => !assignedIds.has(r.id));
  const recentArticles = sortRecentArticles(recentArticlesEligible);

  return {
    insightsHeroReport,
    featuredInsights,
    caseStudies,
    researchReports,
    recentArticles,
  };
}

// Select reports for Home page carousel: 2 Featured + 1 Case Study + 1 Research + 2 Recent Articles
export function selectHomeInsights(reports: Report[]): Report[] {
  const shownIds = new Set<string>();
  const homeInsights: Report[] = [];

  // 1) Select 2 Featured Insights
  const featuredEligible = reports.filter(
    (r) => r.placement === "Featured Insights" && !shownIds.has(r.id)
  );
  const featuredSorted = sortReportsForSection(featuredEligible);
  const featured = featuredSorted.slice(0, 2);
  featured.forEach((r) => {
    shownIds.add(r.id);
    homeInsights.push(r);
  });

  // 2) Select 1 Case Study
  const caseStudiesEligible = reports.filter(
    (r) => r.placement === "Case Studies" && !shownIds.has(r.id)
  );
  const caseStudiesSorted = sortReportsForSection(caseStudiesEligible);
  const caseStudy = caseStudiesSorted.slice(0, 1);
  caseStudy.forEach((r) => {
    shownIds.add(r.id);
    homeInsights.push(r);
  });

  // 3) Select 1 Research Report
  const researchEligible = reports.filter(
    (r) => r.placement === "In-Depth Research Reports" && !shownIds.has(r.id)
  );
  const researchSorted = sortReportsForSection(researchEligible);
  const research = researchSorted.slice(0, 1);
  research.forEach((r) => {
    shownIds.add(r.id);
    homeInsights.push(r);
  });

  // 4) Select 2 Recent Articles
  const recentEligible = reports.filter((r) => !shownIds.has(r.id));
  const recentSorted = sortRecentArticles(recentEligible);
  const recent = recentSorted.slice(0, 2);
  recent.forEach((r) => {
    shownIds.add(r.id);
    homeInsights.push(r);
  });

  return homeInsights;
}
