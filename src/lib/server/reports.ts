import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import type { Report } from "@/lib/reportUtils";
import { renderMarkdownToHtml } from "@/lib/server/markdown";

export type ReportContent =
  | { kind: "html"; html: string }
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
    if (report.mdxSlug && isSafeSlug(report.mdxSlug)) {
      const mdxPath = path.join(insightsMdxRoot, `${report.mdxSlug}.mdx`);
      const raw = await fs.readFile(mdxPath, "utf-8");
      const html = await renderMarkdownToHtml(raw);
      return { kind: "html", html };
    }

    if (report.mdSlug && isSafeSlug(report.mdSlug)) {
      const mdPath = path.join(insightsMdRoot, `${report.mdSlug}.md`);
      const raw = await fs.readFile(mdPath, "utf-8");
      const html = await renderMarkdownToHtml(raw);
      return { kind: "html", html };
    }
  } catch (error) {
    console.warn("Failed to load report content", error);
  }

  return { kind: "none" };
}
