import type { Metadata } from "next";
import { Suspense } from "react";
import { SITE_URL } from "@/lib/seo";
import { getAllNewsroomArticles } from "@/lib/server/newsroom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { NewsroomFilters } from "@/components/newsroom/NewsroomFilters";
import { NewsroomCard } from "@/components/newsroom/NewsroomCard";
import { getIndustryShortLabel } from "@/lib/industryConfig";
import { OptimizedPicture } from "@/components/shared/OptimizedPicture";
import { PaginationLinks } from "@/components/shared/PaginationLinks";

export const revalidate = 3600;

const PAGE_SIZE = 10;

function parsePositiveInt(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return null;
  return parsed;
}

export const metadata: Metadata = {
  title: "Newsroom | Alora Advisory",
  description: "Latest announcements and press releases from Alora Advisory.",
  alternates: {
    canonical: `${SITE_URL}/newsroom`,
  },
};

export default async function Page({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const articles = await getAllNewsroomArticles();

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (value == null) continue;
    if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
    else params.set(key, value);
  }

  const selectedIndustries = params.getAll("industry");
  const normalizedSelected = selectedIndustries.map((ind) => getIndustryShortLabel(ind));

  const filteredReleases = articles.filter((release) => {
    const releaseIndustryShort = getIndustryShortLabel(release.industry);
    const industryMatch =
      selectedIndustries.length === 0 || normalizedSelected.includes(releaseIndustryShort);
    return industryMatch;
  });

  const totalItems = filteredReleases.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const requestedPage = parsePositiveInt(params.get("page")) ?? 1;
  const currentPage = Math.min(requestedPage, totalPages);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pagedReleases = filteredReleases.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
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

            {pagedReleases.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 gap-8">
                  {pagedReleases.map((release) => (
                    <article key={release.slug} className="pb-8 border-b border-border/30">
                      <NewsroomCard article={release} />
                    </article>
                  ))}
                </div>
                <PaginationLinks
                  basePath="/newsroom"
                  currentPage={currentPage}
                  totalPages={totalPages}
                  searchParams={params}
                />
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No articles found for the selected filters.</p>
                <p className="text-sm text-muted-foreground mb-6">
                  Try adjusting your filters or clearing them to see all releases.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
