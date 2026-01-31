"use client";

import { useMemo, useState } from "react";
import { Bookmark, ListFilter, X } from "lucide-react";
import type { Report } from "@/lib/reportUtils";
import { getIndustryShortLabel } from "@/lib/industryConfig";
import { useSavedInsights } from "@/hooks/useSavedInsights";
import { useQueryParams } from "@/hooks/useQueryParams";
import { InsightsKeywordCombobox } from "@/components/insights/InsightsKeywordCombobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExploreFiltersProps {
  reports: Report[];
}

export function ExploreFilters({ reports }: ExploreFiltersProps) {
  const { searchParams, setSearchParams } = useQueryParams();
  const { savedCount } = useSavedInsights();

  const industries = useMemo(() => {
    return Array.from(
      new Set(
        reports
          .map((report) => report.industry)
          .filter(Boolean)
          .map((industry) => getIndustryShortLabel(industry)),
      ),
    ).sort();
  }, [reports]);

  const contentTypes = useMemo(() => {
    return Array.from(new Set(reports.map((r) => r.type).filter(Boolean))).sort();
  }, [reports]);

  const keywordParams = searchParams.getAll("kw").map((k) => k.trim()).filter(Boolean);
  const [keywordDraft, setKeywordDraft] = useState("");

  const selectedIndustries = searchParams.getAll("industry");
  const selectedTypes = searchParams.getAll("type");
  const savedOnly = searchParams.get("saved") === "1";
  const hasAnyFilters =
    keywordParams.length > 0 ||
    selectedIndustries.length > 0 ||
    selectedTypes.length > 0 ||
    savedOnly;

  const handleIndustryChange = (value: string) => {
    const next = new URLSearchParams(searchParams);
    next.delete("industry");
    if (value && value !== "__all__") next.append("industry", value);
    next.delete("page");
    setSearchParams(next);
  };

  const handleTypeChange = (value: string) => {
    const next = new URLSearchParams(searchParams);
    next.delete("type");
    if (value && value !== "__all__") next.append("type", value);
    next.delete("page");
    setSearchParams(next);
  };

  const handleToggleSaved = () => {
    const next = new URLSearchParams(searchParams);
    if (savedOnly) next.delete("saved");
    else next.set("saved", "1");
    next.delete("page");
    setSearchParams(next);
  };

  const handleClearAll = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("q");
    next.delete("kw");
    next.delete("industry");
    next.delete("type");
    next.delete("saved");
    next.delete("page");
    setSearchParams(next);
  };

  const normalizeForCompare = (value: string) =>
    value
      .toLowerCase()
      .replace(/,/g, "")
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();

  const handleAddKeyword = (raw: string) => {
    const nextKeyword = raw.trim();
    if (!nextKeyword) return;

    const normalized = normalizeForCompare(nextKeyword);
    if (!normalized) return;

    const existing = keywordParams.some((k) => normalizeForCompare(k) === normalized);
    if (existing) {
      setKeywordDraft("");
      return;
    }

    const next = new URLSearchParams(searchParams);
    next.append("kw", nextKeyword);
    next.delete("page");
    setSearchParams(next, { replace: true });
    setKeywordDraft("");
  };

  const handleRemoveKeyword = (raw: string) => {
    const normalized = normalizeForCompare(raw);
    const remaining = keywordParams.filter((k) => normalizeForCompare(k) !== normalized);
    const next = new URLSearchParams(searchParams);
    next.delete("kw");
    for (const k of remaining) next.append("kw", k);
    next.delete("page");
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
        <div className="lg:col-span-4">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Search
          </label>
          <InsightsKeywordCombobox
            value={keywordDraft}
            onValueChange={setKeywordDraft}
            onSubmitValue={handleAddKeyword}
            placeholder="Search topics, keywords..."
            inputClassName="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="lg:col-span-3">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Industry
          </label>
          <Select
            value={selectedIndustries[0] ?? "__all__"}
            onValueChange={(value) => handleIndustryChange(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select industry..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Industries</SelectItem>
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="lg:col-span-3">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Content Type
          </label>
          <Select value={selectedTypes[0] ?? "__all__"} onValueChange={(value) => handleTypeChange(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Types</SelectItem>
              {contentTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="lg:col-span-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleToggleSaved}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary py-3"
          >
            <Bookmark className="h-4 w-4" aria-hidden="true" />
            Saved{savedCount > 0 ? ` (${savedCount})` : ""}
          </button>

          <button
            type="button"
            onClick={handleClearAll}
            disabled={!hasAnyFilters}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary py-3 disabled:opacity-40 disabled:hover:text-slate-500"
          >
            <ListFilter className="h-5 w-5" aria-hidden="true" />
            Clear Filters
          </button>
        </div>
      </div>

      {(keywordParams.length > 0 || selectedIndustries.length > 0 || selectedTypes.length > 0 || savedOnly) ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {keywordParams.map((kw) => (
            <span
              key={`kw:${kw}`}
              className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium flex items-center gap-2"
            >
              {kw}
              <button
                type="button"
                aria-label={`Remove ${kw}`}
                onClick={() => handleRemoveKeyword(kw)}
                className="text-primary hover:opacity-80"
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          ))}

          {selectedIndustries.map((industry) => (
            <span
              key={`industry:${industry}`}
              className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium flex items-center gap-2"
            >
              {industry}
              <button
                type="button"
                aria-label={`Remove ${industry}`}
                onClick={() => handleIndustryChange("__all__")}
                className="text-primary hover:opacity-80"
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          ))}

          {selectedTypes.map((t) => (
            <span
              key={`type:${t}`}
              className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium flex items-center gap-2"
            >
              {t}
              <button
                type="button"
                aria-label={`Remove ${t}`}
                onClick={() => handleTypeChange("__all__")}
                className="text-primary hover:opacity-80"
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          ))}

          {savedOnly ? (
            <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium flex items-center gap-2">
              Saved
              <button
                type="button"
                aria-label="Remove saved filter"
                onClick={handleToggleSaved}
                className="text-primary hover:opacity-80"
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
