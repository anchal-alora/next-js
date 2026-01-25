import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Report } from "@/lib/reportUtils";
import { OptimizedPicture } from "@/components/shared/OptimizedPicture";
import { formatIstDateLong } from "@/lib/istDate";

interface ReportCardProps {
  report: Report;
  ctaVariant?: "default" | "caseStudy";
  className?: string;
}

export function ReportCard({ report, ctaVariant = "default", className = "" }: ReportCardProps) {
  // CTA Logic (Centralized)
  const isCaseStudy = report.placement === "Case Studies";
  const getCtaText = () => {
    if (isCaseStudy) {
      return "Read Full Case Study";
    }
    // Default behavior
    if (report.contentFormat === "downloadable") {
      return "Download Now";
    }
    return "View Report";
  };

  const ctaText = getCtaText();
  const linkTo = `/insights/${report.slug}`;
  const dateToShow = formatIstDateLong(report.date);

  return (
    <div className={className}>
      <Link href={linkTo} className="block h-full group">
        <div className="h-full flex flex-col hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300">
          {report.image && (
            <div className="aspect-video rounded-xl overflow-hidden mb-6">
              <OptimizedPicture
                imageKey={report.image}
                alt={report.title}
                fill
                wrapperClassName="w-full h-full"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
                loading="lazy"
              />
            </div>
          )}
          <div className="flex-1 flex flex-col">
            {report.type && (
              <span className="text-accent text-sm font-semibold uppercase tracking-wider">
                {report.type}
              </span>
            )}
            <h3 className="font-display text-2xl font-semibold text-foreground mt-2 mb-3 group-hover:text-primary transition-colors duration-300 line-clamp-2">
              {report.title}
            </h3>
            {report.description && (
              <p className="text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-4">
                {report.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              {dateToShow && <span>{dateToShow}</span>}
            </div>
            <div className="self-start mt-auto" onClick={(e) => e.stopPropagation()}>
              <Button variant="outline">
                {ctaText}
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
