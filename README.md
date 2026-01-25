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

## Forms + downloads
- Contact, careers, and newsletter forms post to `POST /api/contact`.
- Insight gating forms post to `POST /api/lead`.
- `GET /api/download?token=...` validates a signed token and redirects to a short-lived R2 signed URL.

### R2 object keys
If a report in `reports-link.json` includes a `link` field (e.g. `/insights/reports/Industry/report.pdf`), the download handler treats that path (without the leading `/`) as the R2 object key. Upload the PDF to R2 using the same key.

## Deploying
- Deploy to Vercel.
- Set the same environment variables from `.env.example` in your Vercel project.
- Run Prisma migrations as part of your deployment flow (or via CI) before traffic cutover.
