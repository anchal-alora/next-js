import React from "react";
import { cn } from "@/lib/utils";

/**
 * Shared component mappings for both MDX and Markdown content.
 * MDX is the primary standard - markdown matches this styling.
 * 
 * These components define how markdown/MDX elements are rendered
 * to ensure consistent styling across both content formats.
 */
export const contentComponents = {
  /**
   * Links: Primary color with hover underline
   */
  a: ({ className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      {...props}
      className={cn("text-primary hover:underline", className)}
    />
  ),
  /**
   * Strong/Bold: Ensure bold text is properly styled
   */
  strong: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong
      {...props}
      className={cn("font-semibold text-foreground", className)}
    />
  ),
  // H1 stays as H1 - no conversion (standardized)
  // Other components can be added here as needed for future enhancements
} as const;

