import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import PageComponent from "@/legacy-pages/Index";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Alora Advisory | Market Research and Strategic Advisory",
  description: "Alora Advisory is a premier management consulting firm helping Fortune 500 companies navigate complexity and achieve transformational results through strategy, operations, and digital transformation.",
  alternates: {
    canonical: `${SITE_URL}/`,
  },
};

export default function Page() {
  return <PageComponent />;
}
