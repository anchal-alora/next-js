"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, Share2, Printer, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useSavedInsights } from "@/hooks/useSavedInsights";
import { cn } from "@/lib/utils";
import { navigateBackOrFallback } from "@/lib/navigateBack";

interface DetailTopBarProps {
  reportId: string;
  reportTitle?: string;
  fallbackPath?: string;
}

export function DetailTopBar({ reportId, reportTitle, fallbackPath = "/insights" }: DetailTopBarProps) {
  const router = useRouter();
  const { isSaved, toggleSaved } = useSavedInsights();
  const saved = isSaved(reportId);

  const handleBack = () => {
    navigateBackOrFallback(router, fallbackPath);
  };

  const handleSave = () => {
    toggleSaved(reportId);
    if (saved) {
      toast.info("Removed from saved");
    } else {
      toast.success("Saved");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = reportTitle || document.title;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
        return;
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Share failed:", error);
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error("Failed to copy link");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="gap-2 px-0 hover:bg-transparent hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Link
          href="/insights/explore" onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "auto" })}
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          Explore all insights
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
          <Printer className="w-4 h-4" />
          Print
        </Button>
        <Button
          variant={saved ? "default" : "outline"}
          size="sm"
          onClick={handleSave}
          className={cn("gap-2", saved && "bg-primary text-primary-foreground")}
        >
          {saved ? (
            <>
              <BookmarkCheck className="w-4 h-4" />
              Saved
            </>
          ) : (
            <>
              <Bookmark className="w-4 h-4" />
              Save
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
