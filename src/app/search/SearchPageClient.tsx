"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useQueryParams } from "@/hooks/useQueryParams";
import { SearchCombobox } from "@/components/search/SearchCombobox";
import type { SearchMode, SearchResult } from "@/lib/search/types";
import { LIVE_SEARCH_MIN_CHARS } from "@/lib/search/constants";

export function SearchPageClient() {
  const { searchParams, setSearchParams } = useQueryParams();
  const queryParam = searchParams.get("q") ?? "";
  const [queryDraft, setQueryDraft] = useState(queryParam);
  const [mode, setMode] = useState<SearchMode>("suggest");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setQueryDraft(queryParam);
  }, [queryParam]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      const q = queryDraft.trim();
      if (q) next.set("q", q);
      else next.delete("q");
      setSearchParams(next, { replace: true });
    }, 250);
    return () => window.clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryDraft]);

  const helperText = useMemo(() => {
    const trimmed = queryDraft.trim();
    if (!trimmed) return "Search across insights, newsroom, pages, and section anchors.";
    if (trimmed.length < LIVE_SEARCH_MIN_CHARS) return `Type ${LIVE_SEARCH_MIN_CHARS}+ characters for full results.`;
    return null;
  }, [queryDraft]);

  return (
    <div className="container-wide py-12">
      <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground">Search</h1>
      <p className="text-muted-foreground mt-2">{helperText}</p>

      <div className="mt-8 max-w-2xl">
        <SearchCombobox
          scope="all"
          value={queryDraft}
          onValueChange={setQueryDraft}
          placeholder="Search the site…"
          showDropdown={false}
          inputWrapperClassName="relative"
          leading={
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" aria-hidden="true" />
          }
          inputClassName="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus:outline-none focus:ring-0 focus:border-slate-200 dark:focus:border-slate-700"
          onResults={({ results, isLoading, mode }) => {
            setResults(results);
            setIsLoading(isLoading);
            setMode(mode);
          }}
        />
      </div>

      <div className="mt-10">
        {isLoading ? <div className="text-sm text-muted-foreground">Searching…</div> : null}

        {!isLoading && results.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            {mode === "suggest" ? "Popular links will appear as you type." : "No results found."}
          </div>
        ) : null}

        {!isLoading && results.length > 0 ? (
          <ul className="grid gap-4">
            {results.map((result) => (
              <li key={result.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                <Link href={result.href} className="block">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-base font-semibold text-foreground">{result.title}</h2>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400">{result.type}</span>
                  </div>
                  {result.snippet ? (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{result.snippet}</p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

