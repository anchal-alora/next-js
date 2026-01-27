# Markdown uploads (Newsroom)

Put `.md` (or `.txt`) files anywhere under `content/newsroom/`.

On `npm run dev` / `npm run build`, the site runs `npm run generate:newsroom` which auto-updates `newsroom-data.json`.

## Required frontmatter
```yaml
---
title: Your Press Release Title
industry: Healthcare
subheader: Compelling subheader text
---
```

## Optional frontmatter
- `slug` (otherwise generated from filename)
- `tags` (YAML array)
- `summary` (otherwise extracted from the first 2 non-empty lines)

## Date behavior (by design)
Newsroom `date` is **not** taken from frontmatter:
- If the slug already exists in `newsroom-data.json`, its date is preserved (stable across builds).
- If the slug is new, the date is set to “today” in Asia/Kolkata.

