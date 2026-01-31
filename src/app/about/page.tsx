import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import PageComponent from "@/legacy-pages/About";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About" + " | Alora Advisory",
  description: "Meet the Alora Advisory team and our approach to evidence-led strategy and research.",
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
};

export default function Page() {
  return <PageComponent />;
}
