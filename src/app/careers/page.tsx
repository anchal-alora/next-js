import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import PageComponent from "@/legacy-pages/Careers";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Careers" + " | Alora Advisory",
  description: "Join Alora Advisory and help leaders make evidence-led strategic decisions.",
  alternates: {
    canonical: `${SITE_URL}/careers`,
  },
};

export default function Page() {
  return <PageComponent />;
}
