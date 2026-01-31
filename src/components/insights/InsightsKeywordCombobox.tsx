"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import type { SearchResponse, SearchResult, SearchMode } from "@/lib/search/types";

type InsightsKeywordComboboxProps = {
  value: string;
  onValueChange: (value: string) => void;
  onSubmitValue?: (value: string) => void;
  placeholder?: string;
  limit?: number;
  debounceMs?: number;
  inputClassName?: string;
};

type KeywordResponse = { query: string; suggestions: string[] };

function inferSearchMode(query: string): SearchMode {
  const trimmed = query.trim();
  if (!trimmed) return "suggest";
  return trimmed.length < 3 ? "prefix" : "full";
}

export function InsightsKeywordCombobox({
  value,
  onValueChange,
  onSubmitValue,
  placeholder,
  limit = 10,
  debounceMs = 200,
  inputClassName,
}: InsightsKeywordComboboxProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [insights, setInsights] = useState<SearchResult[]>([]);
  const keywordCacheRef = useRef(new Map<string, string[]>());
  const insightCacheRef = useRef(new Map<string, SearchResult[]>());

  const query = value.trim();
  const keywordCacheKey = useMemo(() => `${query}|${limit}`, [limit, query]);
  const insightMode = useMemo(() => inferSearchMode(query), [query]);
  const insightCacheKey = useMemo(() => `${insightMode}|${query}|${Math.min(limit, 8)}`, [insightMode, limit, query]);

  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();

    const wantsInsights = Boolean(query);
    const cachedKeywords = keywordCacheRef.current.get(keywordCacheKey);
    const cachedInsights = wantsInsights ? insightCacheRef.current.get(insightCacheKey) : [];

    if (cachedKeywords && (!wantsInsights || cachedInsights)) {
      setSuggestions(cachedKeywords);
      setInsights(cachedInsights ?? []);
      setIsLoading(false);
      return;
    }

    const handle = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const keywordUrl = `/api/insights/keywords?q=${encodeURIComponent(query)}&limit=${encodeURIComponent(String(limit))}`;
        const insightUrl = wantsInsights
          ? `/api/search?scope=insights&q=${encodeURIComponent(query)}&mode=${encodeURIComponent(insightMode)}&limit=${encodeURIComponent(String(Math.min(limit, 8)))}`
          : null;

        const [keywordResponse, insightResponse] = await Promise.all([
          fetch(keywordUrl, { signal: controller.signal }),
          insightUrl ? fetch(insightUrl, { signal: controller.signal }) : Promise.resolve(null),
        ]);

        if (!keywordResponse.ok) throw new Error(`Keywords failed: ${keywordResponse.status}`);
        const keywordData = (await keywordResponse.json()) as KeywordResponse;
        keywordCacheRef.current.set(keywordCacheKey, keywordData.suggestions);
        setSuggestions(keywordData.suggestions);

        if (insightResponse) {
          if (!insightResponse.ok) throw new Error(`Insights search failed: ${insightResponse.status}`);
          const insightData = (await insightResponse.json()) as SearchResponse;
          const insightResults = (insightData.results ?? []).filter((result) => result.type === "insight");
          insightCacheRef.current.set(insightCacheKey, insightResults);
          setInsights(insightResults);
        } else {
          setInsights([]);
        }
      } catch (error) {
        if ((error as { name?: string }).name === "AbortError") return;
        setSuggestions([]);
        setInsights([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => {
      window.clearTimeout(handle);
      controller.abort();
    };
  }, [debounceMs, insightCacheKey, insightMode, isOpen, keywordCacheKey, limit, query]);

  useEffect(() => {
    if (!isOpen) return;
    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (rootRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" aria-hidden="true" />
      <input
        className={
          inputClassName ??
          "w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent"
        }
        placeholder={placeholder}
        type="text"
        value={value}
        onFocus={() => setIsOpen(true)}
        onChange={(e) => onValueChange(e.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && onSubmitValue) {
            event.preventDefault();
            const next = value.trim();
            if (next) onSubmitValue(next);
            setIsOpen(false);
            return;
          }
          if (event.key === "Escape") setIsOpen(false);
        }}
      />

      {isOpen ? (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-elegant-sm overflow-hidden">
          {isLoading ? <div className="px-4 py-3 text-sm text-slate-500">Loading…</div> : null}
          {!isLoading && suggestions.length === 0 ? (
            query ? null : <div className="px-4 py-3 text-sm text-slate-500">Popular keywords</div>
          ) : null}
          {!isLoading && insights.length > 0 ? (
            <>
              <div className="px-4 pt-3 pb-2 text-[10px] uppercase tracking-wider text-slate-400">Insights</div>
              <ul className="pb-2">
                {insights.map((result) => (
                  <li key={result.id}>
                    <button
                      type="button"
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => {
                        router.push(result.href);
                        setIsOpen(false);
                      }}
                    >
                      {result.title}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          {!isLoading && suggestions.length > 0 ? (
            <>
              {insights.length > 0 ? (
                <div className="border-t border-slate-100" />
              ) : null}
              <div className="px-4 pt-3 pb-2 text-[10px] uppercase tracking-wider text-slate-400">Keywords</div>
              <ul className="pb-2">
                {suggestions.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => {
                        if (onSubmitValue) {
                          onSubmitValue(s);
                        } else {
                          onValueChange(s);
                        }
                        setIsOpen(false);
                      }}
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
