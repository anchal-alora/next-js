/**
 * Utility to render inline markdown (bold, italic, links) in text fields like descriptions
 */
import React from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { visit } from "unist-util-visit";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import type { Root, Element } from "hast";
import { contentComponents } from "@/components/insights/ContentComponents";
import { rehypeAutolink } from "./rehype-autolink";

/**
 * Renders inline markdown text (supports bold, italic, links, and auto-links emails/phones)
 */
export function renderInlineMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  try {
    // Ensure text is treated as a paragraph for proper markdown parsing
    const wrappedText = text.trim();
    
    const processor = unified()
      .use(remarkParse)
      .use(remarkRehype, {
        allowDangerousHtml: false,
      })
      .use(rehypeAutolink);

    const mdast = processor.parse(wrappedText);
    const hast = processor.runSync(mdast) as Root;

    // Unwrap single paragraph nodes to make it truly inline
    visit(hast, "element", (node: Element) => {
      if (node.tagName === "p" && node.children.length > 0) {
        // If root has only one paragraph child, unwrap it
        if (hast.children.length === 1 && hast.children[0] === node) {
          hast.children = node.children;
        }
      }
    });

    const result = toJsxRuntime(hast, {
      Fragment,
      jsx,
      jsxs,
      components: contentComponents,
    });

    return result;
  } catch (err) {
    console.error("Error parsing inline markdown:", err);
    // Fallback to plain text
    return <>{text}</>;
  }
}
