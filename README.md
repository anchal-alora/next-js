# Alora Advisory (Next.js Rebuild)

Fresh Next.js (App Router) rebuild of the Alora Advisory site with server-first rendering, SEO/GEO optimization, and Vercel-ready infrastructure (Neon + Prisma, Resend, QStash, Cloudflare R2).

## Stack
- Next.js App Router + TypeScript + Tailwind
- Neon Postgres + Prisma
- Resend for transactional email
- Upstash QStash for CRM sync queueing
- Cloudflare R2 for gated downloads (signed URLs)

## Local setup

1) Install dependencies

```bash
npm install
```

2) Configure environment

```bash
cp .env.example .env.local
```

Fill in `.env.local` with your Neon, Resend, QStash, and R2 credentials. Add:
- `NEXT_PUBLIC_SITE_URL` for canonical URLs
- `NEXT_PUBLIC_GTM_CONTAINER_ID` if GTM should load

3) Prisma client + database

```bash
npm run prisma:generate
npm run prisma:migrate
```

4) Run the dev server

```bash
npm run dev
```

`npm run dev` includes a content watcher: saving files under `content/` or `public/insights/image/` re-indexes automatically.
If you want “run once then start dev server”, use `npm run dev:once`.

## Forms + downloads
- Contact, careers, and newsletter forms post to `POST /api/contact`.
- Insight gating forms post to `POST /api/lead`.
- `GET /api/download?token=...` validates a signed token and redirects to a short-lived R2 signed URL.

### R2 object keys
If a report in `reports-link.json` includes a `link` field (e.g. `/insights/reports/Industry/report.pdf`), the download handler treats that path (without the leading `/`) as the R2 object key. Upload the PDF to R2 using the same key.

## Content authoring (non-dev friendly)
This repo auto-builds the Insights + Newsroom indexes from files in `content/` when you run `npm run dev` or `npm run build`.

Start here: `CONTENT_GUIDE.md`.

### Add an Insight (recommended: Markdown)
1) Add a markdown file to `content/insights-md/` (you can use subfolders).
2) Add the image to `public/insights/image/<Industry>/` (use `.webp` if possible).
3) Run `npm run dev` (or commit + deploy). The site auto-updates `reports-link.json`.

### Add many Insights (CSV bulk upload)
1) Add a CSV file to `content/csv/` with the required columns (see `insights-architecture.md`).
2) If you include `section_*` columns, the build auto-generates MDX into `content/web-articles/`.
3) Run `npm run build` (or commit + deploy).

### Add a Newsroom article
1) Add a markdown file to `content/newsroom/`.
2) Run `npm run dev` or `npm run build`. The site auto-updates `newsroom-data.json`.

### Notes
- If you add `.png/.jpg` insight images, `npm run build` will auto-generate a `.webp` version (set `OPTIMIZE_IMAGES=0` to skip).
- Downloadable reports (`contentFormat: downloadable`) need a `link` field; upload the PDF to R2 using the same object key as the link path (minus the leading `/`).

## Deploying
- Deploy to Vercel.
- Set the same environment variables from `.env.example` in your Vercel project.
- Run Prisma migrations as part of your deployment flow (or via CI) before traffic cutover.

## Web Hygiene Hardening
This repo includes a minimal “web hygiene” hardening pass focused on predictable server-rendered HTML, crawler accessibility, and reduced false-positives for automated scanners.

### What’s implemented (and why)
- **SSR/SSG HTML visibility**: Critical public pages are Server Components by default (no `"use client"` at the page level), so “View Source” contains real headings/paragraphs instead of empty shells.
- **Robots + sitemap**: `src/app/robots.ts` and `src/app/sitemap.ts` serve `robots.txt` and `sitemap.xml` without auth/challenges. The sitemap includes canonical public routes plus Insights/Newsroom/Team slugs.
- **Canonical URL base**: `src/app/layout.tsx` sets `metadataBase` from `NEXT_PUBLIC_SITE_URL` so canonicals/sitemap always point to the correct production domain.
- **Redirect hygiene**: Only required redirect is kept (`/who-we-are` → `/about`) in `next.config.ts`. Host redirects (`www` → apex, HTTP → HTTPS) are handled in Vercel domain settings to avoid redirect chains.
- **Security headers (safe baseline)**: `next.config.ts` sets conservative headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) without adding CSP that could break GTM/analytics.

### Third-party domains (expected)
- `www.googletagmanager.com` — GTM loader (only if `NEXT_PUBLIC_GTM_CONTAINER_ID` is set).
- Vercel Analytics/Speed Insights endpoints — loaded via `@vercel/analytics` and `@vercel/speed-insights`.

### Verification checklist (run after deploy)
HTML content present (should include visible headings/paragraphs in output):
```bash
curl -sL https://aloraadvisory.com/ | head -n 80
curl -sL https://aloraadvisory.com/about | head -n 80
curl -sL https://aloraadvisory.com/services | head -n 80
curl -sL https://aloraadvisory.com/contact | head -n 80
```

Robots + sitemap accessible:
```bash
curl -I https://aloraadvisory.com/robots.txt
curl -I https://aloraadvisory.com/sitemap.xml
curl -s https://aloraadvisory.com/robots.txt
```

Headers present:
```bash
curl -I https://aloraadvisory.com/
```
