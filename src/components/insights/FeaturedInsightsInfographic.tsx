"use client";

import { useMemo, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Download, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getIndustryConfig } from "@/lib/industryConfig";
import type { Report } from "@/lib/reportUtils";
import { OptimizedPicture } from "@/components/shared/OptimizedPicture";
import { formatIstDateLong } from "@/lib/istDate";

interface FeaturedInsightsInfographicProps extends HTMLAttributes<HTMLDivElement> {
  report: Report;
}

// Infographic background image for each report
const getInfographicElements = (imagePath: string) => {
  return (
    <div className="absolute inset-0 z-0">
      {imagePath && (
        <OptimizedPicture
          imageKey={imagePath}
          alt=""
          fill
          wrapperClassName="absolute inset-0"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 1024px) 100vw, 50vw"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/30" />
    </div>
  );
};

export function FeaturedInsightsInfographic({ 
  report, 
  className, 
  ...props 
}: FeaturedInsightsInfographicProps) {
  const config = getIndustryConfig(report.industry || "Technology and AI");
  const IndustryIcon = config.icon;

  const infographicElements = useMemo(
    () => getInfographicElements(report.image ?? ""),
    [report.image]
  );

  const href = `/insights/${report.slug}`;
  const ctaText = report.contentFormat === "downloadable" ? "Download Now" : "View Report";
  const dateToShow = formatIstDateLong(report.date);

  return (
    <div
      {...props}
      className={cn(
        "relative h-[460px] rounded-2xl border border-border/50 overflow-hidden group flex flex-col",
        className
      )}
    >
      {/* Infographic background */}
      {infographicElements}
      
      {/* Content wrapper - flex column to manage layout */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header - Always Visible */}
        <div className="p-7 pb-0 flex items-start justify-between gap-3 shrink-0">
          <div>
            <span className="text-[14px] leading-tight font-bold text-white/90 uppercase tracking-wider block mb-1.5">
              {report.type}
            </span>
            {dateToShow && <p className="text-[14px] leading-tight text-gray-300">{dateToShow}</p>}
          </div>
          {report.industry && (
            <div className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white"
            )}>
              <IndustryIcon className="w-4 h-4 text-white" />
              <span className="text-[14px] leading-tight font-medium">
                {report.industry}
              </span>
            </div>
          )}
        </div>
        
        {/* Spacer to push content to bottom */}
        <div className="flex-grow min-h-0" />

        {/* Content Section - Fixed at bottom */}
        <div className="p-7 pt-5 flex flex-col shrink-0">
          {/* Title - Shifts up on hover, with truncation */}
          <Link href={href} className="block">
            <h3 className="text-2xl font-bold text-white mb-2 leading-tight line-clamp-2 group-hover:-translate-y-1 transition-transform duration-300">
              {report.title}
            </h3>
          </Link>
          
          {/* Description - Reveals on hover, with truncation */}
          <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-in-out mb-3">
            <div className="overflow-hidden">
              <p className="text-base text-gray-300 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 line-clamp-6">
                {report.description}
              </p>
            </div>
          </div>
          
          {/* Action - Always Visible, Fixed at bottom */}
          <div className="pt-3 border-t border-white/10">
            <Button
              asChild
              variant="secondary"
              size="default"
              className="w-full gap-2 bg-white/10 hover:bg-white text-white hover:text-black border-none backdrop-blur-sm transition-all duration-300"
            >
              <Link href={href}>
                {ctaText}
                {report.contentFormat === "downloadable" ? (
                  <Download className="w-5 h-5" />
                ) : (
                  <ArrowUpRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                )}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
