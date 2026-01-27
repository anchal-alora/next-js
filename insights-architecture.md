Architecture document based on the scripts:

## Content Upload Architecture

### Overview
This system supports three methods for uploading insights:
1. CSV files (auto-generates MDX and JSON)
2. Markdown files in `content/insights-md/` (auto-indexes to JSON)
3. Manual JSON entries (not recommended)

For newsroom articles:
- Markdown files in `content/newsroom/` (auto-generates JSON)

---

## Part 1: Uploading Insights via CSV Files

### Step-by-Step Process

#### Step 1: Create CSV File
Create a CSV file in `content/csv/` (or any subdirectory) with the following required columns:

**Required Columns:**
- `id` - Unique identifier
- `slug` - URL slug (e.g., `my-insight-slug`)
- `type` - Type: `"Case Study"`, `"Market Overview"`, `"Article"`, `"Research Report"`
- `date` - Date in any format (auto-normalized to `YYYY-MM-DD`)
- `title` - Title
- `description` - Short description
- `contentFormat` - `"downloadable"` or `"non-downloadable"`
- `industry` - Industry name (e.g., `"Healthcare"`, `"Technology"`)
- `image` - Image path starting with `/insights/image/`
- `placement` - One of: `"Insights Hero"`, `"Featured Insights"`, `"Case Studies"`, `"In-Depth Research Reports"`, `"Recent Articles"`

**Optional Columns:**
- `priority` - Number (default: 0)
- `pinned` - Boolean (default: false)
- `link` - PDF path for downloadable reports (e.g., `"/Healthcare/report.pdf"`)
- `mdxSlug` - Custom MDX path (e.g., `"Healthcare/custom-name"`)
- `taggings` - Comma-separated tags or JSON array

**MDX Generation Columns (Optional):**
- `section_executiveSummary` - Content for Executive Summary section
- `section_keyFindings` - Content for Key Findings section
- `section_howItWorks` - Content for How It Works section
- `section_templateFields` - Content for Template Fields section
- `section_scalingTips` - Content for Scaling Tips section
- `section_recommendedNaming` - Content for Recommended Naming section
- `section_conclusion` - Content for Conclusion section
- Any `section_*` column (auto-detected)

#### Step 2: Run Generation Script
```bash
npm run generate:insights
```

#### Step 3: What Happens Automatically

**Architecture Flow:**

```
CSV File (content/csv/**/*.csv)
    ↓
[generate-insights-content.mjs]
    ├─→ Validates CSV with Zod schema
    ├─→ Normalizes dates to YYYY-MM-DD (Asia/Kolkata)
    ├─→ Auto-resolves image extensions (.png, .jpg, .webp, etc.)
    ├─→ Merges with existing reports-link.json (CSV wins on conflicts)
    │
    ├─→ MDX Generation (if section_* columns exist OR mdxSlug provided):
    │   ├─→ Auto-generates mdxSlug: "Industry/slug" (if not provided)
    │   ├─→ Converts section_* columns to MDX structure:
    │   │   - section_executiveSummary → ## Executive Summary
    │   │   - section_keyFindings → ## Key Findings
    │   │   - (converts camelCase to Title Case)
    │   ├─→ Writes MDX to: content/web-articles/<Industry>/<slug>.mdx
    │   └─→ Adds # Title as H1 at the top
    │
    └─→ Updates reports-link.json
        ├─→ Adds/updates report entry
        ├─→ Sets mdxSlug field (if MDX generated)
        └─→ Preserves _meta section
```

**MDX Auto-Generation Logic:**
- If `mdxSlug` is provided in CSV → uses that path
- If `mdxSlug` is empty but `section_*` columns exist → auto-generates `mdxSlug` as `"Industry/slug"`
- If neither exists → no MDX file generated

**Example CSV Row:**
```csv
id,slug,type,date,title,description,contentFormat,industry,image,placement,section_executiveSummary,section_keyFindings
my-id,my-insight,Case Study,2026-01-27,My Case Study,Description,non-downloadable,Healthcare,/insights/image/Healthcare/my-image.webp,Case Studies,"This is the executive summary content.","Key finding 1, Key finding 2"
```

**Result:**
- Creates `content/web-articles/Healthcare/my-insight.mdx`
- Adds entry to `reports-link.json` with `mdxSlug: "Healthcare/my-insight"`

---

## Part 2: Uploading Insights via Markdown Files

### Step-by-Step Process

#### Step 1: Create Markdown File
Create a markdown file in `content/insights-md/` (or subdirectories)

**Required Frontmatter:**
```yaml
---
title: Your Insight Title
industry: Healthcare
description: Brief description
type: Market Overview  # or "Case Study", "Article", "Research Report"
placement: Recent Articles  # or "Insights Hero", "Featured Insights", "Case Studies", etc.
contentFormat: non-downloadable  # or "downloadable"
tags:
  - Tag 1
  - Tag 2
---

## Your Content Here
```

**Optional Frontmatter:**
- `id` - Auto-generated if not provided (from slug hash)
- `date` - Auto-assigned to today (Asia/Kolkata) if not provided
- `slug` - Auto-generated from filename if not provided
- `image` - Image path
- `link` - PDF path (required if `contentFormat: downloadable`)
- `priority` - Number (default: 0)
- `pinned` - Boolean (default: false)

**Important:**
- For Case Studies: `type` must be `"Case Study"` and `placement` must be `"Case Studies"`
- If `contentFormat: downloadable`, `link` is required

#### Step 2: Run Indexing Script
```bash
npm run index:insights-md
```

#### Step 3: What Happens Automatically

**Architecture Flow:**

```
Markdown Files (content/insights-md/**/*.md)
    ↓
[index-insights-md.mjs]
    ├─→ Parses frontmatter with gray-matter
    ├─→ Validates with Zod schema
    ├─→ Generates slug from filename (if not in frontmatter)
    ├─→ Generates id from slug hash (if not in frontmatter)
    ├─→ Computes mdSlug from file path (safe, sanitized)
    │   - Example: content/insights-md/Healthcare/my-file.md
    │   - mdSlug: "Healthcare/my-file"
    ├─→ Normalizes date to YYYY-MM-DD (preserves existing dates)
    │
    └─→ Updates reports-link.json
        ├─→ New entries: Adds report with mdSlug field
        ├─→ Existing entries with mdSlug: Updates in place
        ├─→ Existing entries with mdxSlug: Skips (won't overwrite)
        └─→ Existing entries without mdSlug: Skips (won't overwrite)
```

**Key Features:**
- Non-interference: Won't modify entries that already have `mdxSlug`
- Safe slug generation: Sanitizes file paths to prevent path traversal
- Date preservation: Keeps existing dates for same slugs
- Migration support: Migrates invalid `mdSlug` values to safe computed ones

**Case Study Support:**
- Case studies CAN use `.md` files via `mdSlug`
- The system supports both `mdxSlug` (MDX) and `mdSlug` (Markdown) for case studies
- Both render correctly in `CaseStudyDetailLayout`

---

## Part 3: Uploading Newsroom Articles (PR)

### Step-by-Step Process

#### Step 1: Create Markdown File
Create a markdown file in `content/newsroom/` (or subdirectories)

**Required Frontmatter:**
```yaml
---
title: Your Press Release Title
industry: Healthcare
subheader: Compelling subheader text
---
```

**Optional Frontmatter:**
- `date` - Ignored (auto-assigned/preserved)
- `slug` - Auto-generated from filename if not provided
- `tags` - Array of tags
- `summary` - Auto-extracted from first 2 lines if not provided

#### Step 2: Run Generation Script
```bash
npm run generate:newsroom
```

#### Step 3: What Happens Automatically

**Architecture Flow:**

```
Markdown Files (content/newsroom/**/*.{md,txt})
    ↓
[generate-newsroom.mjs]
    ├─→ Parses frontmatter with gray-matter
    ├─→ Validates required fields (title, industry, subheader)
    ├─→ Generates slug from filename (if not in frontmatter)
    │   - Converts to lowercase, replaces non-alphanumeric with hyphens
    ├─→ Extracts summary from content (if not in frontmatter)
    │   - Takes first 2 non-empty lines
    │   - Strips markdown formatting
    │   - Truncates to 200 characters
    ├─→ Date handling:
    │   - Ignores frontmatter date
    │   - Preserves existing date from newsroom-data.json (if slug exists)
    │   - Assigns today's date (Asia/Kolkata) for new slugs
    │
    └─→ Updates newsroom-data.json
        ├─→ Adds/updates release entry
        ├─→ Sets sourcePath to markdown file path
        ├─→ Sorts by date (newest first)
        └─→ Preserves _meta section
```

**Key Features:**
- Auto-summary extraction from content
- Date stability: Preserves dates for existing slugs across builds
- Markdown files take precedence over JSON entries
- Invalid files (missing required fields) are skipped with warnings

---

## Part 4: Build Process Integration

### Complete Build Workflow

```bash
npm run build
```

**Execution Order:**
1. `content:prepare` - Runs all content steps (see below)
2. `next build` - Builds the site (App Router)

`content:prepare` runs:
1. `optimize:images` - Converts insight images to WebP (safe/no-op if none)
2. `generate:insights` - Processes CSV → generates MDX + updates `reports-link.json`
3. `generate:newsroom` - Processes newsroom markdown → updates `newsroom-data.json`
4. `index:insights-md` - Processes insights markdown → updates `reports-link.json`
5. `validate:content` - Validates content + JSON integrity

### Development Workflow

```bash
npm run dev
```

**Execution Order:**
1. `content:prepare` - Runs all content steps (same as build)
2. `next dev` - Starts the dev server

---

## Summary: Auto-Population Features

### ✅ CSV to MDX Conversion
- YES: CSV files with `section_*` columns automatically generate MDX files
- MDX files written to: `content/web-articles/<Industry>/<slug>.mdx`
- Auto-generates `mdxSlug` field in JSON if not provided

### ✅ Auto-Populate JSON from Markdown Files
- YES: `index:insights-md` automatically indexes markdown files to `reports-link.json`
- YES: `generate:newsroom` automatically indexes markdown files to `newsroom-data.json`

### ✅ Auto-Populate JSON from CSV Files
- YES: `generate:insights` automatically processes CSV files and updates `reports-link.json`
- Auto-generates `mdxSlug` if `section_*` columns exist

### ✅ Case Studies with Markdown
- YES: Case studies can use `.md` files via `mdSlug` field
- Supports both `.mdx` (via `mdxSlug`) and `.md` (via `mdSlug`) files

---

## File Structure

```
content/
├── csv/                    # CSV files for insights (auto-generates MDX + JSON)
│   └── **/*.csv
├── insights-md/           # Markdown files for insights (auto-indexes to JSON)
│   └── **/*.md
├── web-articles/          # Auto-generated/managed MDX files (from CSV)
│   └── <Industry>/
│       └── <slug>.mdx
└── newsroom/              # Markdown files for newsroom (auto-generates JSON)
    └── **/*.{md,txt}

public/
└── insights/
    ├── image/             # Insight images
    │   └── <Industry>/
    │       └── *.webp
    └── reports/           # Downloadable PDFs
        └── <Industry>/
            └── *.pdf

reports-link.json          # Auto-generated from CSV + Markdown
newsroom-data.json         # Auto-generated from Markdown
```

---

## Best Practices

1. CSV files: Use for bulk uploads or when you need auto-MDX generation
2. Markdown files: Use for individual insights with full control over content
3. Images: Always use `.webp` format, place in `public/insights/image/<Industry>/`
4. PDFs: Place downloadable reports in `public/insights/reports/<Industry>/`
5. Dates: Use `YYYY-MM-DD` format or let the system auto-normalize
6. Slugs: Use lowercase, hyphens, no spaces (auto-sanitized if needed)

---

## Troubleshooting

**CSV not generating MDX:**
- Ensure `section_*` columns exist OR provide `mdxSlug` column
- Check that `generate:insights` script ran successfully

**Markdown not appearing in JSON:**
- Run `npm run index:insights-md` for insights
- Run `npm run generate:newsroom` for newsroom
- Check that required frontmatter fields are present

**Case Study issues:**
- Ensure `type: "Case Study"` AND `placement: "Case Studies"`
- Can use either `.mdx` (via `mdxSlug`) or `.md` (via `mdSlug`) files

---

This architecture supports automated content management with minimal manual JSON editing.
