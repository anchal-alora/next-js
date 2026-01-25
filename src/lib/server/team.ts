import { cache } from "react";
import { authors } from "@/lib/authors";

export const getTeamMembers = cache(async () => authors);

export const getTeamMemberBySlug = cache(async (slug: string) => {
  return authors.find((author) => author.slug === slug) ?? null;
});

export const getTeamSlugs = cache(async () => authors.map((author) => author.slug));
