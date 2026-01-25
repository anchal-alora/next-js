"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, CheckCircle2, ArrowUpRight } from "lucide-react";
import type { Report } from "@/lib/reportUtils";
import { getContactFormLink } from "@/lib/routes";
import { FormErrorSummary } from "@/components/forms/FormErrorSummary";
import { FieldError } from "@/components/forms/FieldError";
import { InsightSidebar } from "./InsightSidebar";
import { MdxContentWrapper } from "./MdxContentWrapper";
import { DetailTopBar } from "./DetailTopBar";
import { OptimizedPicture } from "@/components/shared/OptimizedPicture";
import { MarkdownContent } from "./MarkdownContent";
import { contentComponents } from "./ContentComponents";
import { renderInlineMarkdown } from "@/lib/inlineMarkdown";
import { AboutUsBox } from "./AboutUsBox";
import { ContactBlock } from "@/components/shared/ContactBlock";
import { formatIstDateLong } from "@/lib/istDate";
import Layout from "@/components/layout/Layout";
import type { ReportFaq } from "@/lib/faqTypes";
import { FaqSection } from "@/components/insights/FaqSection";

// MDX component type that accepts a components prop
type MdxComponentType = React.ComponentType<{ components?: Record<string, React.ComponentType> }>;

type ReportWithContent = Report & {
  mdxSlug?: string;
  mdSlug?: string;
};

interface ReportDetailLayoutProps {
  report: ReportWithContent;
  mdxComponent: MdxComponentType | null;
  mdxError: boolean;
  htmlContent: string | null;
  htmlError: boolean;
  faqs?: ReportFaq[];
  formData: {
    fullName: string;
    email: string;
    phone: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isFormSubmitted: boolean;
  reportLink?: string;
  error?: string | null;
  fullNameError?: string | null;
  onResetForm: () => void;
}

export function ReportDetailLayout({
  report,
  mdxComponent,
  mdxError,
  htmlContent,
  htmlError,
  faqs,
  formData,
  handleChange,
  handleSubmit,
  isFormSubmitted,
  reportLink,
  error,
  fullNameError,
  onResetForm,
}: ReportDetailLayoutProps) {
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
          {/* Top Bar with Actions */}
          <DetailTopBar reportId={report.id} reportTitle={report.title} />

        {/* Hero Section */}
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

        {/* Readable Content Section with TOC */}
        <div className="grid lg:grid-cols-12 gap-8 mb-12">
          {/* TOC Sidebar - Left */}
          <aside className="hidden lg:block lg:col-span-4">
            {(hasMdx || hasHtml) && (
              <InsightSidebar report={report} tocRef={contentRef} tocKey={report.slug} showCTA={true} />
            )}
          </aside>

          {/* Article Content - Center */}
          <div className="lg:col-span-8">
            <div className="max-w-4xl">
              {hasMdx ? (
                <article ref={contentRef} className="readable-content">
                  <MdxContentWrapper>
                    {React.createElement(mdxComponent as MdxComponentType, {
                      components: contentComponents,
                    })}
                  </MdxContentWrapper>
                  <ContactBlock />
                  <FaqSection faqs={faqs} />
                  <AboutUsBox />
                </article>
              ) : hasHtml ? (
                <article ref={contentRef} className="readable-content">
                  <MdxContentWrapper>
                    <MarkdownContent html={htmlContent as string} />
                  </MdxContentWrapper>
                  <ContactBlock />
                  <FaqSection faqs={faqs} />
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

      {/* Mobile Sticky Download CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-50 shadow-lg">
        <Button
          asChild
          variant="default"
          className="w-full gap-2"
        >
          <a href={report.contentFormat === "downloadable" ? "#download-form" : "#contact-form"} onClick={(e) => {
            e.preventDefault();
            const targetId = report.contentFormat === "downloadable" ? "#download-form" : "#contact-form";
            const element = document.querySelector(targetId);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}>
            <FileText className="w-4 h-4 text-white" />
            <span className="text-white">Download Report [PDF]</span>
          </a>
        </Button>
      </div>

      {/* Summary Section */}
      {report.contentFormat === "downloadable" ? (
        <section id="download-form" className="section-padding bg-foreground text-background scroll-mt-24">
          <div className="container-wide">
            <div className="max-w-4xl mx-auto bg-card text-foreground rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col md:flex-row transform transition-all duration-300" style={{ boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)' }}>
              <div className="p-8 md:p-12 flex-1 space-y-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-4 text-foreground">What the Reader Will Get</h2>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">Market size, structure, and growth outlook</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">Key market drivers, risks, and constraints</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">Competitive landscape and positioning analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">Value chain and ecosystem snapshot</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">Strategic implications and future outlook</span>
                    </li>
                  </ul>
                  <p className="text-base text-muted-foreground mt-4 font-semibold">
                    Evidence led analysis with a forward-looking perspective.
                  </p>
                </div>
              </div>

              <div className="p-8 md:p-12 flex-1 bg-secondary/30 flex flex-col justify-center">
                {!isFormSubmitted ? (
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                    name="downloadable-report"
                    method="POST"
                    noValidate
                  >
                    <FormErrorSummary errors={[...(error ? [error] : []), ...(fullNameError ? [fullNameError] : [])]} />

                    <h3 className="font-semibold text-lg mb-2">Unlock Access</h3>
                    <div>
                      <Label htmlFor="fullName" className="block text-sm font-medium mb-1.5">
                        Full Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className={`bg-background ${fullNameError ? "border-destructive" : ""}`}
                      />
                      <FieldError error={fullNameError} />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="block text-sm font-medium mb-1.5">
                        Phone <span className="text-muted-foreground font-normal">(Optional)</span>
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={handleChange}
                        className="bg-background"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="block text-sm font-medium mb-1.5">
                        Work Email <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@company.com"
                        value={formData.email}
                        onChange={handleChange}
                        className={`bg-background ${error ? "border-destructive" : ""}`}
                      />
                      <FieldError error={error} />
                    </div>
                    <Button
                      type="submit"
                      className="w-full gap-2 mt-2"
                      disabled={!formData.email || !formData.fullName}
                    >
                      Download Report
                      <ArrowUpRight className="w-4 h-4" />
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-4">
                      We respect your privacy. No spam.
                    </p>
                  </form>
                ) : (
                  <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2">Access Granted</h3>
                      <p className="text-muted-foreground text-sm">
                        Thank you for accessing our report. If you face any issues,{" "}
                        <Link href={getContactFormLink("report-detail-access-granted")} className="text-primary hover:underline font-medium">
                          contact us
                        </Link>
                        .
                      </p>
                    </div>
                    <button
                      onClick={onResetForm}
                      className="text-xs text-muted-foreground hover:text-primary underline mt-4"
                    >
                      Register another email
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section id="contact-form" className="py-16 lg:py-24 bg-[rgb(39,27,44)] scroll-mt-24">
          <div className="container-wide">
            <div className="max-w-4xl mx-auto bg-card rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col md:flex-row transform transition-all duration-300" style={{ boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)' }}>
              <div className="p-8 md:p-12 flex-1 space-y-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-4 text-foreground">About the Research</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Our in-depth analysis is designed for organizations evaluating strategic decisions in this space.
                  </p>
                  <h3 className="text-base font-medium mb-4 text-foreground">The full report includes:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">Market structure and competitive dynamics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">Strategic implications and investment insights</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">Industry benchmarks and scenario analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">Insights tailored to your business context</span>
                    </li>
                  </ul>
                  <p className="text-base text-muted-foreground mt-4 font-semibold">
                    We tailor discussions based on your industry and objectives.
                  </p>
                </div>
              </div>

              <div className="p-8 md:p-12 flex-1 bg-secondary/30 flex flex-col justify-center">
                {!isFormSubmitted ? (
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                    name="non-downloadable-report"
                    method="POST"
                    noValidate
                  >
                    <FormErrorSummary errors={[...(error ? [error] : []), ...(fullNameError ? [fullNameError] : [])]} />

                    <h3 className="font-semibold text-lg mb-2">To access full report, please contact us.</h3>
                    <div>
                      <Label htmlFor="fullName-non-downloadable" className="block text-sm font-medium mb-1.5">
                        Full Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="fullName-non-downloadable"
                        name="fullName"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className={`bg-background ${fullNameError ? "border-destructive" : ""}`}
                      />
                      <FieldError error={fullNameError} />
                    </div>
                    <div>
                      <Label htmlFor="phone-non-downloadable" className="block text-sm font-medium mb-1.5">
                        Phone <span className="text-muted-foreground font-normal">(Optional)</span>
                      </Label>
                      <Input
                        id="phone-non-downloadable"
                        name="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={handleChange}
                        className="bg-background"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email-non-downloadable" className="block text-sm font-medium mb-1.5">
                        Work Email <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email-non-downloadable"
                        name="email"
                        type="email"
                        placeholder="john@company.com"
                        value={formData.email}
                        onChange={handleChange}
                        className={`bg-background ${error ? "border-destructive" : ""}`}
                      />
                      <FieldError error={error} />
                    </div>
                    <Button
                      type="submit"
                      className="w-full gap-2 mt-2"
                      disabled={!formData.email || !formData.fullName}
                    >
                      Contact Us
                      <ArrowUpRight className="w-4 h-4" />
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-4">
                      We respect your privacy. No spam.
                    </p>
                  </form>
                ) : (
                  <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2">Thank you!</h3>
                      <p className="text-muted-foreground text-sm">
                        We have received your request. Our team will reach out soon. If you need immediate help,{" "}
                        <Link href={getContactFormLink("report-detail-thank-you")} className="text-primary hover:underline font-medium">
                          contact us
                        </Link>
                        .
                      </p>
                    </div>
                    <button
                      onClick={onResetForm}
                      className="text-xs text-muted-foreground hover:text-primary underline mt-4"
                    >
                      Register another email
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Report Link Section (Legacy) */}
      {reportLink && (
        <section className="py-12">
          <div className="container-wide text-center">
            <Button asChild variant="outline" size="lg">
              <a href={reportLink} target="_blank" rel="noopener noreferrer">
                View Report
              </a>
            </Button>
          </div>
        </section>
      )}
    </Layout>
  );
}
