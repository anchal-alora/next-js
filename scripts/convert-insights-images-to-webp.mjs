import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const files = [
  'public/insights/image/Energy/us-advanced-energy-storage-market-outlook-2030.png',
  'public/insights/image/Healthcare/global-hospital-at-home-technology-market-outlook-2030.png',
  'public/insights/image/Technology/global-ai-infrastructure-market-outlook-2030.jpg',
  'public/insights/image/Technology/global-cybersecurity-market-outlook-2030.png',
  'public/insights/image/Technology/india-ai-infrastructure-market-outlook-2030.jpg',
  'public/insights/image/Technology/india-generative-ai-market-outlook-2030.png',
];

async function main() {
  const results = [];

  for (const inRel of files) {
    const inAbs = path.resolve(inRel);
    try {
      await fs.access(inAbs);
    } catch {
      console.warn(`skip (missing): ${inRel}`);
      continue;
    }

    const outRel = inRel.replace(/\.(png|jpe?g)$/i, '.webp');
    const outAbs = path.resolve(outRel);

    const img = sharp(inAbs);
    const meta = await img.metadata();

    // Use lossy WebP; these are photo-like images.
    // Keep quality reasonable; Next/Image will handle responsive sizing.
    await img
      .webp({ quality: 80, effort: 6 })
      .toFile(outAbs);

    const inStat = await fs.stat(inAbs);
    const outStat = await fs.stat(outAbs);

    // Only delete input if output exists and is non-trivial.
    if (outStat.size < 1024) {
      throw new Error(`Output too small, refusing to delete input: ${outRel}`);
    }

    await fs.unlink(inAbs);

    results.push({
      inRel,
      outRel,
      w: meta.width,
      h: meta.height,
      inBytes: inStat.size,
      outBytes: outStat.size,
    });
  }

  console.log('Converted to WebP and removed originals:');
  for (const r of results) {
    console.log(
      `- ${r.inRel} -> ${r.outRel} (${r.w}x${r.h}) ${(r.inBytes / 1024).toFixed(1)}KB -> ${(r.outBytes / 1024).toFixed(1)}KB`
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
