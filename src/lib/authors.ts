/**
 * Author data for team member profiles
 * Used for E-E-A-T (Entity Authority) and linking to reports
 */

export interface Author {
  slug: string;
  name: string;
  role: string;
  bio: string;
  image?: string;
  linkedin?: string;
  twitter?: string;
  email?: string;
}

export const authors: Author[] = [
  {
    slug: "alora-advisory-team",
    name: "Alora Advisory Team",
    role: "Strategic Advisory & Market Intelligence",
    bio: "The Alora Advisory team combines deep market research expertise with strategic interpretation to deliver insights that support high-stakes business decisions. Our work spans market sizing, competitive intelligence, go-to-market strategy, and investment analysis across technology, healthcare, energy, and automotive sectors.",
    email: "info@aloraadvisory.com",
    linkedin: "https://www.linkedin.com/company/alora-advisory",
    image: "/images/team/alora-advisory-team.png",
  },
];

/**
 * Get author by slug
 */
export function getAuthorBySlug(slug: string): Author | undefined {
  return authors.find((a) => a.slug === slug);
}

/**
 * Get default author for reports (when no specific author is assigned)
 */
export function getDefaultAuthor(): Author {
  return authors[0];
}
