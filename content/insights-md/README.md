# Markdown uploads (Insights)

Put `.md` files anywhere under `content/insights-md/`.

On `npm run dev` / `npm run build`, the site runs `npm run index:insights-md` which auto-updates `reports-link.json`.

## Required frontmatter
```yaml
---
title: Your Insight Title
industry: Healthcare
description: Brief description for cards + SEO
type: Market Overview # or "Case Study", "Article", "Research Report"
placement: Recent Articles # or "Insights Hero", "Featured Insights", "Case Studies", "In-Depth Research Reports"
contentFormat: non-downloadable # or "downloadable"
tags:
  - Tag 1
  - Tag 2
---
```

## Optional frontmatter
- `id` (otherwise generated from the slug)
- `slug` (otherwise generated from filename)
- `date` (used only when the slug is NEW; existing slugs keep their date for stability)
- `image` (recommended; must start with `/insights/image/`; the build will find the real file anywhere under `public/insights/image/**` by filename)
- `link` (required when `contentFormat: downloadable`; the build will find the real file anywhere under `public/insights/reports/**` by filename)
- `priority` (number)
- `pinned` (boolean)

## Content rules
- Avoid using a Markdown H1 (`# ...`) inside the body; the page template uses the title as the H1.
