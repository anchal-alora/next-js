"use client";

import Link from "next/link";
import { useQueryParams } from "@/hooks/useQueryParams";
import { useEffect, useRef } from "react";
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

const PAGE_SIZE = 10;

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

  function scrollResultsToTop() {
    resultsTopRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
  }

  // Get filter values from URL
  const selectedIndustries = searchParams.getAll("industry");
  const savedOnly = searchParams.get("saved") === "1";

  // Filter reports based on query parameters
  // AND between categories, OR within same category
  // Filter order: industry first, then saved=1 narrows results further
  const filteredReports = allReports.filter((report) => {
    // Industry filter (OR within category) - normalize both sides to short names for comparison
    const reportIndustryShort = getIndustryShortLabel(report.industry || "");
    const normalizedSelected = selectedIndustries.map((ind) => getIndustryShortLabel(ind));
    const industryMatch =
      selectedIndustries.length === 0 || normalizedSelected.includes(reportIndustryShort);

    // Saved filter (applied AFTER industry filter)
    const savedMatch = !savedOnly || savedIds.has(report.id);

    // AND between categories
    return industryMatch && savedMatch;
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
            <div ref={resultsTopRef} />
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
                <div className="grid md:grid-cols-2 gap-8">
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
