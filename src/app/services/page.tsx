import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import PageComponent from "@/legacy-pages/Services";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Services" + " | Alora Advisory",
  description: "Strategic advisory, market research, and growth support tailored to complex business decisions.",
  alternates: {
    canonical: `${SITE_URL}/services`,
  },
};

export default function Page() {
  return <PageComponent />;
}
