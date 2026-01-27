# Content Checklist (Non‑Dev Friendly)

This website auto-builds the **Insights** and **Newsroom** sections from files you add under `content/`.

You typically only need to:
- add a `.md` file (or a `.csv` for bulk)
- add an image (and a PDF if it’s a downloadable report)
- run `npm run dev` (local) or deploy (build runs in CI)

## Before you start (quick rules)
- **Slugs must be unique** (the slug becomes the URL like `/insights/my-slug`).
- **Industry must match the folder name** you use for images/PDFs (e.g. `Healthcare`, `Technology`).
- **Images can live anywhere under** `public/insights/image/` (root or any subfolder). The system finds them by filename.
- **Downloadable PDFs** can live anywhere under `public/insights/reports/` locally (root or subfolders). The system finds them by filename.
  - For production gated downloads, upload the PDF to **R2** using the same object key as the final `link` path (without the leading `/`).
- The system uses **Asia/Kolkata (IST)** for “today’s date”.

## Option A (recommended): Add 1 Insight as Markdown

### Step 1 — Create the markdown file
Create a file in `content/insights-md/` (subfolders allowed).

Use this frontmatter template at the top:
```yaml
---
title: Your Insight Title
industry: Healthcare
description: Brief description for cards
type: Market Overview        # or Case Study, Article, Research Report
placement: Recent Articles   # or Insights Hero / Featured Insights / Case Studies / In-Depth Research Reports
contentFormat: non-downloadable  # or downloadable
tags:
  - Tag 1
  - Tag 2

# Optional (only use if you know you need them):
# slug: your-custom-slug
# id: your-stable-id
# date: 2026-01-27
# image: /insights/image/Healthcare/your-image.webp
# link: /insights/reports/Healthcare/your-report.pdf   # required if contentFormat: downloadable
# priority: 0
# pinned: false
---
```

### Step 2 — Add the image
Add your image file anywhere under:
- `public/insights/image/`

Examples:
- `public/insights/image/my-insight.webp`
- `public/insights/image/Healthcare/my-insight.webp`

Then reference it in your markdown frontmatter:
```yaml
image: /insights/image/Healthcare/my-insight.webp
```

Tip: If you upload a `.png`/`.jpg`, the build can auto-create a `.webp` version. (Details below.)

### Step 3 — (If downloadable) add the PDF
If you set `contentFormat: downloadable`, you must also set:
```yaml
link: /insights/reports/Healthcare/my-report.pdf
```

And make sure the PDF exists in storage:
- Production downloads use R2 object keys derived from `link` (minus the leading `/`).
 - Locally, the PDF can be anywhere under `public/insights/reports/` (root or subfolders) as long as the filename matches.

### Step 4 — Run the site
Run:
```bash
npm run dev
```
or (for production build):
```bash
npm run build
```

In dev, `npm run dev` also runs a watcher: when you edit/add files under `content/` or `public/insights/image/`, it automatically re-indexes and re-validates content.
If you ever want the old “single run then start dev server” behavior, run:
```bash
npm run dev:once
```

## Option B: Add many Insights as CSV (bulk upload)

### Step 1 — Put a CSV file in place
Put your CSV in `content/csv/` (subfolders allowed).

Required columns:
- `id`, `slug`, `type`, `date`, `title`, `description`, `contentFormat`, `industry`, `image`, `placement`

Optional columns:
- `priority`, `pinned`, `link`, `mdxSlug`, `taggings`, and any `section_*` columns

### Step 2 — Add images (and PDFs if needed)
- Images: `public/insights/image/<Industry>/...`
- PDFs (downloadable): uploaded to R2 using the same key as your `link`

### Step 3 — Run build (or deploy)
```bash
npm run build
```

### When does CSV generate MDX automatically?
If your CSV row includes any non-empty `section_*` columns (like `section_executiveSummary`), the build generates an MDX file into:
- `content/web-articles/<Industry>/<slug>.mdx`

The JSON entry will get an `mdxSlug` so the site loads that MDX automatically.

## Option C: Add a Newsroom article (PR)

### Step 1 — Create the markdown file
Create a file in `content/newsroom/` with frontmatter:
```yaml
---
title: Your Press Release Title
industry: Healthcare
subheader: A compelling subheader
---
```

### Step 2 — Run
```bash
npm run dev
```
or:
```bash
npm run build
```

## What runs automatically (you don’t need to do this manually)
Both `npm run dev` and `npm run build` run a content pipeline first:
1) Image optimization (optional): converts `.png/.jpg` → `.webp`
2) CSV ingestion: updates `reports-link.json` and may generate MDX
3) Newsroom indexing: updates `newsroom-data.json`
4) Insights markdown indexing: updates `reports-link.json`
5) Validation: blocks the build if content is broken

## Image optimization (what it is and what it changes)
The script `scripts/optimize-insights-images.mjs` scans:
- `public/insights/image/**`
and converts any `.png/.jpg/.jpeg` to `.webp`.

Important:
- By default it **does not delete** your original `.png/.jpg`.
- It will **skip** files that already have a `.webp`.

### Does JSON automatically change from .png/.jpg to .webp?
Yes **in many cases**, but it depends on how the content is authored:
- **CSV-driven Insights**: `generate:insights` tries to resolve the best extension and **prefers `.webp`**. So if a `.webp` exists, the `image` field in `reports-link.json` can be written as `.webp` even if the CSV said `.png`.
- **Markdown-driven Insights**: `index:insights-md` also resolves the image path and prefers `.webp` if it exists, so `reports-link.json` will typically point to `.webp` after you run `npm run dev`/`npm run build`.

If you want to skip image optimization entirely:
```bash
OPTIMIZE_IMAGES=0 npm run build
```

## Validation (why a build might fail)
The script `scripts/validate-content.mjs` runs at the end of the pipeline.

If it finds a **hard error** (examples: missing required fields, duplicate slugs/IDs, invalid dates), it **exits with failure** and the website **will not build**. This prevents broken content from shipping.

What to do if validation fails:
- Read the error text in the terminal; it tells you which file/entry is wrong.
- Fix the content file (CSV or markdown) and re-run `npm run build`.
