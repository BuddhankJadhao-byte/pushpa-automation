# Going live: connect the database and switch on the owner panel

This is a one-time setup and takes about 15 minutes. You need:

- a free [Supabase](https://supabase.com) account (the database, login codes and photo storage)
- the existing Vercel project

## 1. Create the Supabase project

1. In Supabase, click **New project**.
2. For **Region**, choose **Mumbai (ap-south-1)**. It is closest to the Vercel functions, which run in Mumbai (`bom1`).
3. Save the database password somewhere safe. The website does not need it.

## 2. Create the tables and security rules

1. Open **SQL Editor** and click **New query**.
2. Paste the whole of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.

This creates the tables, the Row Level Security rules, the photo bucket, and the owner list with `pariindia91@gmail.com`. The script is safe to run again later.

## 3. Lock down sign-in

Open **Authentication** and change these settings:

1. **Sign In / Providers → Email:** keep it **enabled**, and keep **Confirm email** turned **on**.
2. **Sign In / Providers:** turn **Allow new users to sign up** **off**. Nobody can create an account after this.
3. **Email OTP expiration** (under the Email provider or Auth settings): set it to **600** seconds (10 minutes).
4. **Users → Add user → Create new user:**
   - Email: `pariindia91@gmail.com`
   - Password: any long random password. It is never used; the owner signs in with email codes.
   - Tick **Auto Confirm User**.
5. **Emails → Templates → Magic Link:** replace the message body with the following, then save:

   ```html
   <h2>Pushpa Automation — owner login code</h2>
   <p>Your one-time login code is:</p>
   <p style="font-size:28px;font-weight:bold;letter-spacing:6px">{{ .Token }}</p>
   <p>It expires in 10 minutes. If you did not try to sign in, you can ignore this email.</p>
   ```

## 4. Make sure the code emails arrive

Supabase's built-in email service only delivers to **members of your Supabase organization**, and only a few emails per hour. Choose one of these options:

- **Simplest:** go to **Organization → Team → Invite** and invite `pariindia91@gmail.com`, then accept the invite from that inbox.
- **Recommended for the long term:** set up **Authentication → Emails → SMTP Settings** with your own mail provider, for example Gmail with an app password, Brevo, or Resend.

## 5. Connect Vercel

1. In Supabase, open **Project Settings → API Keys** and copy:
   - the **Project URL**, for example `https://abcd1234.supabase.co`
   - the **anon** key or the **publishable** key (`sb_publishable_…`)

   Never use the `service_role` / secret key. The site does not need it.

2. In Vercel, open **Project → Settings → Environment Variables** and add these for **Production** and **Preview**:

   | Name | Value |
   |---|---|
   | `SUPABASE_URL` | the Project URL |
   | `SUPABASE_ANON_KEY` | the anon / publishable key |
   | `NEXT_PUBLIC_SITE_URL` | the live address, for example `https://your-domain.com` (used for SEO) |

3. Open **Settings → Build & Deployment** and check two things:
   - **Framework Preset** is **Next.js**. The repo's `vercel.json` also sets this.
   - There is **no Output Directory override**. The old static site used `.`, and that setting must be removed.

4. **Redeploy.** Environment variables only take effect on a new deployment.

## 6. First login

1. Open `https://your-site/admin`, enter `pariindia91@gmail.com` and click **Email me a code**.
2. Enter the 6-digit code from the inbox. Check spam the first time.
3. Go to **Products** and click **Import the 8 starter products**, then go to **Reviews** and click **Import the 3 existing reviews**. After that, edit, hide or delete anything you like.

---

# Owner guide (no code needed)

| I want to… | Where |
|---|---|
| Add or change a panel/product, its price, photo or specifications | **Products → Add product** (or **Edit**) |
| Show a finished job with a photo | **Our work → Add project**. The "Our work" section appears on the homepage automatically. |
| Add a client testimonial | **Reviews → Add review** |
| Hide something without deleting it | Click the green **Live** button. It changes to **Hidden**. |
| Change the order things appear in | Set **Order** when editing. Lower numbers come first. |
| See website enquiries | **Enquiries**. Each one has call, WhatsApp and email buttons. |
| Change phone, WhatsApp, email, address or hours | **Settings** |
| Update the homepage numbers (panels delivered, rating, reviews) | **Settings → Numbers on the homepage** |
| Show a notice at the top of the site (holiday, offer) | **Settings → Announcement bar**. Leave it empty to hide it. |

- Changes appear on the website as soon as you press **Save and publish**.
- Photos taken on a phone are shrunk automatically before upload, so there is no need to resize them.
- Delete enquiries once a job is closed, so you don't keep people's details longer than needed. **Enquiries → Delete closed** removes them in one go.
- Always use **Sign out** on shared computers.

## Adding another owner later

1. In Supabase, open the **SQL Editor** and run:

   ```sql
   insert into public.admins (email) values ('new.owner@example.com');
   ```

2. Then create that user under **Authentication → Users → Add user**, with **Auto Confirm User** ticked.

To remove an owner, delete the row from `public.admins`.
