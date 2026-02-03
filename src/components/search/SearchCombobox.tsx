"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MutableRefObject, ReactNode, Ref } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import type { SearchMode, SearchResponse, SearchResult, SearchScope } from "@/lib/search/types";
import { LIVE_SEARCH_DEBOUNCE_MS, LIVE_SEARCH_MIN_CHARS } from "@/lib/search/constants";
import { getSearchSuggestions } from "@/lib/search/suggestions";

type SearchComboboxProps = {
  scope: SearchScope;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  limit?: number;
  minChars?: number;
  debounceMs?: number;
  showDropdown?: boolean;
  portalDropdown?: boolean;
  dropdownInsetPx?: number;
  inputBorderClassName?: string;
  metaVariant?: "type" | "insights" | "newsroom";
  inputClassName?: string;
  inputWrapperClassName?: string;
  containerClassName?: string;
  dropdownClassName?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  inputRef?: Ref<HTMLInputElement>;
  onSubmit?: (query: string) => void;
  onResultSelect?: (result: SearchResult) => void;
  onResults?: (payload: {
    scope: SearchScope;
    query: string;
    mode: SearchMode;
    results: SearchResult[];
    isLoading: boolean;
  }) => void;
};

function inferMode(query: string, minChars: number): SearchMode {
  const trimmed = query.trim();
  if (!trimmed) return "suggest";
  return trimmed.length < minChars ? "prefix" : "full";
}

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (value: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(value);
      else (ref as MutableRefObject<T | null>).current = value;
    }
  };
}

function formatTypeLabel(result: SearchResult): string {
  switch (result.type) {
    case "page":
      return "Page";
    case "service":
      return "Service";
    case "industry":
      return "Industry";
    case "contentType":
      return "Content Type";
    case "insight":
      return "Insight";
    case "newsroom":
      return "Newsroom";
    default:
      return result.type;
  }
}

export function SearchCombobox({
  scope,
  value,
  onValueChange,
  placeholder,
  limit = 8,
  minChars = LIVE_SEARCH_MIN_CHARS,
  debounceMs = LIVE_SEARCH_DEBOUNCE_MS,
  showDropdown = true,
  portalDropdown = false,
  dropdownInsetPx = 0,
  inputBorderClassName,
  metaVariant = "type",
  inputClassName,
  inputWrapperClassName,
  containerClassName,
  dropdownClassName,
  leading,
  trailing,
  inputRef,
  onSubmit,
  onResultSelect,
  onResults,
}: SearchComboboxProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const internalInputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [mode, setMode] = useState<SearchMode>(() => inferMode(value, minChars));
  const cacheRef = useRef(new Map<string, SearchResult[]>());
  const [portalStyle, setPortalStyle] = useState<CSSProperties | null>(null);

  const query = value.trim();
  const cacheKey = useMemo(() => `${scope}|${mode}|${query}`, [scope, mode, query]);

  useEffect(() => {
    setMode(inferMode(value, minChars));
  }, [value, minChars]);

  useEffect(() => {
    if (!isOpen && !onResults) return;

    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      setResults(cached);
      setIsLoading(false);
      onResults?.({ scope, query, mode, results: cached, isLoading: false });
      return;
    }

    const controller = new AbortController();
    const handle = window.setTimeout(async () => {
      setIsLoading(true);
      onResults?.({ scope, query, mode, results: [], isLoading: true });
      try {
        const url = `/api/search?scope=${encodeURIComponent(scope)}&q=${encodeURIComponent(query)}&mode=${encodeURIComponent(
          mode,
        )}&limit=${encodeURIComponent(String(limit))}`;
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`Search failed: ${response.status}`);
        const data = (await response.json()) as SearchResponse;
        cacheRef.current.set(cacheKey, data.results);
        setResults(data.results);
        onResults?.({ scope, query, mode: data.mode, results: data.results, isLoading: false });
      } catch (error) {
        if ((error as { name?: string }).name === "AbortError") return;
        setResults([]);
        onResults?.({ scope, query, mode, results: [], isLoading: false });
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => {
      window.clearTimeout(handle);
      controller.abort();
    };
  }, [cacheKey, debounceMs, isOpen, limit, mode, onResults, query, scope]);

  useEffect(() => {
    if (!isOpen) return;
    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (rootRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onScroll = (event: Event) => {
      const target = event.target as Node | null;
      if (target && dropdownRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const form = rootRef.current?.closest("form");
    if (!form) return;

    const onSubmit = () => setIsOpen(false);
    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, [isOpen]);

  useEffect(() => {
    if (!portalDropdown || !isOpen) {
      setPortalStyle(null);
      return;
    }

    const update = () => {
      const inputRect = internalInputRef.current?.getBoundingClientRect();
      const rootRect = rootRef.current?.getBoundingClientRect();
      const inset = Math.max(0, dropdownInsetPx);
      if (!rootRect) return;
      const left = rootRect.left + inset;
      const top = (inputRect?.bottom ?? rootRect.bottom) + 8;
      const width = Math.max(0, rootRect.width - inset * 2);
      setPortalStyle({
        position: "fixed",
        left,
        top,
        width,
        zIndex: 60,
      });
    };

    update();
    window.addEventListener("resize", update);
    // Capture scroll events from any scroll container.
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [dropdownInsetPx, isOpen, portalDropdown]);

  const fallbackSuggestions = useMemo(() => getSearchSuggestions(scope).slice(0, limit), [limit, scope]);
  // Avoid showing placeholder content for the initial suggest state; wait for the API response.
  const showFallbackSuggestions = mode === "prefix" && results.length === 0;

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit?.(trimmed);
  };

  const handleSelect = (result: SearchResult) => {
    if (onResultSelect) {
      onResultSelect(result);
      setIsOpen(false);
      return;
    }

    if (typeof window !== "undefined") {
      const url = new URL(result.href, window.location.origin);
      if (url.pathname === window.location.pathname && url.hash) {
        const id = url.hash.slice(1);
        const element = id ? document.getElementById(id) : null;
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
          window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
          setIsOpen(false);
          return;
        }
      }
    }

    router.push(result.href);
    setIsOpen(false);
  };

  const rightMeta = (result: SearchResult) => {
    if (metaVariant === "insights") {
      if (result.type === "insight") {
        return (
          <div className="flex-shrink-0 text-right leading-tight min-w-[128px]">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 whitespace-nowrap">
              {result.industry ?? "—"}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 whitespace-nowrap">
              {result.contentType ?? "—"}
            </div>
          </div>
        );
      }
      return (
        <span className="text-[10px] uppercase tracking-wider text-slate-400 pt-0.5">
          {formatTypeLabel(result)}
        </span>
      );
    }

    if (metaVariant === "newsroom") {
      return (
        <span className="text-[10px] uppercase tracking-wider text-slate-400 pt-0.5">
          {result.industry ?? "Newsroom"}
        </span>
      );
    }

    return (
      <span className="text-[10px] uppercase tracking-wider text-slate-400 pt-0.5">
        {formatTypeLabel(result)}
      </span>
    );
  };

  const dropdown = (
    <div
      ref={dropdownRef}
      className={
        dropdownClassName ??
        "rounded-2xl border border-slate-200 bg-white shadow-elegant-sm overflow-hidden"
      }
      role="listbox"
      style={portalStyle ?? undefined}
    >
      {isLoading ? (
        <div className="px-4 py-3 text-sm text-slate-500">Searching…</div>
      ) : null}

      {!isLoading && results.length > 0 ? (
        <ul className="py-2">
          {results.map((result) => (
            <li key={result.id}>
              <button
                type="button"
                className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-start justify-between gap-4"
                onClick={() => handleSelect(result)}
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">{result.title}</div>
                  {result.snippet ? (
                    <div className="text-xs text-slate-500 mt-1 line-clamp-2">{result.snippet}</div>
                  ) : null}
                </div>
                {rightMeta(result)}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {!isLoading && results.length === 0 && mode !== "suggest" ? (
        <div className="px-4 py-3 text-sm text-slate-500">
          {mode === "prefix" ? `Keep typing (${minChars}+ characters) for full results.` : "No results found."}
        </div>
      ) : null}

      {!isLoading && showFallbackSuggestions ? (
        <div className="border-t border-slate-100">
          <div className="px-4 pt-3 pb-2 text-[10px] uppercase tracking-wider text-slate-400">
            Suggestions
          </div>
          <ul className="pb-2">
            {fallbackSuggestions.map((suggestion) => (
              <li key={suggestion.id}>
                <Link
                  href={suggestion.href}
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={(event) => {
                    // Allow new-tab / copy-link / etc.
                    if (
                      event.defaultPrevented ||
                      event.button !== 0 ||
                      event.metaKey ||
                      event.ctrlKey ||
                      event.shiftKey ||
                      event.altKey
                    ) {
                      setIsOpen(false);
                      return;
                    }

                    const url = new URL(suggestion.href, window.location.origin);
                    if (url.pathname === window.location.pathname && url.hash) {
                      const id = url.hash.slice(1);
                      const element = id ? document.getElementById(id) : null;
                      if (element) {
                        event.preventDefault();
                        element.scrollIntoView({ behavior: "smooth", block: "start" });
                        window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
                      }
                    }

                    setIsOpen(false);
                  }}
                >
                  {suggestion.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );

  return (
    <div ref={rootRef} className={containerClassName ?? "relative w-full"}>
      <div className={inputBorderClassName}>
        <div className={inputWrapperClassName}>
          {leading}
          <input
            ref={mergeRefs(internalInputRef, inputRef)}
            className={inputClassName}
            value={value}
            placeholder={placeholder}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => onValueChange(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setIsOpen(false);
                return;
              }
              if (event.key !== "Enter") return;
              if (onSubmit) {
                event.preventDefault();
                handleSubmit();
              }
              setIsOpen(false);
            }}
          />
          {trailing}
        </div>
      </div>

      {isOpen && showDropdown ? (
        portalDropdown ? (
          portalStyle ? (
            createPortal(dropdown, document.body)
          ) : null
        ) : (
          <div
            className="absolute z-50 mt-2"
            style={{
              left: dropdownInsetPx ? `${dropdownInsetPx}px` : undefined,
              right: dropdownInsetPx ? `${dropdownInsetPx}px` : undefined,
              width: dropdownInsetPx ? undefined : "100%",
            }}
          >
            {dropdown}
          </div>
        )
      ) : null}
    </div>
  );
}
