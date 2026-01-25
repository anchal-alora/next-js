import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TeamMember from "@/legacy-pages/team/TeamMember";
import { toCanonical } from "@/lib/seo";
import { getTeamMemberBySlug, getTeamSlugs } from "@/lib/server/team";

export const revalidate = 86400;

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const slugs = await getTeamSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const author = await getTeamMemberBySlug(slug);
  if (!author) return {};

  const canonical = toCanonical(`/team/${author.slug}`);

  return {
    title: `${author.name} | Alora Advisory`,
    description: author.bio,
    alternates: {
      canonical,
    },
  };
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  const author = await getTeamMemberBySlug(slug);
  if (!author) {
    notFound();
  }

  return <TeamMember author={author} />;
}
