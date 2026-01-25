import type { Metadata } from "next";
import { Suspense } from "react";
import ExplorePage from "@/legacy-pages/insights/Explore";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const hasQuery = Object.keys(resolvedParams || {}).length > 0;
  const canonical = `${SITE_URL}/insights/explore`;

  return {
    title: "Insights Explore | Alora Advisory",
    description: "Browse Alora Advisory insights by industry, theme, and report type.",
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

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ExplorePage />
    </Suspense>
  );
}
