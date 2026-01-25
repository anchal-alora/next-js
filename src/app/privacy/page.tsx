import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import PageComponent from "@/legacy-pages/Privacy";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Privacy Statement" + " | Alora Advisory",
  description: "Learn how Alora Advisory collects, uses, and protects your personal information.",
  alternates: {
    canonical: `${SITE_URL}/privacy`,
  },
};

export default function Page() {
  return <PageComponent />;
}
