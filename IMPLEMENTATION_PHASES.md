# Implementation Phases (Ship Safely)

This project follows the phased rebuild plan from `Final-old/NEXTJS_REBUILD_PLAN.md`, adapted for the current Next.js codebase in `next-js/`.

## Phase 1 — Foundation
- Ensure environment variables are set (`.env.local`).
- Run Prisma generate/migrations.
- Confirm `next dev` boots and the base layout renders.

## Phase 2 — Core UI + Layout
- Verify header/footer/navigation parity with the legacy site.
- Confirm global typography and section spacing match expected layout.

## Phase 3 — Content Layer
- Validate `reports-link.json`, `newsroom-data.json`, and `/content` are present.
- Confirm markdown rendering is server-side and visible in page HTML.

## Phase 4 — Routes
- Static pages: `/`, `/services`, `/industries`, `/who-we-are`, `/careers`, `/contact`.
- Dynamic pages: `/insights`, `/insights/explore`, `/insights/[slug]`, `/newsroom`, `/newsroom/[slug]`, `/team/[slug]`.

## Phase 5 — SEO + GEO
- Confirm per-route metadata, canonical tags, JSON-LD.
- Validate `/sitemap.xml`, `/robots.txt`, RSS feeds, and `/llms.txt`.
- Ensure `/insights/explore` query variants are `noindex,follow`.

## Phase 6 — Forms + Gated Downloads
- `POST /api/contact` for contact/careers/newsletter.
- `POST /api/lead` for report gating.
- `GET /api/download?token=...` for signed R2 URLs.

## Phase 7 — Performance + Launch
- Lighthouse checks for LCP/CLS and JS payload.
- Vercel deploy + domain cutover.
- Monitor 404s and form submission logs post-launch.
