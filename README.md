# Pushpa Automation & Robotics Industries — website

Website for **Pushpa Automation & Robotics Industries**, an industrial control panel manufacturer in MIDC Bhosari, Pune. It has an animated public site and a private owner panel at `/admin`. From the panel the owner can add products, finished projects and reviews without writing code.

- **Public site:** animated hero, OEM marquee that reacts to scroll speed, product catalogue with category filters and a detail popup, a horizontal "inside the panel" scroll story, a process timeline, an instant price estimator, reviews, FAQ, contact form, custom cursor and click sparks.
- **Owner panel (`/admin`):** sign in with a one-time code sent to the owner's email. Manage products, projects ("Our work"), reviews, enquiries and site settings (phone, hours, homepage numbers, announcement bar). Photos are compressed in the browser before upload.
- **Security:** described [below](#security).

## Tech stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions), React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Animation | Motion 13 (Framer Motion) |
| Backend | Supabase: Postgres with Row Level Security, email one-time-code login, image storage |
| Validation | Zod 4, plus CHECK constraints in the database |
| Hosting | Vercel (functions in `bom1` / Mumbai) |

## Going live

To connect the database and switch on the owner panel, follow **[SETUP.md](SETUP.md)**. It takes about 15 minutes. Until then the site runs on built-in starter content, and `/admin` says the backend is not connected.

## Local development

```bash
npm install
```

```bash
npm run dev
```

The site runs at http://localhost:3000. To connect a real Supabase project, create `.env.local` containing `SUPABASE_URL=` and `SUPABASE_ANON_KEY=` (see SETUP.md, step 5).

To try the owner panel **without** a Supabase account, use the local mock backend. It runs real Postgres through PGlite with the same security rules. Login codes are printed in the terminal.

```bash
node tests/dev-with-mock.mjs
```

This serves the site at http://localhost:3001. Sign in at `/admin` with `pariindia91@gmail.com`.

Tests cover the database security rules (run against real Postgres), opening hours, and estimator pricing:

```bash
npm test
```

Type-check:

```bash
npm run typecheck
```

## Project structure

```
app/
  page.tsx               public homepage (server component; reads content)
  actions.ts             contact / enquiry server action
  admin/                 owner panel: login, dashboard, CRUD pages, server actions
components/
  site/                  public sections (hero, products, anatomy, estimator, …)
  admin/                 owner panel UI (forms, image upload, lists)
  motion/primitives.tsx  shared animation building blocks
lib/
  content.ts             content types + starter content
  data.ts                cached public content loader
  schemas.ts             zod validation for every write
  media.ts               image upload checks and cleanup
  supabase/              server-only Supabase clients + owner gate
proxy.ts                 CSP nonce, security headers, owner session refresh
supabase/schema.sql      tables, Row Level Security, functions, storage rules
tests/                   database security tests, logic tests, local mock backend
```

## Security

- **Owner-only writes, enforced twice.** Every admin Server Action first checks `public.is_admin()`. That function only returns true for a signed-in user whose **confirmed** email is listed in `public.admins`. The database then runs the action under Row Level Security again, using the owner's own session. `tests/rls.test.mjs` shows that visitors and signed-in non-owners cannot write anything.
- **No sign-ups and no passwords.** The login form never creates accounts (`shouldCreateUser: false`), and sign-ups are disabled in Supabase. The reply is identical for any email address, so it does not reveal who the owner is.
- **Session cookies** are `HttpOnly`, `Secure`, `SameSite=Lax`, and scoped to `/admin`, so the public pages never receive them.
- **Least privilege.** Only the anon/publishable key is used, and only on the server. The browser never talks to Supabase directly, and no service-role key exists anywhere in the app.
- **Strict Content-Security-Policy** with a fresh nonce on every request (`strict-dynamic`, `frame-ancestors 'none'`, `object-src 'none'`). The site also sends HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and COOP headers, and does not send `X-Powered-By`.
- **Input validation** runs through zod on every write, with length limits repeated as database CHECK constraints. URLs must use `https`, and all rendered content is escaped by React.
- **Uploads:** the server identifies the file type from its first bytes (JPG, PNG, WebP or AVIF only, never SVG). Uploads are capped at 4 MB, stored under random file names, and the storage bucket enforces the same rules. Photos are re-encoded in the browser, which strips GPS/EXIF data.
- **Abuse limits:** the enquiry form has a honeypot field and allows 5 per hour per visitor plus a global hourly cap. Login allows 5 code emails and 10 code attempts per 15 minutes per visitor. These counters live in Postgres, so they hold across serverless instances, and IPs are stored only as short-lived hashes.
- **Personal data:** enquiries are readable only by the owner. The panel can mark enquiries closed and delete them, so the owner can remove data that is no longer needed.
- **Supply chain:** dependency install scripts are disabled (`.npmrc`). `npm audit` reports 0 vulnerabilities, and all registry signatures verify.

## Contact

Rajdhani Industrial Complex, F1, EL Block, MIDC Bhosari, Pimpri-Chinchwad, Maharashtra 411026 · +91 79727 41546 · pariindia91@gmail.com
