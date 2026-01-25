"use client";

import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3 | 4;
  element: HTMLElement;
  parentH2Id?: string;
}

interface OnThisPageTocProps {
  containerRef: React.RefObject<HTMLElement | null>;
  contentKey: string;
  className?: string;
  stickyTopOffset?: string;
  isSticky?: boolean;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ensureUniqueId(id: string, existingIds: Set<string>): string {
  let uniqueId = id;
  let counter = 2;
  while (existingIds.has(uniqueId)) {
    uniqueId = `${id}-${counter}`;
    counter++;
  }
  existingIds.add(uniqueId);
  return uniqueId;
}

export function OnThisPageToc({
  containerRef,
  contentKey,
  className,
  stickyTopOffset = "top-24",
  isSticky = true,
}: OnThisPageTocProps) {
  // STATE
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expandedH2Ids, setExpandedH2Ids] = useState<Set<string>>(new Set());

  // REFS (avoid stale closures)
  const headingsRef = useRef<TocItem[]>([]);
  const parentH2MapRef = useRef<Map<string, string>>(new Map());

  // ------------------------------------------------------------
  // EFFECT A: Build TOC + assign IDs (runs when content changes)
  // ------------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      setHeadings([]);
      headingsRef.current = [];
      parentH2MapRef.current = new Map();
      setActiveId(null);
      setExpandedH2Ids(new Set());
      return;
    }

    const headingEls = Array.from(
      container.querySelectorAll<HTMLElement>("h2, h3, h4")
    );

    const existingIds = new Set<string>();
    const items: TocItem[] = [];
    const parentMap = new Map<string, string>();

    let currentH2Id: string | null = null;

    for (const el of headingEls) {
      const level = el.tagName === "H2" ? 2 : el.tagName === "H3" ? 3 : 4;
      const text = (el.textContent || "").trim();
      if (!text) continue;

      // ✅ Preserve existing IDs; generate only if missing
      let id = el.id?.trim();
      if (!id) {
        const base = slugify(text);
        id = ensureUniqueId(base, existingIds);
        el.id = id;
      } else {
        // Keep existing id but still ensure uniqueness for internal tracking
        const unique = ensureUniqueId(id, existingIds);
        if (unique !== id) {
          // If duplicate existing IDs occur, normalize to unique to avoid collisions
          el.id = unique;
          id = unique;
        }
      }

      // Parent mapping: H3/H4 attach to most recent H2
      if (level === 2) currentH2Id = id;
      if (level > 2 && currentH2Id) parentMap.set(id, currentH2Id);

      items.push({
        id,
        text,
        level,
        element: el,
        parentH2Id: level > 2 ? currentH2Id ?? undefined : undefined,
      });
    }

    setHeadings(items);
    headingsRef.current = items;
    parentH2MapRef.current = parentMap;

    // Optional: auto-expand first H2 by default (nice UX)
    const firstH2 = items.find((h) => h.level === 2);
    setExpandedH2Ids(firstH2 ? new Set([firstH2.id]) : new Set());
    // ✅ Remove setActiveId - let IntersectionObserver determine active based on scroll position
    // This prevents incorrect highlight on mid-scroll loads
  }, [contentKey, containerRef]); // ✅ only rebuild when content changes (report.slug)

  // ------------------------------------------------------------
  // EFFECT B: Attach IntersectionObserver (runs when headings ready)
  // ------------------------------------------------------------
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((e) => e.isIntersecting);
        if (intersecting.length === 0) return;

        // ✅ Choose active heading deterministically
        // Prefer smallest top >= 0; if all negative, choose closest to 0
        let best = intersecting[0];
        let bestTop = best.boundingClientRect.top;

        for (const entry of intersecting) {
          const top = entry.boundingClientRect.top;

          const bestIsPositive = bestTop >= 0;
          const topIsPositive = top >= 0;

          if (topIsPositive && (!bestIsPositive || top < bestTop)) {
            best = entry;
            bestTop = top;
          } else if (!topIsPositive && !bestIsPositive && top > bestTop) {
            // both negative: pick closest to 0 (greater top)
            best = entry;
            bestTop = top;
          }
        }

        const id = (best.target as HTMLElement).id;
        if (!id) return;

        setActiveId(id);

        // ✅ Auto-expand ONLY the active H2
        const parentH2Id = parentH2MapRef.current.get(id);
        if (parentH2Id) {
          setExpandedH2Ids(new Set([parentH2Id]));
        } else {
          // Active is likely H2 itself
          const h = headingsRef.current.find((x) => x.id === id);
          if (h?.level === 2) setExpandedH2Ids(new Set([id]));
        }
      },
      {
        root: null,
        rootMargin: "-20% 0px -70% 0px",
        threshold: [0, 1],
      }
    );

    // Observe all heading elements
    for (const h of headings) observer.observe(h.element);

    // ✅ Cleanup prevents duplicated observers across route changes
    return () => observer.disconnect();
  }, [headings, contentKey]); // headings changes after rebuild; contentKey ensures clean swap

  if (headings.length === 0) return null;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const renderHeadings = () => {
    const result: React.ReactElement[] = [];
    let currentH2: TocItem | null = null;

    headings.forEach((heading) => {
      if (heading.level === 2) {
        currentH2 = heading;
        const isExpanded = expandedH2Ids.has(heading.id);
        const hasChildren = headings.some(
          (h) => h.parentH2Id === heading.id
        );

        result.push(
          <div key={heading.id} className="mb-2">
            <a
              href={`#${heading.id}`}
              onClick={(e) => handleClick(e, heading.id)}
              className={cn(
                "block py-1.5 px-3 rounded-md text-sm font-medium transition-colors",
                activeId === heading.id
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
              )}
            >
              {heading.text}
            </a>
          </div>
        );
      } else if (heading.level === 3 && currentH2) {
        const isH2Expanded = expandedH2Ids.has(currentH2.id);
        if (isH2Expanded) {
          result.push(
            <div key={heading.id} className="mb-1.5 ml-4">
              <a
                href={`#${heading.id}`}
                onClick={(e) => handleClick(e, heading.id)}
                className={cn(
                  "block py-1 px-3 rounded-md text-sm transition-colors",
                  activeId === heading.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                )}
              >
                {heading.text}
              </a>
            </div>
          );
        }
      } else if (heading.level === 4 && currentH2) {
        const isH2Expanded = expandedH2Ids.has(currentH2.id);
        if (isH2Expanded) {
          result.push(
            <div key={heading.id} className="mb-1 ml-8">
              <a
                href={`#${heading.id}`}
                onClick={(e) => handleClick(e, heading.id)}
                className={cn(
                  "block py-0.5 px-3 rounded-md text-xs transition-colors",
                  activeId === heading.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground/80 hover:text-primary hover:bg-primary/5"
                )}
              >
                {heading.text}
              </a>
            </div>
          );
        }
      }
    });

    return result;
  };

  return (
    <div
      className={cn(
        isSticky && "sticky",
        isSticky && stickyTopOffset,
        isSticky && "max-h-[calc(100vh-8rem)] overflow-y-auto",
        className
      )}
    >
      <div className="pr-4">
        <h3 className="text-sm font-semibold text-foreground mb-4 px-3">On this page</h3>
        <nav className="space-y-1">{renderHeadings()}</nav>
      </div>
    </div>
  );
}
