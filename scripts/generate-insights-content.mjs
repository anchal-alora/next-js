/**
 * generate-insights-content.mjs
 *
 * Reads ALL CSV files from content/csv/ (recursive)
 * Merges rows with existing reports-link.json
 * Validates + normalizes with Zod
 * Writes:
 *  - reports-link.json (preserve _meta, merge reports)
 *  - MDX files for each row (generated from section_* columns)
 *
 * Notes:
 * - MDX output lives in content/web-articles/<Industry>/<slug>.mdx (or mdxSlug override).
 * - CSV rows overwrite existing reports with the same id.
 */

import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { parseCsv } from "./_csv.mjs";
import { listFilesRecursive } from "./_walk.mjs";
import { normalizeDate } from "./normalize-date.mjs";
import { formatDateOnlyInTimeZone, getTodayIstDateOnly, isIsoDateOnly } from "./_ist.mjs";
import { writeTextIfChanged } from "./_write.mjs";
import { resolveInsightImageUrl, resolveInsightReportLink } from "./_assets.mjs";

const CSV_ROOT = "content/csv";
const JSON_OUT_PATH = "reports-link.json";
const MDX_ROOT = "content/web-articles";
const INSIGHTS_TIMEZONE = "Asia/Kolkata"; // GMT+05:30

const REQUIRED_CSV_COLUMNS = [
  "id",
  "slug",
  "type",
  "date",
  "title",
  "description",
  "contentFormat",
  "industry",
  "image",
  "placement",
];

if (process.env.CSV_GEN === "0") {
  console.log("[generate:insights] CSV_GEN=0, skipping generation.");
  process.exit(0);
}

const PlacementEnum = z.enum([
  "Insights Hero",
  "Featured Insights",
  "Case Studies",
  "In-Depth Research Reports",
  "Recent Articles",
]);

const ContentFormatEnum = z.enum(["downloadable", "non-downloadable"]);

const ReportRowSchema = z
  .object({
    id: z.string().min(1, "id is required"),
    slug: z.string().min(1, "slug is required"),
    type: z.string().min(1, "type is required"),
    date: z
      .union([z.string(), z.number()])
      .optional()
      .transform((v) => (v === undefined || v === null ? "" : String(v))),
    title: z.string().min(1, "title is required"),
    description: z.string().min(1, "description is required"),
    contentFormat: ContentFormatEnum,
    industry: z.string().min(1, "industry is required"),
    image: z
      .string()
      .min(1, "image is required")
      .startsWith("/insights/image/", "image must start with /insights/image/"),
    placement: PlacementEnum,

    priority: z
      .union([z.string(), z.number()])
      .optional()
      .transform((v) => {
        if (v === undefined || v === null || v === "") return 0;
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
      }),
    pinned: z
      .union([z.string(), z.boolean()])
      .optional()
      .transform((v) => {
        if (v === undefined || v === null || v === "") return false;
        if (typeof v === "boolean") return v;
        const s = String(v).trim().toLowerCase();
        return s === "true" || s === "1" || s === "yes";
      }),
    link: z.string().optional(),
    mdxSlug: z.string().optional(),
    taggings: z.union([z.string(), z.array(z.string())]).optional(),

    section_executiveSummary: z.string().optional(),
    section_keyFindings: z.string().optional(),
    section_howItWorks: z.string().optional(),
    section_templateFields: z.string().optional(),
    section_scalingTips: z.string().optional(),
    section_recommendedNaming: z.string().optional(),
    section_conclusion: z.string().optional(),
  })
  .passthrough();

function readExistingJson(jsonPath) {
  if (!fs.existsSync(jsonPath)) {
    return { parsed: {}, meta: null, reports: [] };
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    return {
      parsed,
      meta: parsed?._meta ?? null,
      reports: Array.isArray(parsed?.reports) ? parsed.reports : [],
    };
  } catch (error) {
    console.warn(`[generate:insights] Could not read existing JSON from ${jsonPath}:`, error?.message ?? error);
    return { parsed: {}, meta: null, reports: [] };
  }
}

function warnIfSpaces(label, value, ctx) {
  if (typeof value === "string" && value.includes(" ")) {
    console.warn(`[generate:insights] WARN: ${label} contains spaces in ${ctx}: "${value}"`);
  }
}

function normalizeExistingCanonicalDate(report) {
  if (!report || typeof report !== "object") return null;

  const date = typeof report.date === "string" ? report.date.trim() : "";
  const sortDate = typeof report.sortDate === "string" ? report.sortDate.trim() : "";
  const displayDate = typeof report.displayDate === "string" ? report.displayDate.trim() : "";

  if (isIsoDateOnly(date)) return date;
  if (isIsoDateOnly(sortDate)) return sortDate;

  const parsedFromDate = date ? formatDateOnlyInTimeZone(date, INSIGHTS_TIMEZONE) : null;
  if (parsedFromDate) return parsedFromDate;

  const parsedFromDisplay = displayDate ? formatDateOnlyInTimeZone(displayDate, INSIGHTS_TIMEZONE) : null;
  if (parsedFromDisplay) return parsedFromDisplay;

  const dateInfo = normalizeDate(report?.date ?? report?.displayDate ?? "");
  if (isIsoDateOnly(dateInfo.sortDate)) return dateInfo.sortDate;
  return dateInfo.sortDate ? formatDateOnlyInTimeZone(dateInfo.sortDate, INSIGHTS_TIMEZONE) : null;
}

function buildMdxFromRow(row, fieldOrder) {
  const title = row.title ?? "";
  const sections = [];
  sections.push(`# ${title}`);

  for (const key of fieldOrder) {
    if (!String(key).startsWith("section_")) continue;
    const raw = row[key];
    if (raw === null || raw === undefined || String(raw).trim() === "") continue;

    const heading = String(key)
      .replace(/^section_/, "")
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (c) => c.toUpperCase())
      .trim();

    sections.push(`\n## ${heading}\n${String(raw).trim()}`);
  }

  return sections.join("\n");
}

function resolveMdxPath(row) {
  const mdxSlug = (row.mdxSlug ?? "").trim();
  const industry = String(row.industry ?? "").trim();
  const slug = String(row.slug ?? "").trim();

  const rel = mdxSlug ? `${mdxSlug}.mdx` : path.join(industry, `${slug}.mdx`);
  return path.join(process.cwd(), MDX_ROOT, rel);
}

function resolvePublicImagePath(imagePath) {
  const resolved = resolveInsightImageUrl(imagePath);
  if (resolved !== imagePath) return resolved;
  if (String(imagePath ?? "").startsWith("/insights/image/")) {
    console.warn(`[generate:insights] WARN: Image not found: ${imagePath} (searched all subfolders)`);
  }
  return imagePath;
}

function parseTaggings(taggings) {
  if (taggings === undefined || taggings === null) return undefined;
  if (Array.isArray(taggings)) {
    const tags = taggings.map((t) => String(t).trim()).filter(Boolean);
    return tags.length ? tags : undefined;
  }
  const raw = String(taggings).trim();
  if (!raw || raw.toLowerCase() === "na") return undefined;

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const tags = parsed.map((t) => String(t).trim()).filter(Boolean);
      return tags.length ? tags : undefined;
    }
  } catch {
    // fall through
  }

  const tags = raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  return tags.length ? tags : undefined;
}

function normalizeCsvDateToIstDateOnly(rawDate, ctx) {
  const dateInfo = normalizeDate(rawDate);
  if (isIsoDateOnly(dateInfo.sortDate)) return dateInfo.sortDate;

  const formatted = formatDateOnlyInTimeZone(String(rawDate ?? "").trim(), INSIGHTS_TIMEZONE);
  if (formatted && isIsoDateOnly(formatted)) {
    return formatted;
  }

  const warnings = dateInfo.warnings?.length ? ` Warnings: ${dateInfo.warnings.join(" | ")}` : "";
  throw new Error(`[generate:insights] ${ctx}: Could not parse date "${rawDate}".${warnings}`);
}

function shouldGenerateMdx(validatedRow) {
  const hasSectionColumns = Object.keys(validatedRow).some(
    (k) => k.startsWith("section_") && validatedRow[k] && String(validatedRow[k]).trim() !== "",
  );
  if (hasSectionColumns) return true;

  const mdxSlug = String(validatedRow.mdxSlug ?? "").trim();
  if (!mdxSlug) return false;

  const mdxPath = resolveMdxPath({
    mdxSlug,
    industry: validatedRow.industry,
    slug: validatedRow.slug,
  });

  // If authors specify mdxSlug but do not provide section_* fields, assume the file is authored manually.
  return !fs.existsSync(mdxPath);
}

async function main() {
  try {
    const existing = readExistingJson(JSON_OUT_PATH);
    const existingMeta = existing.meta;
    const existingReports = existing.reports.map((r) => {
      const canonical = normalizeExistingCanonicalDate(r);
      const normalized = canonical ?? "";
      const next = { ...r, date: normalized };
      if ("displayDate" in next) delete next.displayDate;
      if ("dateRaw" in next) delete next.dateRaw;
      if ("dateWarnings" in next) delete next.dateWarnings;
      if ("sortDate" in next) delete next.sortDate;
      return next;
    });

    console.log(`[generate:insights] Loaded ${existingReports.length} existing report(s) from ${JSON_OUT_PATH}`);

    const existingById = new Map(existingReports.map((r) => [r.id, r]));
    const existingDateBySlug = new Map(
      existingReports
        .filter((r) => r && typeof r.slug === "string" && typeof r.date === "string" && r.date.trim())
        .map((r) => [r.slug, r.date]),
    );

    const fallbackTodayIst = getTodayIstDateOnly() ?? "1970-01-01";
    for (const report of existingReports) {
      const slug = typeof report?.slug === "string" ? report.slug.trim() : "";
      if (!slug) continue;
      const canonical = existingDateBySlug.get(slug) ?? normalizeExistingCanonicalDate(report) ?? fallbackTodayIst;
      report.date = canonical;
      if ("sortDate" in report) delete report.sortDate;
      existingDateBySlug.set(slug, canonical);
    }

    const csvFiles = fs.existsSync(path.join(process.cwd(), CSV_ROOT))
      ? listFilesRecursive(CSV_ROOT, { exts: [".csv"] })
      : [];

    if (csvFiles.length === 0) {
      console.log(`[generate:insights] No CSV files found at ${CSV_ROOT}/. Skipping CSV merge.`);
      const outputJson = {
        ...(existingMeta ? { _meta: existingMeta } : {}),
        ...(existing.parsed && typeof existing.parsed === "object" ? existing.parsed : {}),
        reports: existingReports,
      };
      // Ensure _meta doesn't get duplicated if existing.parsed already had it.
      if (outputJson._meta === undefined && existingMeta) outputJson._meta = existingMeta;
      const nextText = JSON.stringify(outputJson, null, 2) + "\n";
      const wrote = await writeTextIfChanged(path.join(process.cwd(), JSON_OUT_PATH), nextText);
      console.log(
        wrote
          ? `[generate:insights] Wrote normalized ${existingReports.length} report(s) → ${JSON_OUT_PATH}`
          : `[generate:insights] No changes; skipped writing ${JSON_OUT_PATH}`,
      );
      return;
    }

    console.log(`[generate:insights] Found ${csvFiles.length} CSV file(s).`);

    const rows = [];
    for (const fileAbs of csvFiles) {
      const csvText = fs.readFileSync(fileAbs, "utf8");
      const parsed = parseCsv(csvText);

      const fieldOrder = parsed.fieldOrder ?? [];
      const fieldSet = new Set(fieldOrder.map((f) => String(f).trim()));
      const missingColumns = REQUIRED_CSV_COLUMNS.filter((col) => !fieldSet.has(col));
      if (missingColumns.length > 0) {
        throw new Error(
          `CSV structural error in ${path.relative(process.cwd(), fileAbs)}: missing required column(s): ${missingColumns.join(", ")}`,
        );
      }

      for (let i = 0; i < parsed.rows.length; i++) {
        const row = parsed.rows[i];
        const ctx = `${path.relative(process.cwd(), fileAbs)} (row ${i + 2})`;
        rows.push({ row, ctx, fileAbs, fieldOrder });
      }
    }

    if (rows.length === 0) {
      console.log("[generate:insights] No data rows found in CSV files. Skipping.");
      return;
    }

    console.log(`[generate:insights] Parsed ${rows.length} row(s) from CSV files.`);

    const csvSeenIds = new Set();
    const csvSeenSlugs = new Set();
    const csvReports = [];
    const mdxFilesToWrite = [];

    for (const { row, ctx, fieldOrder } of rows) {
      let validatedRow;
      try {
        validatedRow = ReportRowSchema.parse(row);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const issues = error.issues ?? error.errors ?? [];
          const errorDetails = issues.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
          throw new Error(`[generate:insights] Validation error in ${ctx}: ${errorDetails}`);
        }
        throw error;
      }

      const id = validatedRow.id.trim();
      const slug = validatedRow.slug.trim();

      if (csvSeenIds.has(id)) throw new Error(`[generate:insights] Duplicate id "${id}" in ${ctx}`);
      if (csvSeenSlugs.has(slug)) throw new Error(`[generate:insights] Duplicate slug "${slug}" in ${ctx}`);
      csvSeenIds.add(id);
      csvSeenSlugs.add(slug);

      warnIfSpaces("image", validatedRow.image, ctx);
      if (validatedRow.link) warnIfSpaces("link", validatedRow.link, ctx);
      warnIfSpaces("industry", validatedRow.industry, ctx);
      warnIfSpaces("slug", validatedRow.slug, ctx);

      const canonicalDate = normalizeCsvDateToIstDateOnly(validatedRow.date, ctx);
      existingDateBySlug.set(slug, canonicalDate);

      const reportObj = {
        id,
        slug,
        type: validatedRow.type.trim(),
        date: canonicalDate,
        title: validatedRow.title.trim(),
        description: validatedRow.description.trim(),
        contentFormat: validatedRow.contentFormat,
        industry: validatedRow.industry.trim(),
        image: resolvePublicImagePath(validatedRow.image.trim()),
        placement: validatedRow.placement,
        priority: validatedRow.priority ?? 0,
        pinned: validatedRow.pinned ?? false,
      };

      if (validatedRow.contentFormat === "downloadable" && validatedRow.link) {
        const linkTrimmed = validatedRow.link.trim();
        if (linkTrimmed && linkTrimmed.toLowerCase() !== "na") {
          reportObj.link = resolveInsightReportLink(linkTrimmed);
        }
      }

      const hasMdxSlug = validatedRow.mdxSlug && String(validatedRow.mdxSlug).trim() !== "";
      const hasSectionColumns = Object.keys(validatedRow).some(
        (k) => k.startsWith("section_") && validatedRow[k] && String(validatedRow[k]).trim() !== "",
      );

      if (hasMdxSlug) {
        reportObj.mdxSlug = validatedRow.mdxSlug.trim();
      } else if (hasSectionColumns) {
        reportObj.mdxSlug = `${validatedRow.industry.trim()}/${validatedRow.slug.trim()}`;
      }

      const taggings = parseTaggings(validatedRow.taggings);
      if (taggings) reportObj.taggings = taggings;

      csvReports.push(reportObj);

      if (shouldGenerateMdx(validatedRow)) {
        const mdxOutPath = resolveMdxPath({
          mdxSlug: validatedRow.mdxSlug,
          industry: validatedRow.industry,
          slug: validatedRow.slug,
        });
        const mdxContent = buildMdxFromRow(validatedRow, fieldOrder);
        mdxFilesToWrite.push({ path: mdxOutPath, content: mdxContent, ctx });
      }
    }

    for (const csvReport of csvReports) {
      if (existingById.has(csvReport.id)) {
        const existingReport = existingById.get(csvReport.id);
        existingById.set(csvReport.id, { ...existingReport, ...csvReport });
        console.log(`[generate:insights] Updated existing report: ${csvReport.id}`);
      } else {
        existingById.set(csvReport.id, csvReport);
        console.log(`[generate:insights] Added new report: ${csvReport.id}`);
      }
    }

    const mergedReports = Array.from(existingById.values());

    for (const report of mergedReports) {
      const slug = typeof report?.slug === "string" ? report.slug.trim() : "";
      const existingDate = slug ? existingDateBySlug.get(slug) : null;
      const normalized = existingDate ?? normalizeExistingCanonicalDate(report) ?? fallbackTodayIst;
      report.date = normalized;
      if ("sortDate" in report) delete report.sortDate;
      if ("displayDate" in report) delete report.displayDate;
      if ("dateRaw" in report) delete report.dateRaw;
      if ("dateWarnings" in report) delete report.dateWarnings;
    }

    const slugToIds = new Map();
    for (const report of mergedReports) {
      const slug = report.slug;
      if (slugToIds.has(slug)) {
        const existingId = slugToIds.get(slug);
        if (existingId !== report.id) {
          throw new Error(
            `[generate:insights] Slug collision: slug "${slug}" used by multiple reports with different ids: "${existingId}" and "${report.id}"`,
          );
        }
      } else {
        slugToIds.set(slug, report.id);
      }
    }

    for (const { path: mdxPath, content, ctx } of mdxFilesToWrite) {
      const wrote = await writeTextIfChanged(mdxPath, content);
      console.log(
        wrote
          ? `[generate:insights] Wrote MDX: ${path.relative(process.cwd(), mdxPath)} (${ctx})`
          : `[generate:insights] MDX unchanged; skipped: ${path.relative(process.cwd(), mdxPath)} (${ctx})`,
      );
    }

    const outputJson = {
      ...(existing.parsed && typeof existing.parsed === "object" ? existing.parsed : {}),
      ...(existingMeta ? { _meta: existingMeta } : {}),
      reports: mergedReports,
    };
    outputJson._meta = existingMeta ?? outputJson._meta ?? undefined;

    const nextText = JSON.stringify(outputJson, null, 2) + "\n";
    const wroteJson = await writeTextIfChanged(path.join(process.cwd(), JSON_OUT_PATH), nextText);

    const newCount = csvReports.filter((r) => !existingReports.some((er) => er.id === r.id)).length;
    const updatedCount = csvReports.filter((r) => existingReports.some((er) => er.id === r.id)).length;
    const preservedCount = mergedReports.length - csvReports.length;

    console.log(
      `[generate:insights] Done. CSV files: ${csvFiles.length}, total reports: ${mergedReports.length} (${newCount} new, ${updatedCount} updated, ${preservedCount} preserved), MDX candidates: ${mdxFilesToWrite.length}, jsonWritten=${wroteJson}`,
    );
  } catch (error) {
    console.error("[generate:insights] ERROR:", error?.message ?? error);
    console.error(error?.stack ?? String(error));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("[generate:insights] Fatal error:", error);
  process.exit(1);
});
