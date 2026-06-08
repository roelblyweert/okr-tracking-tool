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

### 3. Point logins back to the app
1. In Supabase, go to **Authentication → URL Configuration**.
2. Set **Site URL** to:
   `https://roelblyweert.github.io/okr-tracking-tool/`
3. Ensure that same URL is listed under **Redirect URLs** — the magic link
   redirects the browser back to it after login.

> The email magic link works out of the box on Supabase's built-in mailer for
> low volume; for higher reliability you can later configure a custom SMTP
> provider under Authentication → Email.

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

## Project layout

See [`CLAUDE.md`](CLAUDE.md) for the full file map and engineering guardrails.
