# CSV uploads (Insights)

Put one or more `.csv` files anywhere under `content/csv/`.

On `npm run dev` / `npm run build`, the site runs `npm run generate:insights` which:
- reads `content/csv/**/*.csv`
- updates `reports-link.json`
- generates MDX into `content/web-articles/` when `section_*` columns are present

## Required columns
- `id` (unique)
- `slug` (unique, used in `/insights/{slug}`)
- `type` (e.g. `Case Study`, `Market Overview`, `Article`, `Research Report`)
- `date` (any reasonable format; avoid ambiguous `01/02/2026`)
- `title`
- `description`
- `contentFormat` (`downloadable` or `non-downloadable`)
- `industry`
- `image` (must start with `/insights/image/`)
- `placement` (`Insights Hero`, `Featured Insights`, `Case Studies`, `In-Depth Research Reports`, `Recent Articles`)

## Optional columns
- `priority` (number; higher ranks first)
- `pinned` (`true/false`, `1/0`, `yes/no`)
- `link` (required when `contentFormat=downloadable`; typically `/insights/reports/<Industry>/<file>.pdf`)
- `mdxSlug` (override MDX path like `Healthcare/custom-name`)
- `taggings` (comma-separated like `AI, Security` or JSON like `["AI","Security"]`)

## MDX generation (optional)
Add any `section_*` columns (non-empty) to generate MDX automatically, for example:
- `section_executiveSummary`
- `section_keyFindings`
- `section_conclusion`

For the full architecture, see `insights-architecture.md`.

## Asset lookup (images + PDFs)
You can store assets in either:
- the root folder, or
- any subfolder (including industry folders)

The generators will search all subfolders by filename:
- Images under `public/insights/image/**`
- PDFs under `public/insights/reports/**`
