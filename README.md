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
