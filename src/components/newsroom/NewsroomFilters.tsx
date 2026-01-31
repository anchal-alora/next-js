"use client";

import { Search, ListFilter, X } from "lucide-react";
import { useQueryParams } from "@/hooks/useQueryParams";
import { useMemo, useState } from "react";
import type { NewsroomArticle } from "@/lib/newsroomTypes";
import { SearchCombobox } from "@/components/search/SearchCombobox";
import { getIndustryShortLabel } from "@/lib/industryConfig";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NewsroomFiltersProps {
  articles: NewsroomArticle[];
}

export function NewsroomFilters({ articles }: NewsroomFiltersProps) {
  const { searchParams, setSearchParams } = useQueryParams();

  const industries = useMemo(() => {
    return Array.from(
      new Set(
        articles
          .map((article) => article.industry)
          .filter(Boolean)
          .map((industry) => getIndustryShortLabel(industry)),
      ),
    )
      .filter(Boolean)
      .sort();
  }, [articles]);

  const keywordParams = searchParams.getAll("kw").map((k) => k.trim()).filter(Boolean);
  const legacySearch = (searchParams.get("search") ?? "").trim();
  const effectiveKeywords = keywordParams.length > 0 ? keywordParams : legacySearch ? [legacySearch] : [];

  const [searchValue, setSearchValue] = useState("");
  const selectedIndustries = searchParams.getAll("industry");

  const hasAnyFilters = Boolean(searchParams.get("industry")) || effectiveKeywords.length > 0;

  const handleIndustryChange = (value: string) => {
    const next = new URLSearchParams(searchParams);
    next.delete("industry");
    if (value && value !== "__all__") next.set("industry", value);
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
    const keyword = raw.trim();
    if (!keyword) return;
    const normalized = normalizeForCompare(keyword);
    if (!normalized) return;

    const existing = effectiveKeywords.some((k) => normalizeForCompare(k) === normalized);
    if (existing) {
      setSearchValue("");
      return;
    }

    const next = new URLSearchParams(searchParams);
    next.delete("search"); // migrate off legacy
    next.append("kw", keyword);
    next.delete("page");
    setSearchParams(next, { replace: true });
    setSearchValue("");
  };

  const handleRemoveKeyword = (raw: string) => {
    const normalized = normalizeForCompare(raw);
    const remaining = effectiveKeywords.filter((k) => normalizeForCompare(k) !== normalized);
    const next = new URLSearchParams(searchParams);
    next.delete("search");
    next.delete("kw");
    for (const k of remaining) next.append("kw", k);
    next.delete("page");
    setSearchParams(next, { replace: true });
  };

  const handleClearAll = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("industry");
    newParams.delete("search");
    newParams.delete("kw");
    newParams.delete("sort");
    newParams.delete("page");
    setSearchParams(newParams);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
	        <div className="lg:col-span-7">
	          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
	            Search
	          </label>
	          <SearchCombobox
	            scope="newsroom"
	            value={searchValue}
	            onValueChange={setSearchValue}
	            placeholder="Search releases..."
	            metaVariant="newsroom"
	            containerClassName="relative"
	            inputWrapperClassName="relative"
	            onSubmit={handleAddKeyword}
	            leading={
	              <Search
	                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5"
	                aria-hidden="true"
              />
            }
            inputClassName="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus:outline-none focus:ring-0 focus:border-slate-200 dark:focus:border-slate-700"
          />
        </div>

        <div className="lg:col-span-3">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Industry
          </label>
          <Select value={selectedIndustries[0] ?? "__all__"} onValueChange={handleIndustryChange}>
            <SelectTrigger className="h-12">
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

        <div className="lg:col-span-2 flex justify-end">
          <button
            type="button"
            disabled={!hasAnyFilters}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary py-3 disabled:opacity-40 disabled:hover:text-slate-500"
            onClick={handleClearAll}
          >
            <ListFilter className="h-5 w-5" aria-hidden="true" />
            Clear Filters
          </button>
	        </div>
	      </div>

      {effectiveKeywords.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {effectiveKeywords.map((kw) => (
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
        </div>
      ) : null}
    </div>
  );
}
