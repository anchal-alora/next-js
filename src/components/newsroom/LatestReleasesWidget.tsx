import Link from "next/link";
import type { NewsroomArticle } from "@/lib/newsroomTypes";

interface LatestReleasesWidgetProps {
  currentSlug: string;
  articles: NewsroomArticle[];
  limit?: number;
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-US", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function LatestReleasesWidget({ currentSlug, articles, limit = 5 }: LatestReleasesWidgetProps) {
  const filtered = articles.filter((article) => article.slug !== currentSlug).slice(0, limit);

  if (filtered.length === 0) return null;

  return (
    <div className="card-elevated p-6">
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">
        Latest Articles
      </h3>
      <div className="space-y-0">
        {filtered.map((article, index) => (
          <div key={article.slug}>
            <Link href={`/newsroom/${article.slug}`} className="block group pb-4">
              <div className="space-y-1">
                <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-3">
                  {article.title}
                </h4>
                <p className="text-xs text-muted-foreground">{formatDate(article.date)}</p>
              </div>
            </Link>
            {index < filtered.length - 1 && <div className="border-b border-border/30 mb-4" />}
          </div>
        ))}
      </div>
    </div>
  );
}
