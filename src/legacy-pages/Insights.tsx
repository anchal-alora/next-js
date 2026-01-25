"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import Layout from "@/components/layout/Layout";
import SectionHeader from "@/components/shared/SectionHeader";
import { OptimizedPicture } from "@/components/shared/OptimizedPicture";
import { ScrollReveal } from "@/components/ScrollReveal";
import { FileText, ChevronRight, ArrowUpRight, ArrowRight } from "lucide-react";
import reportsData from "../../reports-link.json";
import { assignReportsToSectionsWithInsightsHero, type Report } from "@/lib/reportUtils";
import { ReportCard } from "@/components/reports/ReportCard";
import { FeaturedInsightsInfographic, InsightsHero } from "@/components/insights";
import { getIndustryConfig, getIndustryShortLabel } from "@/lib/industryConfig";
import { getContactFormLink } from "@/lib/routes";
import { formatIstDateLong } from "@/lib/istDate";

export default function Insights() {
  const pathname = usePathname();
  const [caseStudiesApi, setCaseStudiesApi] = useState<CarouselApi>();
  const [caseStudiesCount, setCaseStudiesCount] = useState(0);
  const [caseStudiesCurrent, setCaseStudiesCurrent] = useState(0);
  const [researchReportsApi, setResearchReportsApi] = useState<CarouselApi>();
  const [researchReportsCount, setResearchReportsCount] = useState(0);
  const [researchReportsCurrent, setResearchReportsCurrent] = useState(0);
  const caseStudiesPausedRef = useRef(false);
  const researchReportsPausedRef = useRef(false);

  // Assign reports to sections
  const { insightsHeroReport, featuredInsights, caseStudies, researchReports, recentArticles } =
    assignReportsToSectionsWithInsightsHero(reportsData.reports as Report[]);

  // Case Studies carousel state management
  useEffect(() => {
    if (!caseStudiesApi) return;

    const onSelect = () => {
      setCaseStudiesCount(caseStudiesApi.scrollSnapList().length);
      setCaseStudiesCurrent(caseStudiesApi.selectedScrollSnap());
    };

    onSelect();
    caseStudiesApi.on("select", onSelect);
    caseStudiesApi.on("reInit", onSelect);

    return () => {
      caseStudiesApi.off("select", onSelect);
      caseStudiesApi.off("reInit", onSelect);
    };
  }, [caseStudiesApi]);

  // Auto-advance Case Studies carousel
  useEffect(() => {
    if (!caseStudiesApi || caseStudiesCount <= 1) return;

    const interval = setInterval(() => {
      if (!caseStudiesPausedRef.current) {
        caseStudiesApi.scrollNext();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [caseStudiesApi, caseStudiesCount]);

  // Research Reports carousel state management
  useEffect(() => {
    if (!researchReportsApi) return;

    const onSelect = () => {
      setResearchReportsCount(researchReportsApi.scrollSnapList().length);
      setResearchReportsCurrent(researchReportsApi.selectedScrollSnap());
    };

    onSelect();
    researchReportsApi.on("select", onSelect);
    researchReportsApi.on("reInit", onSelect);

    return () => {
      researchReportsApi.off("select", onSelect);
      researchReportsApi.off("reInit", onSelect);
    };
  }, [researchReportsApi]);

  // Auto-advance Research Reports carousel
  useEffect(() => {
    if (!researchReportsApi || researchReportsCount <= 1) return;

    const interval = setInterval(() => {
      if (!researchReportsPausedRef.current) {
        researchReportsApi.scrollNext();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [researchReportsApi, researchReportsCount]);

  return (
    <Layout>
      
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <OptimizedPicture
            imageKey="site/insights-hero"
            alt="Insights & Research"
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
          <ScrollReveal direction="up" delay={0}>
            <div className="max-w-3xl">
              <span className="inline-block text-accent font-semibold text-sm uppercase tracking-widest mb-6">
                Insights & Research
              </span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
                Perspectives on Market
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/80 leading-relaxed">
                A curated selection of recent content reflecting how Alora Advisory interprets market signals, industry change, and strategic risk.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Empty State */}
      {reportsData.reports.length === 0 && (
        <section className="py-16 md:py-24">
          <div className="container-wide">
            <div className="text-center">
              <p className="text-muted-foreground text-lg">No insights published yet.</p>
            </div>
          </div>
        </section>
      )}

      {/* Insights Hero */}
      {insightsHeroReport && (
        <section className="py-8 md:py-12">
          <div className="container-wide">
            <InsightsHero report={insightsHeroReport} />
            <div className="mt-8">
              <Button asChild variant="outline" className="group relative overflow-hidden">
                <Link href="/insights/explore" onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "auto" })}>
                  <span className="relative z-10 flex items-center gap-2">
                    Explore All Insights
                    <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Featured Insights */}
      {featuredInsights.length > 0 && (
        <section className="py-8 md:py-12">
          <div className="container-wide">
            <div className="flex items-center justify-between mb-12">
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
                Featured Insights
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {featuredInsights.map((report, index) => (
                <FeaturedInsightsInfographic
                  key={report.id}
                  report={report}
                  className="opacity-0 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
                />
              ))}
            </div>

            <div className="mt-12 flex justify-center">
              <Button asChild variant="default" size="lg" className="group relative overflow-hidden">
                <Link href={getContactFormLink("insights-featured")}>
                  <span className="relative z-10 text-white">Discuss This Insight</span>
                  <ArrowRight className="ml-2 relative z-10 text-white" />
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Recent Articles */}
      {recentArticles.length > 0 && (
        <section className="py-8 md:py-12 bg-secondary">
          <div className="container-wide">
            <div className="flex items-center justify-between mb-12">
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
                Recent Articles
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {recentArticles.slice(0, 2).map((report, index) => {
                const industryShort = getIndustryShortLabel(report.industry || "Technology and AI");
                const config = getIndustryConfig(industryShort);
                const IndustryIcon = config.icon;
                const linkTo = `/insights/${report.slug}`;
                const dateToShow = formatIstDateLong(report.date);
                const ctaText = report.placement === "Case Studies"
                  ? "Read Full Case Study"
                  : report.contentFormat === "downloadable"
                  ? "Download Now"
                  : "View Report";
                return (
                <Link
                  key={report.id}
                  href={linkTo}
                  className="block h-full group opacity-0 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
                >
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
                          <span className="text-muted-foreground text-sm font-medium">{industryShort}</span>
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
                      {dateToShow && <span className="text-muted-foreground text-sm">{dateToShow}</span>}
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
            <div className="mt-8">
              <Button asChild variant="outline" className="group relative overflow-hidden">
                <Link href="/insights/explore" onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "auto" })}>
                  <span className="relative z-10 flex items-center gap-2">
                    Explore All Insights
                    <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Research Reports */}
      {researchReports.length > 0 && (
        <section id="research" className="py-8 md:py-12 bg-foreground text-background relative">
          <div className="container-wide relative">
            {/* Section Header with CTA Button on same line */}
            <div className="relative">
              {/* CTA Button - mobile/tablet: top-right; desktop: keep existing placement */}
              <div className="z-10 flex justify-end lg:absolute lg:right-0 lg:bottom-0 lg:items-center pr-0 lg:pr-8 mb-4 lg:mb-0">
                <Button
                  asChild
                  variant="secondary"
                  size="default"
                  className="gap-2 bg-white text-black hover:bg-white border-none transition-all duration-300 group relative overflow-hidden text-base font-medium"
                >
                  <Link href={getContactFormLink("insights-expert-insight")}>
                    <span className="relative z-10">Get Expert Insight</span>
                    <ArrowUpRight className="w-5 h-5 relative z-10 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
                  </Link>
                </Button>
              </div>
              <div className="max-w-3xl relative">
                <SectionHeader
                  badge="Research"
                  title="In-Depth Research Reports"
                  subtitle="Download our latest research on the trends and topics shaping business strategy."
                  light
                />
              </div>
            </div>

            <div className="mt-16">
              <div
                className="relative rounded-2xl border border-background/10 bg-background/5 backdrop-blur-sm overflow-hidden group"
                style={{
                  boxShadow:
                    "0 30px 80px -40px rgba(0,0,0,0.85), 0 12px 28px -18px rgba(0,0,0,0.55)",
                }}
                onMouseEnter={() => {
                  researchReportsPausedRef.current = true;
                }}
                onMouseLeave={() => {
                  researchReportsPausedRef.current = false;
                }}
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-background/12 via-transparent to-transparent" />

                <Carousel
                  setApi={setResearchReportsApi}
                  opts={{
                    align: "center",
                    loop: true,
                    duration: 35,
                    dragFree: false,
                    containScroll: "trimSnaps",
                  }}
                  className="relative"
                >
                  <CarouselContent className="py-10 md:py-12">
                    {researchReports.map((report) => (
                      <CarouselItem key={report.id}>
                        <div className="px-6 md:px-10">
                          <div className="relative rounded-xl border border-background/10 bg-background/5 p-8 md:p-10">
                            {report.image && (
                              <div className="absolute inset-0 rounded-xl overflow-hidden opacity-20">
                                <OptimizedPicture
                                  imageKey={report.image}
                                  alt=""
                                  fill
                                  wrapperClassName="w-full h-full"
                                  className="object-cover"
                                  sizes="(max-width: 768px) 100vw, 800px"
                                  loading="lazy"
                                />
                              </div>
                            )}
                            <div className="relative z-10 min-h-[200px]">
                              {report.industry && (
                                <div className="absolute top-0 right-0">
                                  {(() => {
                                    const config = getIndustryConfig(report.industry || "Technology and AI");
                                    const IndustryIcon = config.icon;
                                    return (
                                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/20 backdrop-blur-sm border border-background/30">
                                        <IndustryIcon className="w-4 h-4 text-background" />
                                        <span className="text-background text-sm font-medium">
                                          {report.industry}
                                        </span>
                                      </div>
                                    );
                                  })()}
                                </div>
                              )}
                              <FileText className="w-12 h-12 text-white mb-6" />
                              <h3 className="font-display text-xl font-semibold text-background mb-3 line-clamp-2">
                                {report.title}
                              </h3>
                              <p className="text-background/70 text-sm leading-relaxed mb-4 line-clamp-4">
                                {report.description}
                              </p>
                              <div className="flex items-center justify-between">
                                {(() => {
                                  const dateToShow = formatIstDateLong(report.date);
                                  return dateToShow ? (
                                    <span className="text-background/50 text-sm">{dateToShow}</span>
                                  ) : (
                                    <span className="text-background/50 text-sm" />
                                  );
                                })()}
                                <Button
                                  asChild
                                  variant="secondary"
                                  size="sm"
                                  className="bg-white/10 hover:bg-white text-background hover:text-black border-none backdrop-blur-sm transition-all duration-300"
                                >
                                  <Link href={`/insights/${report.slug}`}>
                                    {report.contentFormat === "downloadable"
                                      ? "Download Now"
                                      : "View Report"}
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>

                  {researchReports.length > 1 && (
                    <>
                      <CarouselPrevious
                        variant="outline"
                        className="left-6 top-1/2 -translate-y-1/2 right-auto bg-background/10 border-background/20 text-background hover:bg-background/20 hover:text-background"
                      />
                      <CarouselNext
                        variant="outline"
                        className="right-6 top-1/2 -translate-y-1/2 left-auto bg-background/10 border-background/20 text-background hover:bg-background/20 hover:text-background"
                      />

                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-background/10 border border-background/15 px-3 py-2 backdrop-blur-sm transition-all duration-300 ease-in-out">
                        {Array.from({ length: researchReportsCount }).map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            aria-label={`Go to report ${i + 1}`}
                            onClick={() => researchReportsApi?.scrollTo(i)}
                            className={[
                              "h-2 rounded-full relative",
                              i === researchReportsCurrent
                                ? "bg-primary w-6"
                                : "bg-background/40 hover:bg-background/60 w-2",
                            ].join(" ")}
                            style={{
                              transition:
                                "width 400ms cubic-bezier(0.4, 0, 0.2, 1), background-color 400ms cubic-bezier(0.4, 0, 0.2, 1), transform 400ms cubic-bezier(0.4, 0, 0.2, 1)",
                              willChange: "width, background-color",
                            }}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </Carousel>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Case Studies */}
      {caseStudies.length > 0 && (
        <section id="case-studies" className="py-8 md:py-12">
          <div className="container-wide">
            <SectionHeader
              badge="Case Studies"
              title="Strategic Impact in Action"
              subtitle="Explore how we've helped clients across industries achieve transformational results."
            />

            <div className="mt-16">
              <div
                className="relative rounded-2xl border border-border bg-card overflow-hidden group"
                onMouseEnter={() => {
                  caseStudiesPausedRef.current = true;
                }}
                onMouseLeave={() => {
                  caseStudiesPausedRef.current = false;
                }}
              >
                <Carousel
                  setApi={setCaseStudiesApi}
                  opts={{
                    align: "center",
                    loop: true,
                    duration: 35,
                    dragFree: false,
                    containScroll: "trimSnaps",
                  }}
                  className="relative"
                >
                  <CarouselContent className="py-10 md:py-12">
                    {caseStudies.map((report) => (
                      <CarouselItem key={report.id} className="md:basis-full">
                        <div className="px-6 md:px-10 h-full">
                          <div className="card-elevated overflow-hidden h-full">
                            <div className="grid md:grid-cols-2 h-full md:min-h-[320px]">
                              {report.image && (
                                <div className="aspect-video md:aspect-auto md:h-full relative">
                                  <OptimizedPicture
                                    imageKey={report.image}
                                    alt={report.title}
                                    fill
                                    wrapperClassName="w-full h-full"
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    loading="lazy"
                                  />
                                  {/* Sector badge: positioned on image (top-left) */}
                                  {report.industry && (
                                    <div className="absolute top-4 left-4 z-10">
                                      {(() => {
                                        const config = getIndustryConfig(report.industry || "Technology and AI");
                                        const IndustryIcon = config.icon;
                                        return (
                                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/80 backdrop-blur-sm">
                                            <IndustryIcon className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-muted-foreground text-sm font-medium">
                                              {report.industry}
                                            </span>
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  )}
                                </div>
                              )}
                              <div className="p-8 md:p-10 flex flex-col justify-center relative">
                                <h3 className="font-display text-2xl font-semibold text-foreground mt-2 mb-4 line-clamp-2">
                                  {report.title}
                                </h3>
                                {report.description && (
                                  <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-4">
                                    {report.description}
                                  </p>
                                )}
                                <Button variant="outline" className="self-start" asChild>
                                  <Link href={`/insights/${report.slug}`}>
                                    Read Full Case Study
                                    <ChevronRight className="ml-1 w-4 h-4" />
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>

                  {caseStudies.length > 1 && (
                    <>
                      <CarouselPrevious
                        variant="outline"
                        className="left-6 top-1/2 -translate-y-1/2 bg-background/80 border-border hover:bg-background"
                        style={{ opacity: 0.5 }}
                      />
                      <CarouselNext
                        variant="outline"
                        className="right-6 top-1/2 -translate-y-1/2 bg-background/80 border-border hover:bg-background"
                        style={{ opacity: 0.5 }}
                      />
                    </>
                  )}
                </Carousel>
              </div>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="default" size="lg" className="group relative overflow-hidden">
                <Link href={getContactFormLink("insights-cta")}>
                  <span className="relative z-10 text-white">Start a Conversation</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="group relative overflow-hidden">
                <Link href="/services">
                  <span className="relative z-10">Explore Services</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}
