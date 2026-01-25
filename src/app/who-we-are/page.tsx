import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import PageComponent from "@/legacy-pages/WhoWeAre";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Who We Are" + " | Alora Advisory",
  description: "Meet the Alora Advisory team and our approach to evidence-led strategy and research.",
  alternates: {
    canonical: `${SITE_URL}/who-we-are`,
  },
};

export default function Page() {
  return <PageComponent />;
}
