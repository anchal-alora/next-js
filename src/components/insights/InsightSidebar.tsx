import type { RefObject } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, FileText, Download } from "lucide-react";
import type { Report } from "@/lib/reportUtils";
import { getContactFormLink } from "@/lib/routes";
import { getIndustryIcon } from "@/lib/industryConfig";
import { OnThisPageToc } from "./OnThisPageToc";

interface InsightSidebarProps {
  report: Report;
  tocRef: RefObject<HTMLElement | null>;
  tocKey: string;
  showCTA?: boolean;
}

export function InsightSidebar({ report, tocRef, tocKey, showCTA = false }: InsightSidebarProps) {
  const contactLink = getContactFormLink("insight-sidebar-discuss");
  const downloadFormLink = report.contentFormat === "downloadable" ? "#download-form" : "#contact-form";
  const industryIcon = report.industry ? getIndustryIcon(report.industry, { className: "w-4 h-4 text-primary" }) : null;

  return (
    <div className="sticky-sidebar">
      <div className="card-elevated p-6 flex flex-col gap-6 sticky-sidebar-panel overflow-hidden">
        {(report.industry || report.type) && (
          <div className="flex items-center justify-between gap-4">
            {report.industry && industryIcon && (
              <div className="flex items-center gap-2 text-sm text-foreground">
                {industryIcon}
                <span className="font-medium">{report.industry}</span>
              </div>
            )}
            {report.type && (
              <div className="flex items-center gap-2 text-sm text-foreground ml-auto text-right">
                <FileText className="w-4 h-4 text-primary" />
                <span className="font-medium">{report.type}</span>
              </div>
            )}
          </div>
        )}

        {showCTA && (
          <>
            <div className="pt-4 border-t border-border">
              <Button
                asChild
                variant="default"
                className="w-full gap-2 group relative overflow-hidden"
              >
                <a href={downloadFormLink} onClick={(e) => {
                  e.preventDefault();
                  const element = document.querySelector(downloadFormLink);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}>
                  <span className="relative z-10 text-white">Download Report [PDF]</span>
                  <Download className="w-4 h-4 relative z-10 text-white group-hover:animate-arrow-bounce" />
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
                </a>
              </Button>
            </div>
            <div className="pt-4 border-t border-border">
              <Button
                asChild
                variant="outline"
                className="w-full gap-2"
              >
                <Link href={contactLink}>
                  <span>Discuss This Insight</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </>
        )}

        <div className="pt-4 border-t border-border flex-1 min-h-0 overflow-y-auto pr-2 toc-scroll">
          <OnThisPageToc containerRef={tocRef} contentKey={tocKey} isSticky={false} />
        </div>
      </div>
    </div>
  );
}
