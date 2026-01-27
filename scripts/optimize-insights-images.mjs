/**
 * optimize-insights-images.mjs
 *
 * Converts any .png/.jpg/.jpeg images under public/insights/image/** to .webp.
 * By default it keeps the originals.
 *
 * Set DELETE_ORIGINALS=1 to remove the original files after verifying output.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { listFilesRecursive } from "./_walk.mjs";

const IMAGE_ROOT = "public/insights/image";
const LOSSY_QUALITY = 80;

async function main() {
  if (String(process.env.OPTIMIZE_IMAGES ?? "").trim() === "0") {
    console.log("[optimize:images] OPTIMIZE_IMAGES=0, skipping image optimization.");
    return;
  }

  let sharp;
  try {
    const mod = await import("sharp");
    sharp = mod.default ?? mod;
  } catch {
    console.warn("[optimize:images] sharp not installed; skipping image optimization.");
    return;
  }

  const rootAbs = path.join(process.cwd(), IMAGE_ROOT);
  try {
    await fs.access(rootAbs);
  } catch {
    console.log(`[optimize:images] ${IMAGE_ROOT}/ not found. Skipping.`);
    return;
  }

  const inputs = listFilesRecursive(IMAGE_ROOT, { exts: [".png", ".jpg", ".jpeg"] });
  if (inputs.length === 0) {
    console.log("[optimize:images] No convertible images found. Skipping.");
    return;
  }

  const deleteOriginals = String(process.env.DELETE_ORIGINALS ?? "").trim() === "1";
  const results = [];

  for (const inAbs of inputs) {
    const inRel = path.relative(process.cwd(), inAbs);
    const outAbs = inAbs.replace(/\.(png|jpe?g)$/i, ".webp");
    const outRel = path.relative(process.cwd(), outAbs);

    try {
      await fs.access(outAbs);
      continue; // already exists
    } catch {
      // continue
    }

    const img = sharp(inAbs);
    const meta = await img.metadata();
    await img.webp({ quality: LOSSY_QUALITY, effort: 6 }).toFile(outAbs);

    const inStat = await fs.stat(inAbs);
    const outStat = await fs.stat(outAbs);
    if (outStat.size < 1024) {
      throw new Error(`[optimize:images] Output too small, refusing: ${outRel}`);
    }

    if (deleteOriginals) {
      await fs.unlink(inAbs);
    }

    results.push({
      inRel,
      outRel,
      w: meta.width,
      h: meta.height,
      inBytes: inStat.size,
      outBytes: outStat.size,
      deleted: deleteOriginals,
    });
  }

  if (results.length === 0) {
    console.log("[optimize:images] No conversions needed.");
    return;
  }

  console.log(`[optimize:images] Converted ${results.length} image(s) to WebP${deleteOriginals ? " and removed originals" : ""}:`);
  for (const r of results) {
    console.log(
      `- ${r.inRel} -> ${r.outRel} (${r.w ?? "?"}x${r.h ?? "?"}) ${(r.inBytes / 1024).toFixed(1)}KB -> ${(r.outBytes / 1024).toFixed(1)}KB`,
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
