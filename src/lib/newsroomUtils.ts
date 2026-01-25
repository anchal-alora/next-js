import type { NewsroomArticle } from "./newsroomTypes";
import newsroomData from "../../newsroom-data.json";

const allReleases = (newsroomData.releases || []) as NewsroomArticle[];

export async function loadNewsroomArticles(): Promise<NewsroomArticle[]> {
  return [...allReleases].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });
}

export async function loadNewsroomArticleBySlug(slug: string): Promise<NewsroomArticle | null> {
  const entry = allReleases.find((release) => release.slug === slug);
  return entry ?? null;
}

export const loadPressReleases = loadNewsroomArticles;
export const loadPressReleaseBySlug = loadNewsroomArticleBySlug;
