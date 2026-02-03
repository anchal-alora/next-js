import type { Metadata } from "next";
import { Suspense } from "react";
import { SITE_URL } from "@/lib/seo";
import { getAllNewsroomArticles } from "@/lib/server/newsroom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { NewsroomFilters } from "@/components/newsroom/NewsroomFilters";
import { getIndustryConfig, getIndustryShortLabel } from "@/lib/industryConfig";
import { OptimizedPicture } from "@/components/shared/OptimizedPicture";
import { PaginationLinks } from "@/components/shared/PaginationLinks";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatIstDateLong } from "@/lib/istDate";
import { NewsroomShareIconButton } from "@/components/newsroom/NewsroomShareIconButton";
import { DownloadCloud, Mail } from "lucide-react";
import { searchSite } from "@/lib/server/search";

export const revalidate = 3600;
export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

function parsePositiveInt(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return null;
  return parsed;
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const hasQuery = Object.keys(resolvedParams || {}).length > 0;
  const canonical = `${SITE_URL}/newsroom`;

  return {
    title: "Newsroom | Alora Advisory",
    description: "Latest announcements and press releases from Alora Advisory.",
    alternates: {
      canonical,
    },
    robots: hasQuery
      ? {
          index: false,
          follow: true,
        }
      : {
          index: true,
          follow: true,
        },
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>;
}) {
  const articles = await getAllNewsroomArticles();

  const resolvedSearchParams = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(resolvedSearchParams ?? {})) {
    if (value == null) continue;
    if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
    else params.set(key, value);
  }

  const selectedIndustries = params.getAll("industry");
  const normalizedSelected = selectedIndustries.map((ind) => getIndustryShortLabel(ind));
  const keywordFilters = params.getAll("kw").map((k) => k.trim()).filter(Boolean);
  const legacySearch = (params.get("search") ?? "").trim();
  const effectiveKeywords = keywordFilters.length > 0 ? keywordFilters : legacySearch ? [legacySearch] : [];
  const searchQuery = effectiveKeywords.join(" ").trim();

  let filteredReleases = articles.filter((release) => {
    const releaseIndustryShort = getIndustryShortLabel(release.industry);
    const industryMatch =
      selectedIndustries.length === 0 || normalizedSelected.includes(releaseIndustryShort);
    if (!industryMatch) return false;
    return true;
  });

  if (searchQuery) {
    const response = await searchSite({
      scope: "newsroom",
      query: searchQuery,
      limit: Math.max(articles.length, 50),
    });

    const slugOrder = response.results
      .map((result) => result.href.split("/").filter(Boolean).pop())
      .filter(Boolean) as string[];

    const slugRank = new Map<string, number>();
    slugOrder.forEach((slug, index) => slugRank.set(slug, index));

    filteredReleases = filteredReleases
      .filter((release) => slugRank.has(release.slug))
      .sort((a, b) => (slugRank.get(a.slug) ?? 0) - (slugRank.get(b.slug) ?? 0));
  }

  const featuredRelease = filteredReleases[0];
  const listReleases = filteredReleases.slice(1);

  const totalItems = filteredReleases.length;
  const totalListItems = listReleases.length;
  const totalPages = Math.max(1, Math.ceil(totalListItems / PAGE_SIZE));
  const requestedPage = parsePositiveInt(params.get("page")) ?? 1;
  const currentPage = Math.min(requestedPage, totalPages);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pagedReleases = listReleases.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-[calc(var(--header-height)+var(--header-search-height))]">
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
                Stay informed about Alora Advisory&apos;s latest market research, strategic insights, and industry announcements.
              </p>
            </div>
          </div>
        </section>

        <section className="section-padding">
          <div className="container-wide">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <aside className="hidden lg:block lg:col-span-3 self-start sticky-sidebar">
                <div className="card-elevated p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold mb-4">Media Relations</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      For press inquiries and interview requests, please contact our media desk.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <a
                      className="block text-primary font-medium hover:underline text-sm flex items-center gap-2"
                      href="mailto:press@aloraadvisory.com"
                    >
                      <Mail className="h-4 w-4" aria-hidden="true" /> press@aloraadvisory.com
                    </a>
                    <a
                      className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                      href="/api/media-kit"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <DownloadCloud className="h-4 w-4" aria-hidden="true" /> Download Media Kit
                    </a>
                  </div>
                </div>
              </aside>

              <div className="lg:col-span-9">
                {/* Filters are client-side only; the article list below is server-rendered for SEO/GEO. */}
                {articles.length > 0 ? (
                  <div className="mb-12">
                    {/* useSearchParams() in a Client Component requires a Suspense boundary in App Router prerendering. */}
                    <Suspense fallback={null}>
                      <NewsroomFilters articles={articles} />
                    </Suspense>
                  </div>
                ) : null}

                <div className="mb-6">
                  <p className="text-muted-foreground">
                    {filteredReleases.length === 0
                      ? "No articles found"
                      : filteredReleases.length === 1
                        ? "1 article found"
                        : `${filteredReleases.length} articles found`}
                  </p>
                </div>

                {totalItems === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No articles found for the selected filters.</p>
                    <p className="text-sm text-muted-foreground mb-6">
                      Try adjusting your filters or clearing them to see all releases.
                    </p>
                  </div>
                ) : (
                  <>
                    {featuredRelease && currentPage === 1 ? (
                      <section className="relative p-1 bg-gradient-to-br from-primary via-purple-400 to-indigo-500 rounded-3xl mb-10">
                        <div className="bg-background p-8 md:p-10 rounded-[calc(1.5rem-2px)]">
                          <div className="flex flex-col lg:flex-row gap-8 items-start">
                            <div className="flex-1">
                              <div className="flex items-center justify-between gap-4 mb-4">
                                <span className="text-muted-foreground text-sm">
                                  {formatIstDateLong(featuredRelease.date)}
                                </span>
                                {(() => {
                                  const industryLabel = getIndustryShortLabel(featuredRelease.industry);
                                  if (!industryLabel) return null;
                                  const config = getIndustryConfig(industryLabel);
                                  const IndustryIcon = config.icon;
                                  return (
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
                                      <IndustryIcon className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-muted-foreground text-sm font-medium">
                                        {industryLabel}
                                      </span>
                                    </div>
                                  );
                                })()}
                              </div>

                              <span className="text-xs font-bold text-primary tracking-widest uppercase mb-3 block">
                                Latest Announcement
                              </span>

                              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                                <Link href={`/newsroom/${featuredRelease.slug}`}>
                                  {featuredRelease.title}
                                </Link>
                              </h2>

                              {(featuredRelease.summary || featuredRelease.subheader) && (
                                <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm leading-relaxed line-clamp-3">
                                  {featuredRelease.summary || featuredRelease.subheader}
                                </p>
                              )}

                              <div className="flex items-center gap-4">
                                <Link
                                  href={`/newsroom/${featuredRelease.slug}`}
                                  className="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
                                >
                                  Read Release <ArrowRight className="h-4 w-4" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>
                    ) : null}

                    {pagedReleases.length > 0 ? (
                      <div className="space-y-12">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
                          <span className="flex-grow h-px bg-slate-200 dark:bg-slate-800" />
                          Recent Activity
                          <span className="flex-grow h-px bg-slate-200 dark:bg-slate-800" />
                        </h3>

                        <div className="space-y-8 pl-0 md:pl-4 news-timeline-border ml-2 md:ml-4">
                          {pagedReleases.map((release, index) => {
                            const industryLabel = getIndustryShortLabel(release.industry);
                            const isPrimaryMarker = currentPage === 1 && index === 0;

                            return (
                              <article key={release.slug} className="relative pl-8 group">
                                <div
                                  className={[
                                    "absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-4 border-background bg-slate-300 dark:bg-slate-700 transition-transform group-hover:scale-125",
                                    isPrimaryMarker
                                      ? "bg-primary ring-4 ring-primary/10"
                                      : "group-hover:bg-primary group-hover:ring-4 group-hover:ring-primary/10",
                                  ].join(" ")}
                                />
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                  <div>
                                    <span className="text-xs font-medium text-slate-400 block mb-2">
                                      {formatIstDateLong(release.date)}
                                      {industryLabel ? ` • ${industryLabel}` : ""}
                                    </span>
                                    <h4 className="text-xl font-bold group-hover:text-primary transition-colors">
                                      <Link href={`/newsroom/${release.slug}`}>
                                        {release.title}
                                      </Link>
                                    </h4>
                                    {(release.summary || release.subheader) ? (
                                      <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm max-w-2xl leading-relaxed">
                                        {release.summary || release.subheader}
                                      </p>
                                    ) : null}
                                  </div>
                                  <NewsroomShareIconButton
                                    title={release.title}
                                    url={`${SITE_URL}/newsroom/${release.slug}`}
                                  />
                                </div>
                              </article>
                            );
                          })}
                        </div>

                        <PaginationLinks
                          basePath="/newsroom"
                          currentPage={currentPage}
                          totalPages={totalPages}
                          searchParams={params}
                        />
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
