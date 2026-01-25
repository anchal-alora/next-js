/**
 * Rehype plugin to auto-link email addresses and phone numbers
 */
import { visit } from "unist-util-visit";
import type { Root, Text, Element } from "hast";

// Email regex pattern
const EMAIL_REGEX = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;

// Phone regex pattern - matches international format with +, spaces, dashes, parentheses
// More restrictive to avoid false positives like "855 (2026" or years
// Pattern 1: International format starting with + (e.g., +353 87 457 1343, +1 234 567 8900)
// Pattern 2: US/standard format like (555) 123-4567 or 555-123-4567
// Excludes: numbers followed by years in parentheses, short numbers (< 7 digits)
const PHONE_REGEX = /(\+\d{1,4}[\s-]?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,9}(?:[\s-]?\d{1,9})*(?![\s(]*\d{4}\))|\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}(?![\s(]*\d{4}\)))/g;

interface TextNode extends Text {
  type: "text";
  value: string;
}

interface ElementNode extends Element {
  type: "element";
  tagName: string;
  children: Array<TextNode | ElementNode>;
}

function createLinkNode(href: string, text: string): ElementNode {
  return {
    type: "element",
    tagName: "a",
    properties: {
      href,
      className: ["text-primary", "hover:underline"],
    },
    children: [
      {
        type: "text",
        value: text,
      },
    ],
  };
}

function linkifyText(text: string): Array<TextNode | ElementNode> {
  const nodes: Array<TextNode | ElementNode> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // First, find all email matches
  const emailMatches: Array<{ index: number; length: number; text: string }> = [];
  while ((match = EMAIL_REGEX.exec(text)) !== null) {
    emailMatches.push({
      index: match.index,
      length: match[0].length,
      text: match[0],
    });
  }

  // Then, find all phone matches (excluding those that are part of emails)
  const phoneMatches: Array<{ index: number; length: number; text: string }> = [];
  EMAIL_REGEX.lastIndex = 0; // Reset regex
  while ((match = PHONE_REGEX.exec(text)) !== null) {
    // Capture current match values to avoid TypeScript null issues in callback
    const currentMatchIndex = match.index;
    const currentMatchText = match[0];
    const currentMatchLength = currentMatchText.length;
    
    // Check if this phone match overlaps with any email match
    const overlapsEmail = emailMatches.some(
      (emailMatch) =>
        currentMatchIndex < emailMatch.index + emailMatch.length &&
        currentMatchIndex + currentMatchLength > emailMatch.index
    );
    if (!overlapsEmail) {
      // Additional validation: exclude false positives
      const matchText = currentMatchText;
      const afterMatch = text.substring(currentMatchIndex + currentMatchLength, currentMatchIndex + currentMatchLength + 20);
      
      // Exclude if followed by a year pattern (e.g., "855 (2026")
      if (/^\s*\(\d{4}/.test(afterMatch)) {
        continue;
      }
      
      // Exclude if it's a short number (< 7 digits) and doesn't start with +
      const digitCount = matchText.replace(/\D/g, '').length;
      if (!matchText.startsWith('+') && digitCount < 7) {
        continue;
      }
      
      // Exclude if it looks like a code/standard (e.g., "NFPA 855", "ISO 9001")
      const beforeMatch = text.substring(Math.max(0, currentMatchIndex - 10), currentMatchIndex);
      if (/[A-Z]{2,}\s+\d+$/.test(beforeMatch.trim())) {
        continue;
      }
      
      phoneMatches.push({
        index: currentMatchIndex,
        length: currentMatchLength,
        text: currentMatchText,
      });
    }
  }

  // Combine and sort all matches
  const allMatches = [
    ...emailMatches.map((m) => ({ ...m, type: "email" as const })),
    ...phoneMatches.map((m) => ({ ...m, type: "phone" as const })),
  ].sort((a, b) => a.index - b.index);

  // Build nodes
  for (const match of allMatches) {
    // Add text before match
    if (match.index > lastIndex) {
      nodes.push({
        type: "text",
        value: text.substring(lastIndex, match.index),
      });
    }

    // Add link node
    if (match.type === "email") {
      nodes.push(createLinkNode(`mailto:${match.text}`, match.text));
    } else {
      // Phone number - clean it for tel: link (remove spaces, dashes, parentheses, but keep +)
      // The + sign is NOT in the character class [\\s-()], so it will be preserved
      const cleanPhone = match.text.replace(/[\s-()]/g, "");
      nodes.push(createLinkNode(`tel:${cleanPhone}`, match.text));
    }

    lastIndex = match.index + match.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    nodes.push({
      type: "text",
      value: text.substring(lastIndex),
    });
  }

  return nodes.length > 0 ? nodes : [{ type: "text", value: text }];
}

export function rehypeAutolink() {
  return (tree: Root) => {
    const nodesToProcess: Array<{ node: TextNode; parent: ElementNode; index: number }> = [];

    // First pass: collect all text nodes that need processing
    visit(tree, "text", (node, index, parent) => {
      if (!parent || typeof index !== "number") return;
      
      const elementParent = parent as ElementNode;
      
      // Skip if parent is already a link
      if (elementParent.tagName === "a") return;

      // Skip if parent is code or pre (don't linkify code)
      if (elementParent.tagName === "code" || elementParent.tagName === "pre") return;

      const textNode = node as TextNode;
      const text = textNode.value;
      const hasEmail = EMAIL_REGEX.test(text);
      const hasPhone = PHONE_REGEX.test(text);

      if (hasEmail || hasPhone) {
        nodesToProcess.push({
          node: textNode,
          parent: elementParent,
          index,
        });
      }
    });

    // Second pass: process nodes in reverse order to maintain correct indices
    for (let i = nodesToProcess.length - 1; i >= 0; i--) {
      const { node, parent, index } = nodesToProcess[i];
      
      EMAIL_REGEX.lastIndex = 0; // Reset regex
      PHONE_REGEX.lastIndex = 0; // Reset regex

      const newNodes = linkifyText(node.value);
      if (newNodes.length > 1 || (newNodes.length === 1 && newNodes[0].type === "element")) {
        // Replace the text node with the new nodes
        parent.children.splice(index, 1, ...newNodes);
      }
    }
  };
}
