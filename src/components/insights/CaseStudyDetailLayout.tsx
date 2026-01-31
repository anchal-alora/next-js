"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight } from "lucide-react";
import type { Report } from "@/lib/reportUtils";
import { getContactFormLink } from "@/lib/routes";
import { InsightSidebar } from "./InsightSidebar";
import { MdxContentWrapper } from "./MdxContentWrapper";
import { DetailTopBar } from "./DetailTopBar";
import { OptimizedPicture } from "@/components/shared/OptimizedPicture";
import { MarkdownContent } from "./MarkdownContent";
import { contentComponents } from "./ContentComponents";
import { renderInlineMarkdown } from "@/lib/inlineMarkdown";
import { AboutUsBox } from "./AboutUsBox";
import { formatIstDateLong } from "@/lib/istDate";
import Layout from "@/components/layout/Layout";

// MDX component type that accepts a components prop
type MdxComponentType = React.ComponentType<{ components?: Record<string, React.ComponentType> }>;

interface CaseStudyDetailLayoutProps {
  report: Report;
  mdxComponent: MdxComponentType | null;
  mdxError: boolean;
  htmlContent: string | null;
  htmlError: boolean;
}

export function CaseStudyDetailLayout({
  report,
  mdxComponent,
  mdxError,
  htmlContent,
  htmlError,
}: CaseStudyDetailLayoutProps) {
  const contentRef = useRef<HTMLElement>(null);
  const taggings = report.taggings ?? [];
  const heroImageToUse = report.heroImage ?? report.image;
  const hasMdx = !!mdxComponent && !mdxError;
  const hasHtml = !!htmlContent && !htmlError;

  const formattedDate = formatIstDateLong(report.date);

  return (
    <Layout>
      <section className="pt-28 pb-10">
        <div className="container-wide">
          <DetailTopBar reportId={report.id} reportTitle={report.title} />

        <div className="grid lg:grid-cols-12 gap-10 items-start mb-12">
          <div className="lg:col-span-7">
            <span className="block font-medium text-accent text-sm mb-2">
              Last Updated: {formattedDate}
            </span>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
              {report.title}
            </h1>

            <div className="text-lg text-muted-foreground leading-relaxed mb-8">
              {renderInlineMarkdown(report.description)}
            </div>

            {taggings.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {taggings.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors duration-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-5">
            {heroImageToUse ? (
              <div className="card-elevated overflow-hidden">
                <OptimizedPicture
                  imageKey={heroImageToUse}
                  alt={report.title}
                  className="w-full h-auto object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 mb-12">
          <aside className="hidden lg:block lg:col-span-4">
            {(hasMdx || hasHtml) && (
              <InsightSidebar report={report} tocRef={contentRef} tocKey={report.slug} showCTA={false} />
            )}
          </aside>

          <div className="lg:col-span-8">
            <div className="max-w-4xl">
              {hasMdx ? (
                <article ref={contentRef} className="readable-content">
                  <MdxContentWrapper>
                    {React.createElement(mdxComponent as MdxComponentType, {
                      components: contentComponents,
                    })}
                  </MdxContentWrapper>
                  <AboutUsBox />
                </article>
              ) : hasHtml ? (
                <article ref={contentRef} className="readable-content">
                  <MdxContentWrapper>
                    <MarkdownContent html={htmlContent as string} />
                  </MdxContentWrapper>
                  <AboutUsBox />
                </article>
              ) : mdxError || htmlError ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Content coming soon.</p>
                </div>
              ) : report.mdxSlug || report.mdSlug ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading content...</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Content coming soon.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </section>

      <section className="section-padding bg-secondary/10">
        <div className="container-wide">
          <div className="rounded-2xl border border-border bg-background/60 p-8 md:p-12 shadow-elegant-md text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-semibold">Discuss This Case Study</h2>
              <p className="text-muted-foreground max-w-2xl">
                Let us know if you’d like to unpack the learnings or apply these insights to your strategic priorities.
              </p>
              <Button asChild size="lg" className="gap-2 hover:bg-primary">
                <Link href={getContactFormLink("case-study-detail-cta")}>
                  <span className="relative z-10 text-white">Contact Us</span>
                  <ArrowRight className="w-4 h-4 relative z-10 text-white" />
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
