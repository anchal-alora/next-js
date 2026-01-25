import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getIndustryConfig, getIndustryShortLabel } from "@/lib/industryConfig";
import type { Report } from "@/lib/reportUtils";
import { OptimizedPicture } from "@/components/shared/OptimizedPicture";
import { formatIstDateLong } from "@/lib/istDate";

interface InsightsHeroProps {
  report: Report;
}

export function InsightsHero({ report }: InsightsHeroProps) {
  const industryShort = getIndustryShortLabel(report.industry || "Technology and AI");
  const config = getIndustryConfig(industryShort);
  const IndustryIcon = config.icon;

  // CTA Button Logic
  const getCtaText = () => {
    if (report.placement === "Case Studies") {
      return "Read Full Case Study";
    }
    if (report.contentFormat === "downloadable") {
      return "Download Now";
    }
    return "View Report";
  };

  const ctaText = getCtaText();
  const linkTo = `/insights/${report.slug}`;
  const dateToShow = formatIstDateLong(report.date);

  return (
    <div className="relative">
      {/* Desktop Layout: 60/40 split with overlap */}
      <div className="hidden md:grid md:grid-cols-[60%_40%] gap-0 relative">
        {/* Left Column: Image (60%) */}
        <div className="relative h-[550px] lg:h-[650px] rounded-2xl overflow-hidden">
          {report.image && (
            <OptimizedPicture
              imageKey={report.image}
              alt={report.title}
              fill
              wrapperClassName="w-full h-full"
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 60vw"
              loading="eager"
              fetchPriority="high"
            />
          )}
        </div>

        {/* Right Column: Background (40%) */}
        <div className="bg-secondary/50" />

        {/* White Content Card: Overlaps from right (10-15% overlap) */}
        <Link
          href={linkTo}
          className="absolute right-[5%] top-1/2 -translate-y-1/2 w-[45%] bg-white rounded-2xl shadow-xl p-8 lg:p-10 z-10 group hover:scale-[1.02] transition-all duration-300 cursor-pointer block"
        >
          {/* Top Row */}
          <div className="flex items-start justify-between mb-6">
            {/* Left: Report Type */}
            <span className="text-sm font-semibold uppercase tracking-wider text-foreground">
              {report.type}
            </span>
            {/* Right: Industry Icon and Name */}
            {report.industry && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
                <IndustryIcon className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground text-sm font-medium">{industryShort}</span>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="mb-6">
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-4 leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">
              {report.title}
            </h2>
            <p className="text-muted-foreground leading-relaxed line-clamp-4 mb-4">
              {report.description}
            </p>
            {/* Divider Line */}
            <div className="h-px bg-border" />
          </div>

          {/* Footer Row */}
          <div className="flex items-center justify-between">
            {/* Left: Date */}
            {dateToShow && <span className="text-sm text-muted-foreground">{dateToShow}</span>}
            {/* Right: CTA Button */}
            <div onClick={(e) => e.stopPropagation()}>
              <Button variant="default" size="default" className="hover:text-white">
                <span className="relative z-10 text-white">{ctaText}</span>
              </Button>
            </div>
          </div>
        </Link>
      </div>

      {/* Mobile Layout: Stacked vertically */}
      <div className="md:hidden flex flex-col">
        {/* Image */}
        {report.image && (
          <div className="aspect-video w-full mb-0 rounded-2xl overflow-hidden">
            <OptimizedPicture
              imageKey={report.image}
              alt={report.title}
              fill
              wrapperClassName="w-full h-full"
              className="object-cover"
              sizes="100vw"
              loading="eager"
              fetchPriority="high"
            />
          </div>
        )}

        {/* White Card */}
        <Link
          href={linkTo}
          className="bg-white rounded-2xl shadow-xl p-6 -mt-20 sm:-mt-24 relative z-10 mx-4 block group hover:scale-[1.02] transition-all duration-300 cursor-pointer"
        >
          {/* Top Row */}
          <div className="flex items-start justify-between mb-4">
            {/* Left: Report Type */}
            <span className="text-sm font-semibold uppercase tracking-wider text-foreground">
              {report.type}
            </span>
            {/* Right: Industry Icon and Name */}
            {report.industry && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
                <IndustryIcon className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground text-sm font-medium">{industryShort}</span>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="mb-4">
            <h2 className="font-display text-xl font-bold text-foreground mb-3 leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">
              {report.title}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4 mb-4">
              {report.description}
            </p>
            {/* Divider Line */}
            <div className="h-px bg-border" />
          </div>

          {/* Footer Row */}
          <div className="flex items-center justify-between">
            {/* Left: Date */}
            {dateToShow && <span className="text-sm text-muted-foreground">{dateToShow}</span>}
            {/* Right: CTA Button */}
            <div onClick={(e) => e.stopPropagation()}>
              <Button variant="default" size="sm" className="hover:text-white">
                <span className="relative z-10 text-white">{ctaText}</span>
              </Button>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
