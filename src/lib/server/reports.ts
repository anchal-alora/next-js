import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import type { Report } from "@/lib/reportUtils";
import type { ReportFaq } from "@/lib/faqTypes";
import { renderMarkdownToHtml } from "@/lib/server/markdown";

export type ReportContent =
  | { kind: "html"; html: string; faqs: ReportFaq[] }
  | { kind: "none" };

const isSafeSlug = (slug: string) => {
  const s = slug.trim();
  if (!s) return false;
  if (s.startsWith("/") || s.includes("\\") || s.includes("\0")) return false;
  if (s.split("/").some((part) => part === "." || part === ".." || part.length === 0)) return false;
  return /^[A-Za-z0-9/_-]+$/.test(s);
};

const resolveProjectRoot = cache(async () => {
  const cwd = process.cwd();
  const directReports = path.join(cwd, "reports-link.json");

  try {
    await fs.access(directReports);
    return cwd;
  } catch {
    // fall through
  }

  const fallbackRoot = path.join(cwd, "next-js");
  const fallbackReports = path.join(fallbackRoot, "reports-link.json");
  try {
    await fs.access(fallbackReports);
    return fallbackRoot;
  } catch {
    return cwd;
  }
});

const resolvePaths = cache(async () => {
  const root = await resolveProjectRoot();
  return {
    reportsPath: path.join(root, "reports-link.json"),
    insightsMdRoot: path.join(root, "content", "insights-md"),
    insightsMdxRoot: path.join(root, "content", "web-articles"),
  };
});

const loadReportsJson = cache(async () => {
  const { reportsPath } = await resolvePaths();
  const raw = await fs.readFile(reportsPath, "utf-8");
  const data = JSON.parse(raw) as { reports: Report[] };
  return data.reports ?? [];
});

function stripFrontmatter(markdown: string): string {
  const text = String(markdown ?? "");
  const fmRegex = /^---\s*\r?\n[\s\S]*?\r?\n---\s*(\r?\n|$)/;
  return text.replace(fmRegex, "");
}

type FaqPair = { question: string; answerMarkdown: string };

function extractFaqSection(markdown: string): { markdownWithoutFaq: string; faqs: FaqPair[] } {
  const stripped = stripFrontmatter(markdown);
  const lines = stripped.split(/\r?\n/);
  const headingRe = /^##\s+(Frequently Asked Questions|FAQs)\s*$/i;

  let headingIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (headingRe.test(lines[i].trim())) {
      headingIndex = i;
      break;
    }
  }

  if (headingIndex === -1) {
    return { markdownWithoutFaq: stripped, faqs: [] };
  }

  // Expand upwards to remove an immediately preceding horizontal rule (common in our insights markdown).
  let start = headingIndex;
  for (let i = headingIndex - 1; i >= 0; i--) {
    const t = lines[i].trim();
    if (!t) continue;
    if (t === "---") start = i;
    break;
  }

  // Find the next H2 heading (end of FAQ section).
  let end = lines.length;
  for (let i = headingIndex + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i].trim())) {
      end = i;
      break;
    }
  }

  const faqLines = lines.slice(headingIndex + 1, end);
  const remaining = [...lines.slice(0, start), ...lines.slice(end)].join("\n").trim();

  const faqs: FaqPair[] = [];
  const questionRe = /^\*\*(.+?)\*\*\s*$/;

  let i = 0;
  while (i < faqLines.length) {
    const line = faqLines[i].trim();
    if (!line || line === "---") {
      i++;
      continue;
    }

    const m = line.match(questionRe);
    if (!m) {
      i++;
      continue;
    }

    const question = m[1].replace(/\s+/g, " ").trim();
    i++;

    const answerLines: string[] = [];
    while (i < faqLines.length) {
      const peek = faqLines[i];
      const peekTrim = peek.trim();
      if (peekTrim && questionRe.test(peekTrim)) break;
      // Avoid markdown horizontal rules (e.g. '---') leaking into the last FAQ answer.
      if (/^(-{3,}|\*{3,}|_{3,})$/.test(peekTrim)) {
        i++;
        continue;
      }
      answerLines.push(peek);
      i++;
    }

    const answerMarkdown = answerLines.join("\n").trim();
    if (!answerMarkdown) continue;
    faqs.push({ question, answerMarkdown });
  }

  return { markdownWithoutFaq: remaining, faqs };
}

export const getAllReports = cache(async () => {
  return loadReportsJson();
});

export const getReportBySlug = cache(async (slug: string) => {
  const reports = await loadReportsJson();
  return reports.find((report) => report.slug === slug);
});

export const getReportSlugs = cache(async () => {
  const reports = await loadReportsJson();
  return reports.map((report) => report.slug).filter(Boolean);
});

export async function getReportContent(report: Report): Promise<ReportContent> {
  const { insightsMdRoot, insightsMdxRoot } = await resolvePaths();

  try {
    const loadAndRender = async (raw: string): Promise<ReportContent> => {
      const { markdownWithoutFaq, faqs } = extractFaqSection(raw);
      const html = await renderMarkdownToHtml(markdownWithoutFaq);
      const faqItems: ReportFaq[] = await Promise.all(
        faqs.map(async (faq, index) => ({
          id: String(index),
          question: faq.question,
          answerHtml: await renderMarkdownToHtml(faq.answerMarkdown),
        })),
      );
      return { kind: "html", html, faqs: faqItems };
    };

    if (report.mdxSlug && isSafeSlug(report.mdxSlug)) {
      const mdxPath = path.join(insightsMdxRoot, `${report.mdxSlug}.mdx`);
      const raw = await fs.readFile(mdxPath, "utf-8");
      return await loadAndRender(raw);
    }

    if (report.mdSlug && isSafeSlug(report.mdSlug)) {
      const mdPath = path.join(insightsMdRoot, `${report.mdSlug}.md`);
      const raw = await fs.readFile(mdPath, "utf-8");
      return await loadAndRender(raw);
    }
  } catch (error) {
    console.warn("Failed to load report content", error);
  }

  return { kind: "none" };
}
