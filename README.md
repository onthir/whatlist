# 🎬 WhatList

A colorful, Letterboxd-style web app for tracking **movies & TV shows**. Keep a
watchlist, log what you've watched, rate & review titles, follow friends, and see
what they're watching.

Built with **Next.js (App Router) · Supabase · TMDB · Tailwind CSS**, and deploys
free on **Vercel**.

---

## ✨ Features

- **Email accounts** — sign up, log in, email confirmation, forgot/reset password
  (with show/hide password toggles).
- **Search** thousands of movies & TV shows (powered by TMDB), with a live
  autocomplete dropdown in the navbar.
- **Watchlist & Watched** lists per user.
- **Ratings & reviews** — 0.5–5 stars plus optional written reviews.
- **Custom lists** — build ranked lists like “Top 10 for a road trip” and add titles
  from any detail page.
- **One-way follows** — follow anyone and see their reviews in your home feed; browse
  any user's **followers / following** lists.
- **Notifications** — get notified when someone follows you (bell + unread badge).
- **Public profiles** at `/u/username` with Watched / Watchlist / Reviews / Lists tabs,
  and rating filters on reviews.
- **Row Level Security** on every table so users can only edit their own data.

---

## 🧱 Tech & data model

| Layer     | Choice                                             |
| --------- | -------------------------------------------------- |
| Framework | Next.js 16 (App Router, Server Actions, TS)        |
| Styling   | Tailwind CSS v4, custom dark + colorful theme      |
| Auth + DB | Supabase (Postgres, Auth, RLS)                     |
| Movie data| TMDB API (movies **and** TV)                       |
| Hosting   | Vercel                                             |

**Tables:** `profiles`, `media` (a shared TMDB cache), `user_media`
(watchlist/watched), `reviews`, `follows`. Movies aren't bulk-imported — a title is
cached into `media` the first time someone adds or reviews it. See
[`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).

---

## 🚀 Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Go to <https://supabase.com>, create a free project.
2. Open **SQL Editor → New query** and run **both** migrations in order:
   - [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) — profiles,
     media, watchlist/watched, reviews, follows, the signup trigger, and RLS.
   - [`supabase/migrations/0002_lists_notifications.sql`](supabase/migrations/0002_lists_notifications.sql)
     — custom lists, notifications, and the follow-notification trigger.
3. Go to **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Configure Supabase Auth

Under **Authentication → URL Configuration**:

- **Site URL:** `http://localhost:3000`
- **Redirect URLs:** add `http://localhost:3000/**`
  (and later your Vercel URL, e.g. `https://your-app.vercel.app/**`)

Under **Authentication → Providers → Email**: keep **Email** enabled. "Confirm email"
is on by default — that's fine (see the note below for local testing).

### 4. Get a TMDB API token

1. Create a free account at <https://www.themoviedb.org>.
2. Go to **Settings → API**, request an API key (choose "Developer").
3. Copy the **API Read Access Token** (the long token, _not_ the short v3 key) →
   `TMDB_ACCESS_TOKEN`.

### 5. Add environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
TMDB_ACCESS_TOKEN=your-tmdb-read-access-token
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **Running separate dev and production databases?** That's the recommended setup —
> see **[ENVIRONMENTS.md](ENVIRONMENTS.md)** for the full two-project guide (local + Vercel
> Preview use the dev DB; only production uses the prod DB).

### 6. Run it

```bash
npm run dev
```

Open <http://localhost:3000>.

> **Tip for local testing:** confirmation and reset emails from Supabase link back to
> `NEXT_PUBLIC_SITE_URL`. During development you can either click the links in your
> inbox, or temporarily turn off **Confirm email** (Authentication → Providers →
> Email) so signups log you in immediately. You can also read outgoing emails in
> Supabase under **Authentication → Logs**.

---

## ☁️ Deploy to Vercel

1. Push this repo to GitHub.
2. Import it at <https://vercel.com/new>.
3. Add the same environment variables in **Project → Settings → Environment
   Variables**, but set `NEXT_PUBLIC_SITE_URL` to your production URL
   (e.g. `https://your-app.vercel.app`).
4. In Supabase, add your production URL to **Site URL** and **Redirect URLs**
   (`https://your-app.vercel.app/**`).
5. Deploy. 🎉

---

## ✉️ Branding the emails (send "from WhatList")

By default, Supabase sends confirmation/reset emails from its own shared address
(`noreply@mail.app.supabase.io`), which is rate-limited and not branded. Two layers to
make them yours:

### 1. Customize the templates (no domain needed)

Supabase → **Authentication → Email Templates**. Edit **Confirm signup** and **Reset
password**. You can use these variables: `{{ .ConfirmationURL }}`, `{{ .Email }}`,
`{{ .SiteURL }}`. Example WhatList-branded confirmation body:

```html
<div style="font-family:system-ui,sans-serif;max-width:480px;margin:auto;padding:24px;color:#111">
  <h1 style="font-size:22px">🎬 Welcome to WhatList</h1>
  <p>Confirm your email to start building your watchlist.</p>
  <p style="margin:28px 0">
    <a href="{{ .ConfirmationURL }}"
       style="background:linear-gradient(120deg,#6366f1,#a855f7,#ec4899);
              color:#fff;padding:12px 22px;border-radius:12px;
              text-decoration:none;font-weight:600">Confirm my email</a>
  </p>
  <p style="color:#666;font-size:13px">If you didn't sign up, you can ignore this email.</p>
</div>
```

### 2. Send from your own address (custom SMTP)

To send from e.g. `hello@whatlist.app`:

1. Create an account with an email provider — **[Resend](https://resend.com)**,
   **Postmark**, **SendGrid**, or **Mailgun** all have free tiers.
2. **Verify your domain** with them (add the DNS records they give you).
3. In Supabase → **Authentication → SMTP Settings**, enable custom SMTP and enter the
   provider's host / port / username / password, plus your sender name (`WhatList`) and
   address (`hello@whatlist.app`).

Once custom SMTP is on, all auth emails come from your address with your templates, and
you're no longer rate-limited by Supabase's shared mailer.

## 🗂️ Project structure

```
src/
├─ app/
│  ├─ actions/            # Server Actions (auth, media, social, profile, lists, notifications)
│  ├─ api/search/         # Autocomplete endpoint
│  ├─ auth/callback/      # Email confirm & password-recovery handler
│  ├─ login, signup, forgot-password, reset-password/
│  ├─ search/             # Movie & TV search
│  ├─ title/[type]/[tmdbId]/       # Title detail + tracking + reviews + add-to-list
│  ├─ u/[username]/                # Public profile (+ /followers, /following)
│  ├─ lists/new, lists/[id]/       # Create & view custom lists
│  ├─ notifications/      # Follow notifications
│  ├─ me/                 # Your dashboard + edit profile
│  ├─ people/             # Find & follow people
│  └─ page.tsx            # Landing (logged out) / feed (logged in)
├─ components/            # UI + feature components (auth/, lists/, title/, ui/)
├─ lib/
│  ├─ supabase/           # Browser/server clients + session helper
│  ├─ tmdb.ts             # TMDB client
│  ├─ images.ts           # Client-safe image URL helpers
│  ├─ media.ts            # media-cache upsert helpers
│  └─ types.ts
└─ proxy.ts               # Session refresh + route guards (Next 16 "proxy")
```

---

## 🧭 Roadmap ideas

Likes/comments on reviews, drag-to-reorder list items, a rewatch diary with dates,
richer notifications (new reviews from people you follow), per-episode TV tracking, and
year-in-review stats.

---

Movie & TV metadata provided by [TMDB](https://www.themoviedb.org/). This product
uses the TMDB API but is not endorsed or certified by TMDB.
