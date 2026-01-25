/**
 * TypeScript types for Newsroom article data structure
 * Matches the frontmatter schema from markdown files
 */

export interface NewsroomArticle {
  /** ISO date string (required) */
  date: string;
  /** Title of the article (required) */
  title: string;
  /** Industry name matching industryConfig (required) */
  industry: string;
  /** Subheader text that becomes H2 (required) */
  subheader: string;
  /** Optional array of tags */
  tags?: string[];
  /** Slug generated from filename */
  slug: string;
  /** Relative path under repo root to source markdown file (Option B) */
  sourcePath?: string;
  /** Raw markdown content (legacy: embedded in newsroom-data.json) */
  content?: string;
  /** HTML rendered from markdown content */
  htmlContent?: string;
  /** Optional summary/excerpt (1-2 lines) */
  summary?: string;
}

// Keep PressRelease as an alias for backward compatibility during migration
export type PressRelease = NewsroomArticle;
