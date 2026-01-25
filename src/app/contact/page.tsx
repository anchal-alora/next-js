import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import PageComponent from "@/legacy-pages/Contact";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Contact" + " | Alora Advisory",
  description: "Get in touch with Alora Advisory for research, strategy, and advisory support.",
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
};

export default function Page() {
  return <PageComponent />;
}
