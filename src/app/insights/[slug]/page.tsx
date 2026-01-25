import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReportDetailPage } from "@/components/pages/ReportDetailPage";
import { SeoJsonLd } from "@/components/SeoJsonLd";
import { articleSchema, breadcrumbSchema, organizationSchema, webPageSchema } from "@/lib/schema";
import { toCanonical } from "@/lib/seo";
import { getReportBySlug, getReportContent, getReportSlugs } from "@/lib/server/reports";

export const revalidate = 3600;

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const slugs = await getReportSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const report = await getReportBySlug(slug);
  if (!report) return {};

  const canonical = toCanonical(`/insights/${report.slug}`);
  const imageUrl = report.image ? toCanonical(report.image) : undefined;

  return {
    title: report.title,
    description: report.description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: report.title,
      description: report.description,
      url: canonical,
      type: "article",
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: report.title,
      description: report.description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  const report = await getReportBySlug(slug);
  if (!report) {
    notFound();
  }

  const content = await getReportContent(report);
  const htmlContent = content.kind === "html" ? content.html : null;
  const canonical = toCanonical(`/insights/${report.slug}`);

  const schemas = [
    organizationSchema(),
    webPageSchema(`/insights/${report.slug}`, report.title, report.description),
    articleSchema({
      pathname: `/insights/${report.slug}`,
      headline: report.title,
      description: report.description,
      datePublished: report.date,
      image: report.image ? toCanonical(report.image) : undefined,
      authorName: "Alora Advisory",
    }),
    breadcrumbSchema([
      { name: "Home", url: toCanonical("/") },
      { name: "Insights", url: toCanonical("/insights") },
      { name: report.title, url: canonical },
    ]),
  ];

  return (
    <>
      <SeoJsonLd schema={schemas} />
      <ReportDetailPage report={report} htmlContent={htmlContent} />
    </>
  );
}
