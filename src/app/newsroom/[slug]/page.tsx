import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NewsroomDetail from "@/legacy-pages/newsroom/NewsroomDetail";
import { SeoJsonLd } from "@/components/SeoJsonLd";
import { articleSchema, breadcrumbSchema, organizationSchema } from "@/lib/schema";
import { toCanonical } from "@/lib/seo";
import { getAllNewsroomArticles, getNewsroomArticleBySlug, getNewsroomSlugs } from "@/lib/server/newsroom";
import { getAllReports } from "@/lib/server/reports";
import { selectRelatedResourcesForNewsroomArticle, type RelatedResourceCandidate } from "@/lib/relatedResources";

export const revalidate = 3600;

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const slugs = await getNewsroomSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsroomArticleBySlug(slug);
  if (!article) return {};

  const canonical = toCanonical(`/newsroom/${article.slug}`);
  const fallbackOgImageUrl = toCanonical("/og-image.jpg");

  return {
    title: `${article.title} | Alora Advisory`,
    description: article.subheader,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${article.title} | Alora Advisory`,
      description: article.subheader,
      url: canonical,
      type: "article",
      images: [{ url: fallbackOgImageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${article.title} | Alora Advisory`,
      description: article.subheader,
      images: [fallbackOgImageUrl],
    },
  };
}

function toCandidate(report: { id: string; title: string; date: string; industry: string; taggings?: string[]; slug: string; type?: string; description?: string; }): RelatedResourceCandidate {
  return {
    id: report.id,
    title: report.title,
    date: report.date,
    industry: report.industry,
    tags: report.taggings,
    url: `/insights/${report.slug}`,
    type: report.type,
    description: report.description,
  };
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  const article = await getNewsroomArticleBySlug(slug);
  if (!article) {
    notFound();
  }

  const latestArticles = await getAllNewsroomArticles();
  const reports = await getAllReports();
  const candidates = reports.map(toCandidate);
  const relatedResources = selectRelatedResourcesForNewsroomArticle(article, candidates, { count: 4 });

  const canonical = toCanonical(`/newsroom/${article.slug}`);
  const schemas = [
    organizationSchema(),
    articleSchema({
      pathname: `/newsroom/${article.slug}`,
      headline: article.title,
      description: article.subheader,
      datePublished: article.date,
      authorName: "Alora Advisory",
    }),
    breadcrumbSchema([
      { name: "Home", url: toCanonical("/") },
      { name: "Newsroom", url: toCanonical("/newsroom") },
      { name: article.title, url: canonical },
    ]),
  ];

  return (
    <>
      <SeoJsonLd schema={schemas} />
      <NewsroomDetail article={article} latestArticles={latestArticles} relatedResources={relatedResources} />
    </>
  );
}
