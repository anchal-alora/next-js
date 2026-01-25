import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getIndustryConfig, getIndustryShortLabel } from "@/lib/industryConfig";
import type { NewsroomArticle } from "@/lib/newsroomTypes";
import { formatIstDateLong } from "@/lib/istDate";

interface NewsroomCardProps {
  article: NewsroomArticle;
}

export function NewsroomCard({ article }: NewsroomCardProps) {
  const industryLabel = getIndustryShortLabel(article.industry);
  const config = getIndustryConfig(industryLabel);
  const IndustryIcon = config.icon;

  const formattedDate = formatIstDateLong(article.date);
  const cardSummary = article.summary || article.subheader;

  return (
    <Link href={`/newsroom/${article.slug}`} className="block h-full group">
      <div className="card-elevated card-hover p-7 flex flex-col min-h-[280px] h-full hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <span className="text-muted-foreground text-sm">{formattedDate}</span>
          {industryLabel && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
              <IndustryIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground text-sm font-medium">{industryLabel}</span>
            </div>
          )}
        </div>
        <h3 className="font-display text-xl font-semibold text-foreground mt-2 mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300">
          {article.title}
        </h3>
        {cardSummary && (
          <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-grow line-clamp-3">
            {cardSummary}
          </p>
        )}
        <div className="flex items-center justify-end mt-auto" onClick={(e) => e.stopPropagation()}>
          <Button variant="outline" size="sm">
            Read More
          </Button>
        </div>
      </div>
    </Link>
  );
}
