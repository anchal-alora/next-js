import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import PageComponent from "@/legacy-pages/Cookies";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Cookies" + " | Alora Advisory",
  description: "Cookie policy and preferences for the Alora Advisory website.",
  alternates: {
    canonical: `${SITE_URL}/cookies`,
  },
};

export default function Page() {
  return <PageComponent />;
}
