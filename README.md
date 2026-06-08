# Team OKRs

A simple, shared OKR tracking tool for the team. Add/edit/delete objectives and
their key results, watch progress bars update, and have it all persist in the
cloud — accessible from any browser, including your iPad.

- **Frontend:** React + Vite, hosted free on **GitHub Pages**.
- **Data + login:** **Supabase** (hosted Postgres + Google sign-in, with
  email magic-link as a fallback).
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
3. Ensure that same URL is listed under **Redirect URLs** — both the Google
   sign-in and the magic link redirect the browser back to it after login.

> The email magic link is now a **fallback**. **Google sign-in is the primary
> way in.** Magic-link email works out of the box on Supabase's built-in mailer
> for low volume; for higher reliability you can later configure a custom SMTP
> provider under Authentication → Email.

### 3a. Enable Google sign-in (MANUAL — code alone does not enable it)

The "Continue with Google" button only works once the Google provider is wired
up in Google Cloud **and** Supabase. The app code cannot do this for you — these
steps are done by hand from the iPad browser, once:

1. **Google Cloud Console** ([console.cloud.google.com](https://console.cloud.google.com)):
   - Create or select a project.
   - **APIs & Services → OAuth consent screen**: choose **External**, set an app
     name and a support email, and add the `persgroep.net` domain.
   - **APIs & Services → Credentials → Create Credentials → OAuth client ID →
     Web application**.
   - Set the **Authorized redirect URI** to the Supabase auth callback:
     `https://hxfgzrnmgfmhixeqgggr.supabase.co/auth/v1/callback`
     (The callback host is the Supabase **Project URL** from
     [`src/lib/supabaseClient.ts`](src/lib/supabaseClient.ts). If that file's
     URL differs from the one above, use that project's
     `<url>/auth/v1/callback` instead.)
   - Click **Create**, then copy the **Client ID** and **Client secret**.
2. **Supabase → Authentication → Providers → Google**: toggle it **on**, paste
   the **Client ID** and **Client secret**, and **Save**.
3. **Supabase → Authentication → URL Configuration**: confirm **Site URL** and
   **Redirect URLs** include `https://roelblyweert.github.io/okr-tracking-tool/`
   (same as step 3 above).
4. **RLS is unchanged.** A Google account must still resolve to an
   `@persgroep.net` email to read or write data — signing in with a personal
   Google account will authenticate but see (and be able to change) nothing.

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
