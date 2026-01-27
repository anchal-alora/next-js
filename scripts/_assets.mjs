import fs from "node:fs";
import path from "node:path";
import { listFilesRecursive } from "./_walk.mjs";

function toPosix(p) {
  return String(p).split(path.sep).join("/");
}

function stripQueryHash(urlPath) {
  return String(urlPath ?? "").split("?")[0].split("#")[0];
}

function basenameWithoutExt(p) {
  const base = path.posix.basename(toPosix(p));
  return base.replace(/\.[^.]+$/, "");
}

function extLower(p) {
  return path.posix.extname(toPosix(p)).toLowerCase();
}

function buildIndex(rootRel, allowedExts) {
  const absRoot = path.join(process.cwd(), rootRel);
  if (!fs.existsSync(absRoot)) return null;

  const filesAbs = listFilesRecursive(rootRel, { exts: allowedExts });
  const index = new Map(); // baseName -> ext -> rel[]

  for (const abs of filesAbs) {
    const rel = toPosix(path.relative(path.join(process.cwd(), rootRel), abs));
    const base = basenameWithoutExt(rel);
    const ext = extLower(rel);
    if (!base || !ext) continue;
    let byExt = index.get(base);
    if (!byExt) {
      byExt = new Map();
      index.set(base, byExt);
    }
    const arr = byExt.get(ext) ?? [];
    arr.push(rel);
    byExt.set(ext, arr);
  }

  // Sort lists for deterministic picks.
  for (const byExt of index.values()) {
    for (const [k, arr] of byExt.entries()) {
      arr.sort((a, b) => a.length - b.length || a.localeCompare(b));
      byExt.set(k, arr);
    }
  }

  return index;
}

function pickBestRelPath(byExt, preferExts) {
  for (const ext of preferExts) {
    const candidates = byExt.get(ext);
    if (candidates && candidates.length > 0) {
      if (candidates.length > 1) {
        console.warn(
          `[assets] WARN: Multiple matches for same filename (${ext}); picking first: ${candidates[0]} (others: ${candidates
            .slice(1, 5)
            .join(", ")}${candidates.length > 5 ? ", ..." : ""})`,
        );
      }
      return candidates[0];
    }
  }

  // Fallback: any ext, deterministic order.
  const all = [];
  for (const arr of byExt.values()) all.push(...arr);
  all.sort((a, b) => a.length - b.length || a.localeCompare(b));
  return all[0] ?? null;
}

const cache = {
  imageIndex: null,
  reportIndex: null,
};

export function resolveInsightImageUrl(inputUrlPath) {
  const raw = String(inputUrlPath ?? "").trim();
  if (!raw) return raw;
  if (!raw.startsWith("/insights/image/")) return raw;

  const clean = stripQueryHash(raw);
  const base = basenameWithoutExt(clean);
  if (!base) return raw;

  const allowedExts = [".webp", ".png", ".jpg", ".jpeg", ".svg", ".gif"];
  cache.imageIndex ||= buildIndex("public/insights/image", allowedExts);
  const idx = cache.imageIndex;
  if (!idx) return raw;

  const byExt = idx.get(base);
  if (!byExt) return raw;

  const prefer = [".webp", ".png", ".jpg", ".jpeg", ".svg", ".gif"];
  const rel = pickBestRelPath(byExt, prefer);
  if (!rel) return raw;

  return `/insights/image/${rel}`;
}

export function resolveInsightReportLink(inputLink) {
  const raw = String(inputLink ?? "").trim();
  if (!raw) return raw;

  // Allow authors to provide just a filename (e.g. "foo.pdf") or any URL-ish path.
  const clean = stripQueryHash(raw);
  const base = basenameWithoutExt(clean);
  if (!base) return raw;

  const allowedExts = [".pdf"];
  cache.reportIndex ||= buildIndex("public/insights/reports", allowedExts);
  const idx = cache.reportIndex;
  if (!idx) return raw;

  const byExt = idx.get(base);
  if (!byExt) return raw;

  const rel = pickBestRelPath(byExt, [".pdf"]);
  if (!rel) return raw;

  return `/insights/reports/${rel}`;
}

