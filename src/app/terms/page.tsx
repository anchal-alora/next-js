import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import PageComponent from "@/legacy-pages/Terms";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Terms" + " | Alora Advisory",
  description: "Terms and conditions for using Alora Advisory services and website.",
  alternates: {
    canonical: `${SITE_URL}/terms`,
  },
};

export default function Page() {
  return <PageComponent />;
}
