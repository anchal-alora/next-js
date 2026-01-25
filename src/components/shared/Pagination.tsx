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

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  const items = buildPaginationItems(currentPage, totalPages);

  return (
    <nav
      className={cn("flex items-center justify-center gap-2 pt-10", className)}
      aria-label="Pagination"
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
        Prev
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
            type="button"
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(item.page)}
            aria-current={isActive ? "page" : undefined}
          >
            {item.page}
          </Button>
        );
      })}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </Button>
    </nav>
  );
}

