# Team OKRs

A simple, shared OKR tracking tool for the team. Add/edit/delete objectives and
their key results, watch progress bars update, and have it all persist in the
cloud — accessible from any browser, including your iPad.

- **Frontend:** React + Vite, hosted free on **GitHub Pages**.
- **Data + login:** **Supabase** (hosted Postgres + email magic-link sign-in).
- **No server to run, no laptop needed** — GitHub Actions builds and deploys.

Live site (after setup): `https://roelblyweert.github.io/okr-tracking-tool/`

---

## One-time setup (all from the iPad browser)

### 1. Create a Supabase project
1. Go to [supabase.com](https://supabase.com) → sign up (free) → **New project**.
2. Pick a name and a database password (you won't need the password day-to-day).

### 2. Create the tables and security rules
1. In Supabase, open **SQL Editor → New query**.
2. Copy the entire contents of [`supabase/schema.sql`](supabase/schema.sql),
   paste it in, and click **Run**. This creates the `objectives` and
   `key_results` tables and the security rules that restrict access to
   `@persgroep.net` email addresses.

> The schema has changed (month timelines + an alignment trigger). Re-running
> [`supabase/schema.sql`](supabase/schema.sql) **DROPS the existing tables** and
> recreates them — there is no backwards compatibility, so any data already in
> them is lost. That's acceptable for this tool; just be aware before re-running.

> **Already have a live database?** To pick up the tightened email-domain
> security rule **without losing data**, run
> [`supabase/migrations/001_harden_domain_rls.sql`](supabase/migrations/001_harden_domain_rls.sql)
> once in the SQL Editor instead of re-running the whole schema. A brand-new
> project created from `schema.sql` already has it.

### 3. Point logins back to the app
1. In Supabase, go to **Authentication → URL Configuration**.
2. Set **Site URL** to:
   `https://roelblyweert.github.io/okr-tracking-tool/`
3. Ensure that same URL is listed under **Redirect URLs** — the magic link
   redirects the browser back to it after login. Keep this list **exact**: do
   **not** add wildcards or other origins, or a sign-in link could be redirected
   to a site that then captures the token.

> The email magic link works out of the box on Supabase's built-in mailer for
> low volume; for higher reliability you can later configure a custom SMTP
> provider under Authentication → Email.

### 3a. Invite your team (sign-in is invite-only)
The app sends a sign-in link **only to addresses that already exist** as Supabase
users (it never auto-creates accounts from the public page). So before anyone —
including you — can sign in:

1. In Supabase, go to **Authentication → Users → Add user** (or **Invite**).
2. Add each teammate's `@persgroep.net` email (add your own first).

New starters won't be able to sign in until you add them here.

### 4. Connect the app to your Supabase project
1. In Supabase, go to **Settings → API** and copy:
   - **Project URL**
   - **anon public** key  *(safe to make public — do **not** use `service_role`)*
2. In GitHub, open
   [`src/lib/supabaseClient.ts`](src/lib/supabaseClient.ts) and tap the pencil
   (edit) icon.
3. Replace the two placeholder values:
   ```ts
   export const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
   export const SUPABASE_ANON_KEY = 'your-anon-key';
   ```
4. Commit the change **on a branch and open a Pull Request** (see below) — not
   directly to `master`.

### 5. Turn on GitHub Pages
1. In GitHub, go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.

### 6. Go live
- Merge the open Pull Request into `master`. The **Deploy** workflow runs
  automatically and publishes the site. Watch progress under the **Actions** tab.
- Once it's green, open the live URL on your iPad and sign in with your
  `@persgroep.net` email.

---

## How changes go live (branching)

This project **never** commits straight to `master`. Every change:

1. lands on a feature branch and opens a **Pull Request → `master`**;
2. must pass **CI** (type-check + build) — the health gate;
3. is reviewed and **merged** by you;
4. the merge triggers the **Deploy** workflow → live site updates.

So nothing reaches the live site without a reviewed, merged PR.

## Daily use

Just open the live URL and sign in. Anyone on the team with a `@persgroep.net`
email can sign in and they all see and edit the same OKRs. Data persists in
Supabase.

## Security hardening checklist (Supabase dashboard)

The live site is public, so **Row-Level Security is the only thing protecting the
data**. A few settings live in the Supabase dashboard (not in this repo) and are
worth checking once and after any change:

- **RLS stays on.** Both `objectives` and `key_results` must keep RLS enabled
  with the `@persgroep.net` policies from [`supabase/schema.sql`](supabase/schema.sql).
  Never disable it.
- **Email confirmation ON.** Authentication → Providers → Email: require email
  confirmation, so the `email` claim in the JWT (which the RLS policy trusts) is
  actually owned by the signer.
- **Exact redirect URLs.** Authentication → URL Configuration: Site URL and
  Redirect URLs set to exactly the live URL — no wildcards or extra origins.
- **Anonymous sign-ins OFF.** Authentication → Providers: anonymous users have no
  email, so they're already denied by RLS — keep the provider disabled anyway.
- **Invite-only.** The app uses `shouldCreateUser: false`; add team members under
  Authentication → Users (see step 3a above).
- **Never expose `service_role`.** Only the `anon`/publishable key belongs in this
  repo. The `service_role` key bypasses RLS — keep it out of the codebase entirely.

> **Clickjacking note:** GitHub Pages can't set HTTP response headers, and a
> `<meta>` CSP can't use `frame-ancestors`, so framing isn't blocked at the
> hosting layer. That's an accepted limitation for this internal tool.

## Project layout

See [`CLAUDE.md`](CLAUDE.md) for the full file map and engineering guardrails.
