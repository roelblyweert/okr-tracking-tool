# CLAUDE.md — Team OKR Tracking Tool

Project standards and guardrails. Read this before making changes.

## What this is

A simple OKR tracking tool for the team. A static React single-page app hosted
on **GitHub Pages** (UI + all OKR logic) that talks directly to **Supabase**
(hosted Postgres + auth) for shared, persistent data. There is no custom
server. The whole thing is built and deployed in CI — assume **no local dev
machine** is ever available (the owner works from an iPad).

Live URL: `https://roelblyweert.github.io/okr-tracking-tool/`

## Tech stack

- **Vite + React + TypeScript** (strict mode).
- **@supabase/supabase-js** for data + auth.
- Plain CSS in `src/styles.css`, mobile-first (iPad). No UI framework.
- Keep dependencies minimal.

## Branching strategy (hard rule)

- **Never commit directly to `master`.**
- Work on a feature branch → open a **Pull Request to `master`**.
- `.github/workflows/ci.yml` (type-check + build) is the PR health gate.
- A human reviews and **merges**. Merging into `master` is the ONLY thing that
  triggers `.github/workflows/deploy.yml` and updates the live site.
- "Going live" therefore always means an approved, merged PR. Do not bypass
  this with per-branch preview deploys (there is a single Pages environment).

## Security & secrets

- The Supabase **anon** key is designed to be public; it lives in committed
  source (`src/lib/supabaseClient.ts`). That's fine.
- **NEVER** commit the Supabase `service_role` key, or any other secret/token,
  anywhere in the repo.
- **Row-Level Security (RLS) is the only thing protecting the data** — the page
  itself is public. Policies (see `supabase/schema.sql`) restrict all access to
  signed-in users whose email ends in `@persgroep.net`. Every table must have
  domain-gated RLS. **Never disable RLS.**

## Code conventions

- **All database access goes through `src/api.ts`** wrapper functions. Do not
  scatter raw Supabase queries across components.
- Keep `vite.config.ts` `base: '/okr-tracking-tool/'` — it must match the Pages
  project path (i.e. the repository name) or assets break in production.
- Progress math lives in `src/progress.ts`; reuse it, don't reinvent.

## Design language

- The UI follows **Perdoo's** clean **light** product look (the OKR SaaS at
  `perdoo.com`): off-white page, white softly-shadowed cards, brand-black ink,
  slate muted text, sky-blue primary. **All design tokens live in the `:root`
  block of `src/styles.css`** — reuse them; don't hard-code colors in components.
- **Status-first (Perdoo's hallmark).** Every objective and key result shows an
  **On track / At risk / Off track** status as a colored pill plus a
  status-colored progress/roadmap bar. Status is **pace-based**: `okrStatus()` in
  `src/progress.ts` compares actual progress to the progress expected for the
  elapsed share of the OKR's window. Keep this logic in `src/progress.ts`.
- **Fonts must be self-hosted.** The typeface is Plus Jakarta Sans, bundled via
  `@fontsource-variable/plus-jakarta-sans` and imported once in `src/main.tsx`.
  The strict CSP (`font-src 'self'`, see `index.html`) forbids external fonts —
  **never** add a Google Fonts CDN or any external font/style URL; bundle it.
- Stay mobile-first (iPad): keep ≥44px tap targets and ≥16px inputs (avoids iOS
  zoom).

## Key files

| Path                          | Purpose                                  |
| ----------------------------- | ---------------------------------------- |
| `src/lib/supabaseClient.ts`   | Supabase client + URL/anon-key config    |
| `src/api.ts`                  | All DB reads/writes (CRUD wrappers)      |
| `src/types.ts`                | `Objective` / `KeyResult` types          |
| `src/progress.ts`             | Progress % + pace-based OKR status        |
| `src/main.tsx`                | Entry point + self-hosted font import     |
| `src/App.tsx`                 | Auth gate + dashboard + handlers         |
| `src/components/`             | UI (Auth, ObjectiveCard, forms, etc.)    |
| `supabase/schema.sql`         | Tables + RLS (run once in Supabase)      |
| `.github/workflows/`          | `ci.yml` (PR gate) + `deploy.yml` (live) |

## Setup

See `README.md` for the one-time Supabase + GitHub Pages setup (all doable from
the iPad browser).
