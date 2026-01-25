import type { Metadata } from "next";
import { Suspense } from "react";
import { SITE_URL } from "@/lib/seo";
import NewsroomListing from "@/legacy-pages/newsroom/NewsroomListing";
import { getAllNewsroomArticles } from "@/lib/server/newsroom";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Newsroom | Alora Advisory",
  description: "Latest announcements and press releases from Alora Advisory.",
  alternates: {
    canonical: `${SITE_URL}/newsroom`,
  },
};

export default async function Page() {
  const articles = await getAllNewsroomArticles();
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <NewsroomListing articles={articles} />
    </Suspense>
  );
}
