import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

type PaginationItem =
  | { type: "page"; page: number }
  | { type: "ellipsis"; key: "left" | "right" };

function buildPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => ({ type: "page", page: index + 1 }));
  }

  const candidates = new Set<number>([
    1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ]);

  const pages = Array.from(candidates)
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  const items: PaginationItem[] = [];
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const prev = pages[i - 1];
    const gap = prev ? page - prev : 0;

    if (gap > 1) {
      items.push({ type: "ellipsis", key: prev === 1 ? "left" : "right" });
    }
    items.push({ type: "page", page });
  }

  return items;
}

function buildHref(basePath: string, params: URLSearchParams) {
  const q = params.toString();
  return q ? `${basePath}?${q}` : basePath;
}

export function PaginationLinks({
  basePath,
  currentPage,
  totalPages,
  searchParams,
  className,
}: {
  basePath: string;
  currentPage: number;
  totalPages: number;
  searchParams: URLSearchParams;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  const items = buildPaginationItems(currentPage, totalPages);

  const hrefForPage = (page: number) => {
    const next = new URLSearchParams(searchParams);
    if (page <= 1) next.delete("page");
    else next.set("page", String(page));
    return buildHref(basePath, next);
  };

  return (
    <nav className={cn("flex items-center justify-center gap-2 pt-10", className)} aria-label="Pagination">
      <Button asChild variant="outline" size="sm" disabled={currentPage <= 1} aria-label="Previous page">
        <Link href={hrefForPage(Math.max(1, currentPage - 1))} scroll={false}>
          <ChevronLeft className="w-4 h-4" />
          Prev
        </Link>
      </Button>

      {items.map((item) => {
        if (item.type === "ellipsis") {
          return (
            <span
              key={`ellipsis-${item.key}`}
              className="inline-flex items-center justify-center h-9 px-2 text-muted-foreground"
              aria-hidden="true"
            >
              <MoreHorizontal className="w-4 h-4" />
            </span>
          );
        }

        const isActive = item.page === currentPage;
        return (
          <Button
            key={item.page}
            asChild
            variant={isActive ? "default" : "outline"}
            size="sm"
            aria-current={isActive ? "page" : undefined}
          >
            <Link href={hrefForPage(item.page)} scroll={false}>
              {item.page}
            </Link>
          </Button>
        );
      })}

      <Button asChild variant="outline" size="sm" disabled={currentPage >= totalPages} aria-label="Next page">
        <Link href={hrefForPage(Math.min(totalPages, currentPage + 1))} scroll={false}>
          Next
          <ChevronRight className="w-4 h-4" />
        </Link>
      </Button>
    </nav>
  );
}

