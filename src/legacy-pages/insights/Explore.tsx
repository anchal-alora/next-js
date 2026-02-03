"use client";

import Link from "next/link";
import { useQueryParams } from "@/hooks/useQueryParams";
import { useEffect, useRef, useState } from "react";
import Layout from "@/components/layout/Layout";
import { ExploreFilters } from "@/components/insights/ExploreFilters";
import { Button } from "@/components/ui/button";
import reportsData from "../../../reports-link.json";
import type { Report } from "@/lib/reportUtils";
import { sortReportsForSection } from "@/lib/reportUtils";
import { getIndustryConfig, getIndustryShortLabel } from "@/lib/industryConfig";
import { useSavedInsights } from "@/hooks/useSavedInsights";
import { OptimizedPicture } from "@/components/shared/OptimizedPicture";
import { Pagination } from "@/components/shared/Pagination";
import { formatIstDateLong } from "@/lib/istDate";
import { Search } from "lucide-react";
import { SearchCombobox } from "@/components/search/SearchCombobox";

const PAGE_SIZE = 9;

function parsePositiveInt(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return null;
  return parsed;
}

export default function Explore() {
  const { searchParams, setSearchParams } = useQueryParams();
  const allReports = reportsData.reports as Report[];
  const { savedIds } = useSavedInsights();
  const resultsTopRef = useRef<HTMLDivElement | null>(null);
  const didHashScrollRef = useRef(false);

  const queryInput = searchParams.get("q") ?? "";
  const [searchText, setSearchText] = useState(queryInput);

  useEffect(() => {
    setSearchText(queryInput);
  }, [queryInput]);

  function scrollResultsToTop() {
    resultsTopRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
  }

  useEffect(() => {
    if (didHashScrollRef.current) return;
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#results") return;
    didHashScrollRef.current = true;
    window.requestAnimationFrame(() => scrollResultsToTop());
  }, []);

  // Get filter values from URL
  const selectedIndustries = searchParams.getAll("industry");
  const selectedTypes = searchParams.getAll("type");
  const savedOnly = searchParams.get("saved") === "1";
  const query = queryInput.trim();
  const keywordFilters = searchParams.getAll("kw").map((k) => k.trim()).filter(Boolean);

  const normalizeForSearch = (value: string) =>
    value
      .toLowerCase()
      .replace(/,/g, "")
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();

  const normalizedQuery = normalizeForSearch(query);
  const normalizedKeywords = keywordFilters.map(normalizeForSearch).filter(Boolean);

  // Filter reports based on query parameters
  // AND between categories, OR within same category
  // Filter order: industry first, then saved=1 narrows results further
  const filteredReports = allReports.filter((report) => {
    const keywordMatch =
      normalizedKeywords.length === 0 ||
      (() => {
        const keywordHaystack = normalizeForSearch(
          [
            report.title,
            report.description,
            ...(Array.isArray(report.taggings) ? report.taggings : []),
          ]
            .filter(Boolean)
            .join(" "),
        );
        return normalizedKeywords.every((kw) => keywordHaystack.includes(kw));
      })();

    const queryMatch =
      normalizedQuery.length === 0 ||
      [
        report.title,
        report.description,
        report.industry,
        report.type,
        report.contentFormat,
        report.placement,
        ...(Array.isArray(report.taggings) ? report.taggings : []),
      ]
        .filter(Boolean)
        .some((value) => normalizeForSearch(value).includes(normalizedQuery));

    // Industry filter (OR within category) - normalize both sides to short names for comparison
    const reportIndustryShort = getIndustryShortLabel(report.industry || "");
    const normalizedSelected = selectedIndustries.map((ind) => getIndustryShortLabel(ind));
    const industryMatch =
      selectedIndustries.length === 0 || normalizedSelected.includes(reportIndustryShort);

    // Content type filter
    const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(report.type || "");

    // Saved filter (applied AFTER industry filter)
    const savedMatch = !savedOnly || savedIds.has(report.id);

    // AND between categories
    return keywordMatch && queryMatch && industryMatch && typeMatch && savedMatch;
  });

  // Sort filtered results using default sort order
  const sortedReports = sortReportsForSection(filteredReports);

  const totalItems = sortedReports.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const requestedPage = parsePositiveInt(searchParams.get("page")) ?? 1;
  const currentPage = Math.min(requestedPage, totalPages);

  useEffect(() => {
    if (requestedPage === currentPage) return;
    const next = new URLSearchParams(searchParams);
    if (currentPage <= 1) next.delete("page");
    else next.set("page", String(currentPage));
    setSearchParams(next, { replace: true });
  }, [currentPage, requestedPage, searchParams, setSearchParams]);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pagedReports = sortedReports.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <Layout>
      
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <OptimizedPicture
            imageKey="site/insights-explore"
            alt="Insights Library"
            fill
            wrapperClassName="w-full h-full"
            className="object-cover"
            sizes="100vw"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#281C2D]/95 via-[#281C2D]/80 to-[#281C2D]/60" />
        </div>
        
        <div className="container-wide relative z-10">
          <div className="max-w-3xl">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-widest mb-6 animate-fade-in">
              Insights Library
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight animate-fade-in-up">
              Market, Industry, and Competitive Insights
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 leading-relaxed animate-fade-in-up animation-delay-100">
              Alora Advisory publishes insights that help leaders understand market change,
              competitive dynamics, and their implications across industries.
            </p>

		            <form
		              onSubmit={(event) => {
		                event.preventDefault();
		                const next = new URLSearchParams(searchParams);
		                const q = searchText.trim();

	                if (!q) return;
	                next.set("q", q);

	                next.delete("page");
		                setSearchParams(next);
		                scrollResultsToTop();
		              }}
		              className="mt-10 max-w-2xl"
		            >
	              <div className="relative group">
	                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
		                <SearchCombobox
		                  scope="insights"
		                  value={searchText}
		                  onValueChange={setSearchText}
		                  placeholder="Search our insights, reports and analysis..."
		                  portalDropdown
		                  metaVariant="insights"
		                  containerClassName="relative"
		                  inputBorderClassName="relative rounded-2xl p-[2px] bg-gradient-to-r from-[#281C2D] via-[#7F33CC] to-[#281C2D] shadow-[0_18px_55px_rgba(0,0,0,0.35),0_0_28px_rgba(127,51,204,0.35)] before:content-[''] before:absolute before:inset-0 before:rounded-2xl before:bg-[radial-gradient(70%_120%_at_10%_0%,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0)_60%)] before:pointer-events-none"
		                  inputWrapperClassName="relative bg-white/95 dark:bg-slate-800/90 rounded-2xl shadow-elegant-sm px-4 py-3 flex items-center"
		                  leading={<Search className="text-slate-400 ml-4 mr-3 h-5 w-5" aria-hidden="true" />}
		                  inputClassName="w-full bg-transparent border-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:border-0 focus-visible:border-0 text-slate-900 dark:text-white placeholder-slate-400 py-3"
		                  trailing={
		                    <button
		                      type="submit"
		                      disabled={!searchText.trim()}
		                      className="bg-primary hover:bg-primary/90 disabled:bg-primary/60 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg mr-1"
		                    >
		                      Search
		                    </button>
		                  }
		                />
	              </div>
	            </form>
          </div>
        </div>
      </section>

      {/* Filters and Results */}
      <section className="section-padding">
        <div className="container-wide">
          {/* Filters at Top */}
          <div className="mb-12">
            <ExploreFilters reports={allReports} />
          </div>

          {/* Results */}
          <div>
            <div ref={resultsTopRef} id="results" />
            <div className="mb-6">
              <p className="text-muted-foreground">
                {sortedReports.length === 0
                  ? "No reports found"
                  : sortedReports.length === 1
                  ? "1 report found"
                  : `${sortedReports.length} reports found`}
              </p>
            </div>

            {sortedReports.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {pagedReports.map((report) => {
                    const industryShort = getIndustryShortLabel(
                      report.industry || "Technology and AI",
                    );
                    const config = getIndustryConfig(industryShort);
                    const IndustryIcon = config.icon;
                    const linkTo = `/insights/${report.slug}`;
                    const ctaText =
                      report.placement === "Case Studies"
                        ? "Read Full Case Study"
                        : report.contentFormat === "downloadable"
                          ? "Download Now"
                          : "View Report";

                    return (
                      <Link key={report.id} href={linkTo} className="block h-full group">
                        <div className="card-elevated card-hover p-7 flex flex-col min-h-[280px] h-full hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer">
                          <div className="flex items-start justify-between mb-3">
                            {report.type && (
                              <span className="text-accent text-sm font-semibold uppercase tracking-wider">
                                {report.type}
                              </span>
                            )}
                            {report.industry && (
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
                                <IndustryIcon className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground text-sm font-medium">
                                  {industryShort}
                                </span>
                              </div>
                            )}
                          </div>
                          <h3 className="font-display text-xl font-semibold text-foreground mt-2 mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                            {report.title}
                          </h3>
                          <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-grow line-clamp-4">
                            {report.description}
                          </p>
                          <div className="flex items-center justify-between mt-auto">
                            {(() => {
                              const dateToShow = formatIstDateLong(report.date);
                              return dateToShow ? (
                                <span className="text-muted-foreground text-sm">{dateToShow}</span>
                              ) : null;
                            })()}
                            <div onClick={(e) => e.stopPropagation()}>
                              <Button variant="outline" size="sm">
                                {ctaText}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    const next = new URLSearchParams(searchParams);
                    if (page <= 1) next.delete("page");
                    else next.set("page", String(page));
                    scrollResultsToTop();
                    setSearchParams(next);
                  }}
                />
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No reports found for the selected filters.
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Try adjusting your filters or clearing them to see all reports.
                </p>
                <Button asChild variant="outline">
                  <Link href="/insights/explore">Clear filters</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
