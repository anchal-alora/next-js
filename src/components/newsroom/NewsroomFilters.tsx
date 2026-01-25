"use client";

import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getIndustryConfig, getIndustryShortLabel } from "@/lib/industryConfig";
import type { NewsroomArticle } from "@/lib/newsroomTypes";
import { useQueryParams } from "@/hooks/useQueryParams";

interface NewsroomFiltersProps {
  articles: NewsroomArticle[];
}

export function NewsroomFilters({ articles }: NewsroomFiltersProps) {
  const { searchParams, setSearchParams } = useQueryParams();

  const industries = Array.from(
    new Set(
      articles
        .map((article) => article.industry)
        .filter(Boolean)
        .map((industry) => getIndustryShortLabel(industry))
    )
  ).sort();

  const selectedIndustries = searchParams.getAll("industry");
  const hasAnyFilters = selectedIndustries.length > 0;

  const handleFilterToggle = (industry: string) => {
    const newParams = new URLSearchParams(searchParams);
    const currentValues = newParams.getAll("industry");
    const isSelected = currentValues.includes(industry);

    if (isSelected) {
      const filtered = currentValues.filter((v) => v !== industry);
      newParams.delete("industry");
      filtered.forEach((v) => newParams.append("industry", v));
    } else {
      newParams.append("industry", industry);
    }

    newParams.delete("page");
    setSearchParams(newParams);
  };

  const handleClearIndustry = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("industry");
    newParams.delete("page");
    setSearchParams(newParams);
  };

  const handleClearAll = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("industry");
    newParams.delete("search");
    newParams.delete("sort");
    newParams.delete("page");
    setSearchParams(newParams);
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6 mb-8">
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Filter className="w-4 h-4 text-primary" />
              Industry
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={!hasAnyFilters}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Clear all
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleClearIndustry}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border flex items-center gap-2",
                selectedIndustries.length === 0
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
              )}
            >
              All Industries
            </button>
            {industries.map((industry) => {
              const normalizedSelected = selectedIndustries.map((ind) => getIndustryShortLabel(ind));
              const isSelected = normalizedSelected.includes(industry);
              const config = getIndustryConfig(industry);
              const IndustryIcon = config.icon;
              return (
                <button
                  key={industry}
                  onClick={() => handleFilterToggle(industry)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border flex items-center gap-2",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-md"
                      : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                  )}
                >
                  <IndustryIcon className="w-4 h-4" />
                  {industry}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
