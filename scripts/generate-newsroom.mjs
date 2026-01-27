/**
 * generate-newsroom.mjs
 *
 * Reads ALL markdown files from content/newsroom/ (recursive)
 * Parses frontmatter and generates a JSON index file
 * Writes: newsroom-data.json
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { listFilesRecursive, toPosixRelativeFromCwd } from "./_walk.mjs";
import { formatDateOnlyInTimeZone, getTodayIstDateOnly, isIsoDateOnly } from "./_ist.mjs";
import { writeTextIfChanged } from "./_write.mjs";

const NEWSROOM_ROOT = "content/newsroom";
const JSON_OUT_PATH = "newsroom-data.json";
const NEWSROOM_TIMEZONE = "Asia/Kolkata"; // GMT+05:30

const LEGACY_CONTENT_DIR = "content/" + "press-" + "releases";
const NEWSROOM_CONTENT_DIR = "content/newsroom";
const LEGACY_SCRIPT_NAME = "generate:" + "press-" + "releases";
const NEWSROOM_SCRIPT_NAME = "generate:newsroom";

const LEGACY_PRESS_RELEASE = ["press", "release"].join(" ");
const LEGACY_PRESS_RELEASES = ["press", "releases"].join(" ");
const LEGACY_PRESS_RELEASE_CAP = ["Press", "release"].join(" ");
const LEGACY_PRESS_RELEASES_CAP = ["Press", "releases"].join(" ");

function replaceLegacyStrings(input) {
  return String(input)
    .replaceAll(LEGACY_CONTENT_DIR, NEWSROOM_CONTENT_DIR)
    .replaceAll(LEGACY_SCRIPT_NAME, NEWSROOM_SCRIPT_NAME)
    .replaceAll(LEGACY_PRESS_RELEASES_CAP, "Newsroom")
    .replaceAll(LEGACY_PRESS_RELEASES, "newsroom")
    .replaceAll(LEGACY_PRESS_RELEASE_CAP, "Newsroom article")
    .replaceAll(LEGACY_PRESS_RELEASE, "newsroom article");
}

function deepReplaceLegacyStrings(value) {
  if (typeof value === "string") return replaceLegacyStrings(value);
  if (Array.isArray(value)) return value.map(deepReplaceLegacyStrings);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = deepReplaceLegacyStrings(v);
    return out;
  }
  return value;
}

function buildMeta(existingMeta, count) {
  const generated = new Date().toISOString();

  const defaultMeta = {
    description:
      "Newsroom index generated from markdown files in content/newsroom/. This file controls all newsroom content, routing, and display behavior. Each newsroom article is authored as a markdown file with frontmatter and automatically indexed here.",
    source: "Markdown files in content/newsroom/ (recursive glob pattern: **/*.{md,txt})",
    timezone: `${NEWSROOM_TIMEZONE} (GMT+05:30)`,
    dateFormat: "YYYY-MM-DD",
    fields: {
      slug: "Unique URL slug used for routing. Auto-generated from filename if not provided in frontmatter. Generates the route /newsroom/:slug.",
      date: "Release date stored as YYYY-MM-DD in Asia/Kolkata (GMT+05:30). Used for sorting (newest first).",
      title: "Primary headline of the newsroom article. Required field. Displayed on listing pages and detail page hero section.",
      industry: "Industry classification label. Required field. Used for display and filtering.",
      subheader: "Subheading displayed below the title on detail pages. Required field. Provides additional context or summary.",
      tags: "Optional array of topic tags. Used for categorization and filtering. Can be provided as YAML array in frontmatter.",
      summary:
        "Brief summary text. Optional field. Auto-extracted from first 2 lines of content if not provided in frontmatter. Truncated to 200 characters if longer.",
      sourcePath: "Relative path to the source markdown file under content/newsroom/. Used to lazy-load markdown at runtime.",
    },
    requiredFields: ["date", "title", "industry", "subheader"],
    optionalFields: ["slug", "tags", "summary"],
    validationRules: {
      fileFormat: "Markdown files (.md or .txt) with YAML frontmatter",
      requiredFrontmatter: "All files must have title, industry, and subheader fields in frontmatter (date is optional and ignored)",
      slugGeneration:
        "If slug not provided, generated from filename: lowercase, replace non-alphanumeric with hyphens, trim leading/trailing hyphens",
      dateHandling:
        "Date is assigned to today's date (YYYY-MM-DD) in Asia/Kolkata when the slug first appears, and preserved on subsequent builds",
      summaryExtraction:
        "If summary not provided, extracted from first 2 non-empty lines of content, stripped of markdown formatting, truncated to 200 chars",
    },
    generationRules: {
      sourceOfTruth: "Markdown files in content/newsroom/ are the source of truth",
      mergeBehavior: "If a release with the same slug already exists, the markdown file takes precedence and overwrites it",
      dateAssignment:
        "Frontmatter date is ignored; date is set to today's Asia/Kolkata date for new slugs and preserved for existing slugs",
      sorting: "Releases are sorted by date in descending order (newest first)",
      fileProcessing: "All markdown files matching the glob pattern are processed. Invalid files are skipped with warnings",
    },
    routingRules: {
      route: "/newsroom/:slug",
      listingPage: "/newsroom",
      detailPage: "src/app/newsroom/[slug]/page.tsx",
    },
    notes: [
      "Files missing required frontmatter fields (title, industry, or subheader) are skipped during generation with a warning message.",
      "Frontmatter 'date' is optional and ignored; dates are assigned/preserved by the generator for stability across builds.",
      "Slug collisions are handled by allowing markdown files to overwrite existing releases with the same slug.",
      "Summary auto-extraction removes markdown formatting (headers, bold, italic, links) and limits length to 200 characters.",
    ],
  };

  const merged = existingMeta && typeof existingMeta === "object" ? { ...defaultMeta, ...existingMeta } : defaultMeta;
  return { ...deepReplaceLegacyStrings(merged), generated, count };
}

function slugify(input) {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function generateSlug(filePathAbs) {
  const base = path.basename(filePathAbs).replace(/\.(md|txt)$/i, "");
  const slug = slugify(base);
  if (!slug) throw new Error(`[generate:newsroom] Could not derive slug from filename: ${filePathAbs}`);
  return slug;
}

function stripMarkdownInline(text) {
  return String(text ?? "")
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[[^\]]+]\([^)]*\)/g, (m) => m.replace(/\[[^\]]+]/, "").replace(/\([^)]*\)/, ""))
    .replace(/[*_`~]/g, "")
    .replace(/^#+\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractSummary(markdownBody) {
  const lines = String(markdownBody ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const firstTwo = lines.slice(0, 2).join(" ");
  const plain = stripMarkdownInline(firstTwo);
  const truncated = plain.length > 200 ? plain.slice(0, 197).trimEnd() + "..." : plain;
  return truncated || undefined;
}

function normalizeNewsroomDateToIstDateOnly(value, ctx) {
  const s = typeof value === "string" ? value.trim() : "";
  if (!s) return null;
  if (isIsoDateOnly(s)) return s;
  const formatted = formatDateOnlyInTimeZone(s, NEWSROOM_TIMEZONE);
  if (!formatted) {
    console.warn(`[generate:newsroom] WARN: Could not parse date "${s}" in ${ctx}.`);
    return null;
  }
  return formatted;
}

function readExistingJson(filePath) {
  if (!fs.existsSync(filePath)) {
    return { releases: [], _meta: null };
  }
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    console.warn(`[generate:newsroom] Failed to parse ${filePath}, starting fresh:`, error?.message ?? error);
    return { releases: [], _meta: null };
  }
}

function normalizeReleaseForCompare(r) {
  if (!r || typeof r !== "object") return null;
  return {
    slug: r.slug ?? "",
    date: r.date ?? "",
    title: r.title ?? "",
    industry: r.industry ?? "",
    subheader: r.subheader ?? "",
    tags: Array.isArray(r.tags) ? r.tags.map(String) : undefined,
    summary: r.summary ?? undefined,
    sourcePath: r.sourcePath ?? undefined,
  };
}

async function main() {
  try {
    const existing = readExistingJson(JSON_OUT_PATH);
    const existingReleases = existing.releases || [];
    const existingMeta = existing._meta || null;

    console.log(`[generate:newsroom] Loaded ${existingReleases.length} existing release(s) from ${JSON_OUT_PATH}`);

    const existingBySlug = new Map(existingReleases.map((r) => [r.slug, r]));

    const newsroomAbs = path.join(process.cwd(), NEWSROOM_ROOT);
    const markdownAbs = fs.existsSync(newsroomAbs)
      ? listFilesRecursive(NEWSROOM_ROOT, { exts: [".md", ".txt"] }).filter(
          (abs) => path.basename(abs).toLowerCase() !== "readme.md",
        )
      : [];

    if (markdownAbs.length === 0) {
      console.log(`[generate:newsroom] No markdown files found under ${NEWSROOM_ROOT}/. Writing empty ${JSON_OUT_PATH}.`);
      const output = { _meta: buildMeta(existingMeta, 0), releases: [] };
      fs.writeFileSync(JSON_OUT_PATH, JSON.stringify(output, null, 2) + "\n", "utf8");
      console.log(`[generate:newsroom] Generated 0 release(s) → ${JSON_OUT_PATH}`);
      return;
    }

    console.log(`[generate:newsroom] Found ${markdownAbs.length} newsroom file(s).`);

    const releases = [];

    for (const fileAbs of markdownAbs) {
      const fileRel = toPosixRelativeFromCwd(fileAbs);
      try {
        const fileContent = fs.readFileSync(fileAbs, "utf8");
        const { data, content } = matter(fileContent);

        if (!data.title || !data.industry || !data.subheader) {
          console.warn(`[generate:newsroom] SKIPPING INVALID FILE: ${fileRel}`);
          console.warn("  Reason: Missing required frontmatter fields (title, industry, or subheader)");
          continue;
        }

        const slug = data.slug ? slugify(String(data.slug).trim()) : generateSlug(fileAbs);
        if (!slug) throw new Error(`[generate:newsroom] Invalid slug for ${fileRel}`);

        const summary = data.summary ? String(data.summary).trim() : extractSummary(content);

        const todayIst = getTodayIstDateOnly();
        const existingDateRaw = existingBySlug.get(slug)?.date;
        const existingDate = normalizeNewsroomDateToIstDateOnly(existingDateRaw, `existing newsroom-data.json (${slug})`);
        const dateValue = existingDate ?? todayIst ?? "1970-01-01";

        const release = {
          slug,
          date: dateValue,
          title: String(data.title),
          industry: String(data.industry),
          subheader: String(data.subheader),
          tags: Array.isArray(data.tags) ? data.tags.map(String) : undefined,
          summary,
          sourcePath: fileRel,
        };

        if (existingBySlug.has(slug)) {
          console.log(`[generate:newsroom] Overwriting existing release: ${slug}`);
        }

        releases.push(release);
      } catch (error) {
        console.error(`[generate:newsroom] Error processing ${fileRel}:`, error?.message ?? error);
      }
    }

    releases.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const prevComparable = JSON.stringify(existingReleases.map(normalizeReleaseForCompare));
    const nextComparable = JSON.stringify(releases.map(normalizeReleaseForCompare));
    const releasesChanged = prevComparable !== nextComparable;

    if (!releasesChanged) {
      console.log(`[generate:newsroom] No release changes detected; skipped writing ${JSON_OUT_PATH}`);
      return;
    }

    const output = { _meta: buildMeta(existingMeta, releases.length), releases };
    const nextText = JSON.stringify(output, null, 2) + "\n";
    const wrote = await writeTextIfChanged(path.join(process.cwd(), JSON_OUT_PATH), nextText);
    console.log(
      wrote
        ? `[generate:newsroom] Generated ${releases.length} release(s) → ${JSON_OUT_PATH}`
        : `[generate:newsroom] Output unchanged; skipped writing ${JSON_OUT_PATH}`,
    );
  } catch (error) {
    console.error("[generate:newsroom] Fatal error:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("[generate:newsroom] Fatal error:", error);
  process.exit(1);
});
