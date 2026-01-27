import fs from "node:fs/promises";
import path from "node:path";
import { cache as reactCache } from "react";
import matter from "gray-matter";
import { renderMarkdownToHtml } from "@/lib/server/markdown";
import type { NewsroomArticle } from "@/lib/newsroomTypes";

// In dev, we want content changes (markdown + generated JSON) to reflect immediately without restarting the server.
// `react.cache()` is great for production but can hide updates during local authoring.
const cache = process.env.NODE_ENV === "production" ? reactCache : (<T extends (...args: any[]) => any>(fn: T) => fn);

type NewsroomIndexEntry = {
  slug: string;
  date: string;
  title: string;
  industry: string;
  subheader: string;
  tags?: string[];
  summary?: string;
  sourcePath?: string;
};

const resolveProjectRoot = cache(async () => {
  const cwd = process.cwd();
  const directNewsroom = path.join(cwd, "newsroom-data.json");

  try {
    await fs.access(directNewsroom);
    return cwd;
  } catch {
    // fall through
  }

  const fallbackRoot = path.join(cwd, "next-js");
  const fallbackNewsroom = path.join(fallbackRoot, "newsroom-data.json");
  try {
    await fs.access(fallbackNewsroom);
    return fallbackRoot;
  } catch {
    return cwd;
  }
});

const resolvePaths = cache(async () => {
  const root = await resolveProjectRoot();
  return {
    newsroomJsonPath: path.join(root, "newsroom-data.json"),
    newsroomRoot: path.join(root, "content", "newsroom"),
  };
});

const loadNewsroomIndex = cache(async () => {
  const { newsroomJsonPath } = await resolvePaths();
  const raw = await fs.readFile(newsroomJsonPath, "utf-8");
  const data = JSON.parse(raw) as { releases: NewsroomIndexEntry[] };
  return data.releases ?? [];
});

export const getAllNewsroomArticles = cache(async () => {
  const releases = await loadNewsroomIndex();
  return releases
    .map((release) => ({
      date: release.date,
      title: release.title,
      industry: release.industry,
      subheader: release.subheader,
      tags: release.tags,
      slug: release.slug,
      summary: release.summary,
      sourcePath: release.sourcePath,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

export const getNewsroomSlugs = cache(async () => {
  const releases = await loadNewsroomIndex();
  return releases.map((release) => release.slug).filter(Boolean);
});

export const getNewsroomArticleBySlug = cache(async (slug: string): Promise<NewsroomArticle | null> => {
  const releases = await loadNewsroomIndex();
  const entry = releases.find((release) => release.slug === slug);
  if (!entry) return null;

  const { newsroomRoot } = await resolvePaths();
  let mdPath: string | null = null;
  if (entry.sourcePath) {
    mdPath = path.join((await resolveProjectRoot()), entry.sourcePath);
  } else {
    mdPath = path.join(newsroomRoot, `${entry.slug}.md`);
  }

  const raw = await fs.readFile(mdPath, "utf-8");
  const parsed = matter(raw);
  const htmlContent = await renderMarkdownToHtml(parsed.content);

  return {
    date: entry.date,
    title: entry.title,
    industry: entry.industry,
    subheader: entry.subheader,
    tags: entry.tags,
    slug: entry.slug,
    summary: entry.summary,
    sourcePath: entry.sourcePath,
    htmlContent,
  };
});
