/**
 * validate-content.mjs
 *
 * Prebuild validation script.
 * Validates generated JSON files and source content integrity.
 * Does NOT require build output.
 */

import fs from "node:fs";
import path from "node:path";
import { listFilesRecursive } from "./_walk.mjs";
import { resolveInsightImageUrl, resolveInsightReportLink } from "./_assets.mjs";

const ROOT = process.cwd();
const REPORTS_JSON_PATH = path.join(ROOT, "reports-link.json");
const NEWSROOM_JSON_PATH = path.join(ROOT, "newsroom-data.json");
const PUBLIC_DIR = path.join(ROOT, "public");
const CONTENT_DIR = path.join(ROOT, "content");

let hasError = false;

function fail(msg) {
  console.error(`[FAIL] ${msg}`);
  hasError = true;
}

function warn(msg) {
  console.warn(`[WARN] ${msg}`);
}

function info(msg) {
  console.log(`[INFO] ${msg}`);
}

function checkReports() {
  info("Checking reports-link.json...");
  if (!fs.existsSync(REPORTS_JSON_PATH)) {
    fail(`Missing ${REPORTS_JSON_PATH}. Run generate:insights first.`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(REPORTS_JSON_PATH, "utf8"));
  const reports = data.reports || [];
  const seenIds = new Set();
  const seenSlugs = new Set();

  const validPlacements = [
    "Insights Hero",
    "Featured Insights",
    "Case Studies",
    "In-Depth Research Reports",
    "Recent Articles",
  ];

  const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

  reports.forEach((r, idx) => {
    const ctx = `Report #${idx} (${r.slug || "unknown slug"})`;

    const required = ["id", "slug", "title", "description", "industry", "placement", "contentFormat", "date"];
    required.forEach((field) => {
      if (!r[field]) fail(`${ctx}: Missing required field '${field}'`);
    });

    if (r.date && !isoDateRegex.test(String(r.date))) {
      fail(`${ctx}: Invalid date '${r.date}'. Expected ISO 'YYYY-MM-DD' (Asia/Kolkata date-only).`);
    }

    if (r.sortDate) {
      if (!isoDateRegex.test(String(r.sortDate))) {
        warn(`${ctx}: Invalid legacy sortDate '${r.sortDate}'. Expected ISO 'YYYY-MM-DD'.`);
      } else if (r.date && String(r.date) !== String(r.sortDate)) {
        fail(`${ctx}: date '${r.date}' must match legacy sortDate '${r.sortDate}'.`);
      } else {
        warn(`${ctx}: Legacy field 'sortDate' present; prefer only 'date'.`);
      }
    }

    if (seenIds.has(r.id)) fail(`${ctx}: Duplicate ID '${r.id}'`);
    seenIds.add(r.id);

    if (seenSlugs.has(r.slug)) fail(`${ctx}: Duplicate slug '${r.slug}'`);
    seenSlugs.add(r.slug);

    if (!validPlacements.includes(r.placement)) {
      fail(`${ctx}: Invalid placement '${r.placement}'`);
    }

    if (r.type === "Case Study" && r.placement !== "Case Studies") {
      fail(`${ctx}: Type 'Case Study' requires placement 'Case Studies'`);
    }
    if (r.placement === "Case Studies" && r.type !== "Case Study") {
      warn(`${ctx}: Placement is 'Case Studies' but type is '${r.type}'`);
    }

    if (r.contentFormat === "downloadable" && r.placement !== "Case Studies") {
      if (!r.link) {
        fail(`${ctx}: contentFormat 'downloadable' requires 'link' field`);
      } else if (typeof r.link === "string") {
        const resolved = resolveInsightReportLink(r.link);
        const pdfPath = resolved.startsWith("/") ? path.join(PUBLIC_DIR, resolved) : null;
        if (pdfPath && !fs.existsSync(pdfPath)) {
          warn(`${ctx}: Downloadable PDF not found on disk (OK if using R2): ${pdfPath}`);
        }
      }
    }

    if (r.mdSlug) {
      const isSafe = /^[A-Za-z0-9/_-]+$/.test(r.mdSlug);
      if (!isSafe) fail(`${ctx}: Unsafe mdSlug '${r.mdSlug}'`);
      const mdPath = path.join(CONTENT_DIR, "insights-md", `${r.mdSlug}.md`);
      if (!fs.existsSync(mdPath)) warn(`${ctx}: mdSlug source file not found: ${mdPath}`);
    }

    if (r.mdxSlug) {
      const mdxPath = path.join(CONTENT_DIR, "web-articles", `${r.mdxSlug}.mdx`);
      if (!fs.existsSync(mdxPath)) warn(`${ctx}: mdxSlug source file not found: ${mdxPath}`);
    }

    if (r.image && typeof r.image === "string" && r.image.startsWith("/") && !r.image.startsWith("http")) {
      const resolved = resolveInsightImageUrl(r.image);
      const imgPath = path.join(PUBLIC_DIR, resolved);
      if (!fs.existsSync(imgPath)) warn(`${ctx}: Image not found: ${imgPath}`);
    }
  });
}

function checkNewsroom() {
  info("Checking newsroom-data.json...");
  if (!fs.existsSync(NEWSROOM_JSON_PATH)) {
    fail(`Missing ${NEWSROOM_JSON_PATH}. Run generate:newsroom first.`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(NEWSROOM_JSON_PATH, "utf8"));
  const releases = data.releases || [];
  const seenSlugs = new Set();
  const isoDateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;

  releases.forEach((pr, idx) => {
    const ctx = `PR #${idx} (${pr.slug || "unknown"})`;

    const required = ["slug", "date", "title", "industry", "subheader"];
    required.forEach((field) => {
      if (!pr[field]) fail(`${ctx}: Missing required field '${field}'`);
    });

    if (seenSlugs.has(pr.slug)) fail(`${ctx}: Duplicate slug '${pr.slug}'`);
    seenSlugs.add(pr.slug);

    if (pr.date && !isoDateOnlyRegex.test(String(pr.date))) {
      fail(`${ctx}: Invalid date '${pr.date}'. Expected 'YYYY-MM-DD' (Asia/Kolkata).`);
    }

    if (!pr.sourcePath && !pr.content) {
      fail(`${ctx}: Missing 'sourcePath' (new) and 'content' (legacy)`);
    }
    if (pr.sourcePath && typeof pr.sourcePath === "string") {
      const sourceAbs = path.join(ROOT, pr.sourcePath);
      if (!fs.existsSync(sourceAbs)) warn(`${ctx}: sourcePath file not found: ${sourceAbs}`);
    }
  });
}

function checkCodeHygiene() {
  info("Checking code hygiene...");
  const files = listFilesRecursive(".", {
    exts: [".ts", ".tsx", ".js", ".jsx", ".mjs"],
    ignoreDirs: ["node_modules", "dist", "coverage", ".git", ".next", "netlify-debug", ".turbo"],
  }).filter((f) => {
    const rel = path.relative(ROOT, f).split(path.sep).join("/");
    if (rel.startsWith("src/lib/seededRandom.ts")) return false;
    if (rel.startsWith("scripts/validate-")) return false;
    return true;
  });

  const mathRandomRe = /Math\.random\s*\(/;

  for (const abs of files) {
    const content = fs.readFileSync(abs, "utf8");
    const rel = path.relative(ROOT, abs).split(path.sep).join("/");

    if (mathRandomRe.test(content)) {
      fail(`Found Math.random usage in ${rel}. Use seededRandom instead.`);
    }

    if (content.includes("__debug_ingest")) {
      fail(`Found __debug_ingest in ${rel}. This must be DEV-gated or removed.`);
    }
  }
}

function main() {
  try {
    checkReports();
    checkNewsroom();
    checkCodeHygiene();

    if (hasError) {
      console.error("\n[FAIL] Validation failed. See errors above.");
      process.exit(1);
    } else {
      console.log("\n[PASS] Prebuild validation passed.");
    }
  } catch (e) {
    console.error("Validation crashed:", e);
    process.exit(1);
  }
}

main();
