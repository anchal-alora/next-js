import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import PageComponent from "@/legacy-pages/Industries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Industries" + " | Alora Advisory",
  description: "Industry expertise across technology, healthcare, energy, and mobility to inform confident decisions.",
  alternates: {
    canonical: `${SITE_URL}/industries`,
  },
};

export default function Page() {
  return <PageComponent />;
}
