/**
 * index-insights-md.mjs
 *
 * Build/dev pre-step:
 * - Scans all markdown under content/insights-md (recursive)
 * - Parses required frontmatter via gray-matter
 * - Upserts md-based insights into reports-link.json
 *
 * Safety:
 * - Reads only from content/insights-md
 * - No path traversal: mdSlug is derived from on-disk relative path
 *
 * Non-interference:
 * - Never modifies entries that already have mdxSlug
 * - Never modifies entries whose slug exists but are not md-based (no mdSlug)
 * - Only updates entries previously created from markdown (have mdSlug)
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import matter from "gray-matter";
import { z } from "zod";
import { listFilesRecursive } from "./_walk.mjs";
import { getTodayIstDateOnly, isIsoDateOnly } from "./_ist.mjs";
import { normalizeDate } from "./normalize-date.mjs";
import { writeTextIfChanged } from "./_write.mjs";
import { resolveInsightImageUrl, resolveInsightReportLink } from "./_assets.mjs";

const INSIGHTS_MD_ROOT = path.resolve(process.cwd(), "content/insights-md");
const REPORTS_JSON_PATH = path.resolve(process.cwd(), "reports-link.json");

const PlacementEnum = z.enum([
  "Insights Hero",
  "Featured Insights",
  "Case Studies",
  "In-Depth Research Reports",
  "Recent Articles",
]);

const ContentFormatEnum = z.enum(["downloadable", "non-downloadable"]);

const FrontmatterSchema = z
  .object({
    title: z.string().min(1, "title is required"),
    industry: z.string().min(1, "industry is required"),
    description: z.string().min(1, "description is required"),
    type: z.string().min(1, "type is required"),
    placement: PlacementEnum,
    contentFormat: ContentFormatEnum,
    tags: z.array(z.string().min(1)).min(1, "tags must be a non-empty array"),

    id: z.string().min(1).optional(),
    date: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    image: z.string().min(1).optional(),
    link: z.string().min(1).optional(),
    priority: z
      .union([z.number(), z.string()])
      .optional()
      .transform((v) => {
        if (v === undefined || v === null || v === "") return 0;
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
      }),
    pinned: z
      .union([z.boolean(), z.string(), z.number()])
      .optional()
      .transform((v) => {
        if (v === undefined || v === null || v === "") return false;
        if (typeof v === "number") return Number.isFinite(v) ? v !== 0 : false;
        if (typeof v === "boolean") return v;
        const s = String(v).trim().toLowerCase();
        return s === "true" || s === "1" || s === "yes";
      }),
  })
  .passthrough();

function slugify(input) {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeSlug(frontmatterSlug, filenameSlug, ctx) {
  const raw = frontmatterSlug ? String(frontmatterSlug).trim() : filenameSlug;
  const slug = slugify(raw);
  if (!slug) throw new Error(`[index:insights-md] Invalid slug in ${ctx}: "${raw}"`);
  return slug;
}

function generateDeterministicIdFromSlug(slug) {
  return crypto.createHash("sha256").update(slug).digest("hex").slice(0, 32);
}

function assertInsideInsightsRoot(absPath) {
  const resolved = path.resolve(absPath);
  const rel = path.relative(INSIGHTS_MD_ROOT, resolved);
  if (!rel || rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error(`[index:insights-md] Refusing to read outside insights-md: ${absPath}`);
  }
}

function isSafeMdSlug(mdSlug) {
  const s = String(mdSlug).trim();
  if (!s) return false;
  if (s.startsWith("/") || s.includes("\\") || s.includes("\0")) return false;
  if (s.split("/").some((part) => part === "." || part === ".." || part.length === 0)) return false;
  return /^[A-Za-z0-9/_-]+$/.test(s);
}

function normalizeExistingCanonicalDate(report) {
  if (!report || typeof report !== "object") return null;
  const date = typeof report.date === "string" ? report.date.trim() : "";
  const sortDate = typeof report.sortDate === "string" ? report.sortDate.trim() : "";
  if (isIsoDateOnly(date)) return date;
  if (isIsoDateOnly(sortDate)) return sortDate;
  return null;
}

function resolvePublicImagePath(imagePath) {
  const raw = String(imagePath ?? "").trim();
  if (!raw) return undefined;
  if (!raw.startsWith("/insights/image/")) return raw;
  const resolved = resolveInsightImageUrl(raw);
  return resolved || raw;
}

function computeMdSlugFromAbsPath(absPath) {
  assertInsideInsightsRoot(absPath);
  const rel = path.relative(INSIGHTS_MD_ROOT, absPath);
  const noExt = rel.replace(/\.md$/i, "");

  const parts = noExt.split(path.sep);
  const safeParts = parts.map((segment) => {
    if (!segment || segment === "." || segment === "..") {
      throw new Error(`[index:insights-md] Invalid path segment "${segment}" while computing mdSlug from ${rel}`);
    }
    const safe = segment.replace(/[^A-Za-z0-9_-]/g, "-");
    if (!safe || safe === "." || safe === "..") {
      throw new Error(
        `[index:insights-md] Invalid mdSlug segment "${safe}" (from "${segment}") while indexing ${rel}`,
      );
    }
    return safe;
  });

  const mdSlug = safeParts.join("/");
  if (!isSafeMdSlug(mdSlug)) {
    throw new Error(`[index:insights-md] Generated unsafe mdSlug "${mdSlug}" from ${rel}`);
  }
  return mdSlug;
}

function warnIfHasMarkdownH1(markdownBody, ctx) {
  const hasH1 = /(^|\n)\s*#\s+\S/.test(markdownBody);
  if (hasH1) {
    console.warn(
      `[index:insights-md] WARN: ${ctx} contains a Markdown H1. H1 is reserved for the template title.`,
    );
  }
}

function readReportsJson() {
  if (!fs.existsSync(REPORTS_JSON_PATH)) {
    throw new Error(`[index:insights-md] Missing ${REPORTS_JSON_PATH}. Run generate:insights first.`);
  }
  const raw = fs.readFileSync(REPORTS_JSON_PATH, "utf8");
  const parsed = JSON.parse(raw);
  const reports = Array.isArray(parsed?.reports) ? parsed.reports : [];
  return { parsed, reports };
}

function normalizeFrontmatterDateToIso(frontmatterDate, ctx) {
  const raw = String(frontmatterDate ?? "").trim();
  if (!raw) return null;
  const info = normalizeDate(raw);
  if (isIsoDateOnly(info.sortDate)) return info.sortDate;
  const warnings = info.warnings?.length ? ` Warnings: ${info.warnings.join(" | ")}` : "";
  throw new Error(`[index:insights-md] ${ctx}: Could not parse frontmatter.date "${raw}".${warnings}`);
}

async function main() {
  try {
    if (!fs.existsSync(INSIGHTS_MD_ROOT)) {
      console.log(`[index:insights-md] ${INSIGHTS_MD_ROOT} not found. Skipping.`);
      process.exit(0);
    }

    const filesAbs = listFilesRecursive("content/insights-md", { exts: [".md"] }).filter(
      (abs) => path.basename(abs).toLowerCase() !== "readme.md",
    );
    if (filesAbs.length === 0) {
      console.log(`[index:insights-md] No markdown files found under content/insights-md/. Skipping.`);
      process.exit(0);
    }

    const { parsed, reports } = readReportsJson();
    const bySlugIndex = new Map(reports.map((r, idx) => [r.slug, idx]));
    const existingDateBySlug = new Map(
      reports
        .filter((r) => r && typeof r.slug === "string")
        .map((r) => [r.slug, normalizeExistingCanonicalDate(r)])
        .filter(([, d]) => typeof d === "string" && d),
    );

    const mdFilesBySlug = new Map();
    const candidates = [];

    for (const abs of filesAbs) {
      const ctx = `content/insights-md/${path.relative(INSIGHTS_MD_ROOT, abs)}`;
      assertInsideInsightsRoot(abs);

      const raw = fs.readFileSync(abs, "utf8");
      const { data, content } = matter(raw);
      warnIfHasMarkdownH1(content, ctx);

      let frontmatter;
      try {
        frontmatter = FrontmatterSchema.parse(data);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const issues = error.issues ?? error.errors ?? [];
          const details = issues.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
          throw new Error(`[index:insights-md] Frontmatter validation failed for ${ctx}: ${details}`);
        }
        throw error;
      }

      const filenameSlug = slugify(path.basename(abs, ".md"));
      const slug = normalizeSlug(frontmatter.slug, filenameSlug, ctx);
      const computedMdSlug = computeMdSlugFromAbsPath(abs);

      if (frontmatter.contentFormat === "downloadable") {
        const link = frontmatter.link ? String(frontmatter.link).trim() : "";
        if (!link || link.toLowerCase().includes("na")) {
          throw new Error(`[index:insights-md] ${ctx}: contentFormat=downloadable requires a valid frontmatter.link`);
        }
      }

      if (frontmatter.type === "Case Study" && frontmatter.placement !== "Case Studies") {
        throw new Error(`[index:insights-md] ${ctx}: type='Case Study' requires placement='Case Studies'`);
      }
      if (frontmatter.placement === "Case Studies" && frontmatter.type !== "Case Study") {
        console.warn(
          `[index:insights-md] WARN: ${ctx}: placement='Case Studies' but type is '${frontmatter.type}'. Case Studies are identified by placement.`,
        );
      }

      if (mdFilesBySlug.has(slug)) {
        throw new Error(
          `[index:insights-md] Duplicate slug among markdown files: "${slug}"\n- ${mdFilesBySlug.get(slug)}\n- ${ctx}`,
        );
      }
      mdFilesBySlug.set(slug, ctx);

      const id = frontmatter.id ? String(frontmatter.id).trim() : generateDeterministicIdFromSlug(slug);

      const todayIst = getTodayIstDateOnly();
      const fmDate = normalizeFrontmatterDateToIso(frontmatter.date, ctx);
      const canonicalDate = existingDateBySlug.get(slug) ?? fmDate ?? todayIst ?? "1970-01-01";
      existingDateBySlug.set(slug, canonicalDate);

      candidates.push({
        id,
        slug,
        computedMdSlug,
        type: frontmatter.type,
        date: canonicalDate,
        title: String(frontmatter.title).trim(),
        description: String(frontmatter.description).trim(),
        industry: String(frontmatter.industry).trim(),
        placement: frontmatter.placement,
        contentFormat: frontmatter.contentFormat,
        image: frontmatter.image ? resolvePublicImagePath(frontmatter.image) : undefined,
        link: frontmatter.link ? resolveInsightReportLink(String(frontmatter.link).trim()) : undefined,
        priority: frontmatter.priority ?? 0,
        pinned: frontmatter.pinned ?? false,
        taggings: Array.isArray(frontmatter.tags)
          ? frontmatter.tags.map((t) => String(t).trim()).filter(Boolean)
          : [],
      });
    }

    const newEntries = [];
    let updatedCount = 0;
    let skippedCount = 0;
    let migratedCount = 0;

    for (const c of candidates) {
      const existingIndex = bySlugIndex.get(c.slug);
      let finalMdSlug = c.computedMdSlug;

      if (existingIndex !== undefined) {
        const existing = reports[existingIndex];
        if (existing.mdSlug) {
          if (!isSafeMdSlug(existing.mdSlug)) {
            console.warn(
              `[index:insights-md] WARN: Migrating invalid mdSlug for "${c.slug}" from "${existing.mdSlug}" to "${c.computedMdSlug}"`,
            );
            finalMdSlug = c.computedMdSlug;
            migratedCount++;
          } else {
            finalMdSlug = existing.mdSlug;
          }
        }
      }

      if (existingIndex === undefined) {
        newEntries.push({ ...c, mdSlug: finalMdSlug });
        continue;
      }

      const existing = reports[existingIndex];
      if (existing?.mdxSlug) {
        console.warn(
          `[index:insights-md] WARN: slug "${c.slug}" already exists with mdxSlug; skipping markdown upsert.`,
        );
        skippedCount++;
        continue;
      }

      if (!existing?.mdSlug) {
        console.warn(
          `[index:insights-md] WARN: slug "${c.slug}" already exists without mdSlug (non-markdown entry); skipping markdown upsert.`,
        );
        skippedCount++;
        continue;
      }

      existing.id = c.id;
      existing.type = c.type;
      existing.date = c.date;
      if ("sortDate" in existing) delete existing.sortDate;
      if ("displayDate" in existing) delete existing.displayDate;
      if ("dateRaw" in existing) delete existing.dateRaw;
      if ("dateWarnings" in existing) delete existing.dateWarnings;
      existing.title = c.title;
      existing.description = c.description;
      existing.contentFormat = c.contentFormat;
      existing.industry = c.industry;
      existing.placement = c.placement;
      existing.priority = c.priority;
      existing.pinned = c.pinned;
      existing.mdSlug = finalMdSlug;

      if (c.image) existing.image = c.image;
      if (c.contentFormat === "downloadable" && c.link) {
        existing.link = c.link;
      } else if ("link" in existing) {
        delete existing.link;
      }

      if (c.taggings.length > 0) existing.taggings = c.taggings;
      else if ("taggings" in existing) delete existing.taggings;

      updatedCount++;
    }

    if (newEntries.length > 0) {
      newEntries.sort((a, b) => a.slug.localeCompare(b.slug));
      for (const entry of newEntries) {
        const reportObj = {
          id: entry.id,
          slug: entry.slug,
          type: entry.type,
          date: entry.date,
          title: entry.title,
          description: entry.description,
          contentFormat: entry.contentFormat,
          industry: entry.industry,
          ...(entry.image ? { image: entry.image } : {}),
          placement: entry.placement,
          priority: entry.priority,
          pinned: entry.pinned,
          mdSlug: entry.mdSlug,
          ...(entry.contentFormat === "downloadable" && entry.link ? { link: entry.link } : {}),
          ...(entry.taggings.length > 0 ? { taggings: entry.taggings } : {}),
        };
        reports.push(reportObj);
      }
    }

    const output = { ...parsed, reports };
    const nextText = JSON.stringify(output, null, 2) + "\n";
    const wrote = await writeTextIfChanged(REPORTS_JSON_PATH, nextText);

    console.log(
      wrote
        ? `[index:insights-md] Done. scanned=${candidates.length}, inserted=${newEntries.length}, updated=${updatedCount}, skipped=${skippedCount}, migrated=${migratedCount}`
        : `[index:insights-md] No changes; skipped writing ${path.basename(REPORTS_JSON_PATH)} (scanned=${candidates.length})`,
    );
  } catch (error) {
    console.error("[index:insights-md] ERROR:", error?.message ?? error);
    console.error(error?.stack ?? String(error));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("[index:insights-md] Fatal error:", error);
  process.exit(1);
});
