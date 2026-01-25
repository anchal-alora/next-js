"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Layout from "@/components/layout/Layout";
import { NewsroomDetailHeader } from "@/components/newsroom/NewsroomDetailHeader";
import { NewsroomShareButtons } from "@/components/newsroom/NewsroomShareButtons";
import { LatestReleasesWidget } from "@/components/newsroom/LatestReleasesWidget";
import { AboutUsBox } from "@/components/newsroom/AboutUsBox";
import { RelatedResources } from "@/components/newsroom/RelatedResources";
import { Button } from "@/components/ui/button";
import type { NewsroomArticle } from "@/lib/newsroomTypes";
import type { RelatedResource } from "@/lib/relatedResources";
import { getIndustryConfig } from "@/lib/industryConfig";
import { getContactFormLink } from "@/lib/routes";
import { ArrowUpRight } from "lucide-react";
import { formatIstDateLong } from "@/lib/istDate";

interface NewsroomDetailProps {
  article: NewsroomArticle;
  latestArticles: NewsroomArticle[];
  relatedResources: RelatedResource[];
}

export default function NewsroomDetail({ article, latestArticles, relatedResources }: NewsroomDetailProps) {
  const config = getIndustryConfig(article.industry);
  const IndustryIcon = config.icon;
  const formattedDate = formatIstDateLong(article.date);

  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);


  const currentUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }, []);

  const cleanHtmlContent = article.htmlContent
    ? article.htmlContent.replace(/<hr[^>]*\s*\/?>/gi, "")
    : null;

  return (
    <Layout>
      <section className="pt-28 pb-10">
        <div className="container-wide">
          <NewsroomDetailHeader />

          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <div className="max-w-4xl">
                <article className="readable-content">
                  <div className="text-sm text-muted-foreground mb-3">
                    <span className="font-medium text-accent">Last Updated: {formattedDate}</span>
                  </div>

                  <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
                    {article.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-2 mb-6">
                    {article.industry && IndustryIcon && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10">
                        <IndustryIcon className="w-4 h-4 text-primary" />
                        <span className="text-primary text-sm font-medium">{article.industry}</span>
                      </div>
                    )}
                    {article.tags && article.tags.length > 0 && (
                      <>
                        {article.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 text-sm font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors duration-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </>
                    )}
                  </div>

                  <h2 className="font-display text-2xl font-semibold text-foreground mb-8 leading-relaxed">
                    {article.subheader}
                  </h2>

                  {cleanHtmlContent && (
                    <div dangerouslySetInnerHTML={{ __html: cleanHtmlContent }} />
                  )}

                  <AboutUsBox />
                </article>
              </div>
            </div>

            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-24 space-y-6">
                <div className="card-elevated p-4">
                  <h3 className="font-display text-sm font-semibold text-foreground mb-3">
                    Share
                  </h3>
                  <NewsroomShareButtons title={article.title} url={currentUrl} />
                </div>

                <div className="card-elevated p-6">
                  <Button asChild variant="default" className="w-full gap-2 group relative overflow-hidden">
                    <Link href={getContactFormLink("newsroom-cta")}> 
                      <span className="relative z-10 text-white">Talk to Us</span>
                      <ArrowUpRight className="w-4 h-4 relative z-10 text-white group-hover:animate-arrow-bounce" />
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    </Link>
                  </Button>
                </div>

                <LatestReleasesWidget currentSlug={article.slug} articles={latestArticles} />
              </div>
            </aside>
          </div>
        </div>
      </section>

      <RelatedResources resources={relatedResources} />
    </Layout>
  );
}
