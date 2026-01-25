"use client";

interface MarkdownContentProps {
  html: string;
}

/**
 * MarkdownContent component - renders server-generated HTML for markdown.
 */
export function MarkdownContent({ html }: MarkdownContentProps) {
  if (!html) return null;
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
