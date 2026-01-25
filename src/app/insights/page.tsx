import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import PageComponent from "@/legacy-pages/Insights";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Insights" + " | Alora Advisory",
  description: "Research reports, case studies, and market insights from Alora Advisory.",
  alternates: {
    canonical: `${SITE_URL}/insights`,
  },
};

export default function Page() {
  return <PageComponent />;
}
