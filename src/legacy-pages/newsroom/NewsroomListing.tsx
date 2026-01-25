"use client";

import { useEffect, useRef } from "react";
import Layout from "@/components/layout/Layout";
import { NewsroomFilters } from "@/components/newsroom/NewsroomFilters";
import { NewsroomCard } from "@/components/newsroom/NewsroomCard";
import type { NewsroomArticle } from "@/lib/newsroomTypes";
import { OptimizedPicture } from "@/components/shared/OptimizedPicture";
import { getIndustryShortLabel } from "@/lib/industryConfig";
import { Pagination } from "@/components/shared/Pagination";
import { useQueryParams } from "@/hooks/useQueryParams";

const PAGE_SIZE = 10;

function parsePositiveInt(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return null;
  return parsed;
}

interface NewsroomListingProps {
  articles: NewsroomArticle[];
}

export default function NewsroomListing({ articles }: NewsroomListingProps) {
  const { searchParams, setSearchParams } = useQueryParams();
  const resultsTopRef = useRef<HTMLDivElement | null>(null);

  function scrollResultsToTop() {
    resultsTopRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
  }

  const selectedIndustries = searchParams.getAll("industry");

  const filteredReleases = articles.filter((release) => {
    const releaseIndustryShort = getIndustryShortLabel(release.industry);
    const normalizedSelected = selectedIndustries.map((ind) => getIndustryShortLabel(ind));
    const industryMatch =
      selectedIndustries.length === 0 || normalizedSelected.includes(releaseIndustryShort);

    return industryMatch;
  });

  const totalItems = filteredReleases.length;
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
  const pagedReleases = filteredReleases.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <Layout>
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <OptimizedPicture
            imageKey="site/insights-explore"
            alt="Newsroom"
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
              Newsroom
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight animate-fade-in-up">
              Latest Announcements
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 leading-relaxed animate-fade-in-up animation-delay-100">
              Stay informed about Alora Advisory's latest market research, strategic insights, and industry announcements.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-wide">
          {articles.length > 0 && (
            <div className="mb-12">
              <NewsroomFilters articles={articles} />
            </div>
          )}

          <div>
            <div ref={resultsTopRef} />
            <div className="mb-6">
              <p className="text-muted-foreground">
                {filteredReleases.length === 0
                  ? "No articles found"
                  : filteredReleases.length === 1
                  ? "1 article found"
                  : `${filteredReleases.length} articles found`}
              </p>
            </div>

            {filteredReleases.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 gap-8">
                  {pagedReleases.map((release) => (
                    <div key={release.slug} className="pb-8 border-b border-border/30">
                      <NewsroomCard article={release} />
                    </div>
                  ))}
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
                  No articles found for the selected filters.
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Try adjusting your filters or clearing them to see all releases.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
