# 🌱 Environments (dev vs. production)

WhatList runs on **two separate Supabase projects** from a single codebase. Nothing in
the code is hard-coded per environment — only the **values** of the environment
variables change. A colored badge in the bottom-left corner shows which environment /
database you're looking at (it disappears in production).

## The layout

| Environment            | Runs where              | Supabase project | Where its env vars live            |
| ---------------------- | ----------------------- | ---------------- | ---------------------------------- |
| **Development**        | `npm run dev` (local)   | **dev** project  | `.env.local` (git-ignored)         |
| **Preview**            | Vercel PR/branch deploys| **dev** project  | Vercel → Environment: *Preview*    |
| **Production**         | Vercel production domain| **prod** project | Vercel → Environment: *Production* |

> Preview deploys point at the **dev** database on purpose — so pull-request previews and
> experiments can never read or corrupt real production data. Only the production domain
> touches the production database.

### Golden rules

1. **Never** put production credentials in `.env.local`.
2. Local development and previews use the **dev** database. Only the production
   deployment uses the **prod** database.
3. Apply every new migration to **both** databases (dev first, then prod).

---

## One-time setup

### 1. You already have the DEV project

Your current Supabase project (in `.env.local`) is the **dev/testing** database. Nothing
to do here.

### 2. Create the PRODUCTION project

1. In Supabase, create a **second** project, e.g. `whatlist-prod`.
2. Run **both** migrations in its SQL Editor, in order:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_lists_notifications.sql`
3. Under **Authentication → URL Configuration**, set **Site URL** to your production URL
   (e.g. `https://whatlist.vercel.app`) and add `https://whatlist.vercel.app/**` to
   **Redirect URLs**.
4. Copy its **Project URL** and **anon key** (Settings → API) for the next step.

### 3. Configure Vercel

In your Vercel project → **Settings → Environment Variables**, add each variable and pick
which **Environments** it applies to:

**Production** scope:
```
NEXT_PUBLIC_APP_ENV          = production
NEXT_PUBLIC_SUPABASE_URL     = https://<prod-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY= <prod anon key>
TMDB_ACCESS_TOKEN            = <tmdb token>
NEXT_PUBLIC_SITE_URL         = https://<your-prod-domain>
```

**Preview** scope (reuse the **dev** project):
```
NEXT_PUBLIC_APP_ENV          = preview
NEXT_PUBLIC_SUPABASE_URL     = https://<dev-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY= <dev anon key>
TMDB_ACCESS_TOKEN            = <tmdb token>
NEXT_PUBLIC_SITE_URL         = https://<the-preview-url>   # or leave to the deploy URL
```

> Tip: in the Vercel UI you can tick multiple environments for a single value. Give
> Production its own Supabase values; give Preview the dev ones.

### 4. Dev project auth redirect URLs

Because local dev **and** previews use the dev Supabase project, add all of these to the
**dev** project's Authentication → Redirect URLs:
```
http://localhost:3000/**
https://*-<your-vercel-scope>.vercel.app/**   # preview deploys
```

---

## Keeping the two databases in sync

When you add a new `supabase/migrations/NNNN_*.sql`, run it on **both** projects.

### Option A — SQL Editor (simplest)

Paste the new migration into each project's SQL Editor and run it. Do **dev** first,
verify, then **prod**.

### Option B — Supabase CLI (repeatable)

```bash
# one-time
npx supabase login
npx supabase init            # if supabase/config.toml doesn't exist yet

# apply pending migrations to DEV
npx supabase link --project-ref <dev-ref>
npx supabase db push

# then to PROD
npx supabase link --project-ref <prod-ref>
npx supabase db push
```

`db push` applies everything in `supabase/migrations/` that a project hasn't seen yet.
Always push to **dev** first and confirm before pushing to **prod**.

---

## 📧 Email delivery (production)

Supabase's **built-in email sender is for testing only** — it's throttled to a few auth
emails per hour, so real signups / password resets will fail once you exceed it. Before
launch, point the **prod** project at a free SMTP provider (no app code changes — only
Supabase settings). This also removes the built-in cap.

**Recommended free provider: [Brevo](https://www.brevo.com)** — 300 emails/day free, and
you can verify a single sender address without owning a domain. (Alternatives: Mailjet
200/day, Resend 100/day.)

Setup:

1. Sign up at brevo.com (no card). Under **Senders, Domains & Dedicated IPs → Senders**,
   add and confirm your sender email. *(Authenticate a domain later for best
   deliverability / to send "from WhatList".)*
2. **SMTP & API → SMTP** → generate an SMTP key. Note the host, port, login, and key.
3. In **Supabase (prod project) → Authentication → SMTP Settings**, enable custom SMTP:
   ```
   Host      = smtp-relay.brevo.com
   Port      = 587
   Username  = <your Brevo SMTP login>
   Password  = <your Brevo SMTP key>
   Sender    = <your verified sender>   Sender name = WhatList
   ```
4. In **Authentication → Rate Limits**, raise "emails per hour" now that you're off the
   built-in sender.

For the **dev** project you can keep the built-in sender (or disable "Confirm email" while
testing). See the README's *"Branding the emails"* section for custom HTML templates.

---

## How the app knows its environment

`src/lib/env.ts` reads `NEXT_PUBLIC_APP_ENV` (falling back to `development` locally and
`production` in a production build). It exposes `APP_ENV`, `isProduction`, and the
Supabase project ref, which drive the corner **environment badge**
(`src/components/EnvBadge.tsx`). The badge shows e.g. `DEVELOPMENT · bppsgadl…` so you can
tell at a glance which database you're pointed at — and renders nothing in production.
