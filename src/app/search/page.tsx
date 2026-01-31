import type { Metadata } from "next";
import { Suspense } from "react";
import Layout from "@/components/layout/Layout";
import { SITE_URL } from "@/lib/seo";
import { SearchPageClient } from "./SearchPageClient";

export const metadata: Metadata = {
  title: "Search | Alora Advisory",
  description: "Search across insights, newsroom releases, pages, and section anchors.",
  alternates: {
    canonical: `${SITE_URL}/search`,
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function Page() {
  return (
    <Layout>
      <Suspense fallback={<div className="min-h-screen" />}>
        <SearchPageClient />
      </Suspense>
    </Layout>
  );
}
