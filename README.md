# Personal Blog

A public personal blog and private publishing studio built with Next.js, TypeScript, Tailwind CSS 4, and Supabase.

## What is included

- Public homepage, writing archive, individual Markdown post pages, and about page
- Passwordless admin sign-in through Supabase Auth
- Admin dashboard with post counts and a complete post library
- Markdown editor with live preview, drafts, publishing, SEO fields, and cover-image uploads
- Supabase Postgres schema, generated TypeScript types, Row Level Security, and Storage policies

## Getting started

Requirements: Node.js 22.13 or newer, npm, and a Supabase project.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set the project values in `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Never expose a Supabase secret or service-role key through a `NEXT_PUBLIC_` variable.

## Database setup

The database structure lives in `supabase/migrations/`. Link the project and apply migrations:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
supabase gen types typescript --linked > types/database.ts
```

The migration creates:

- `posts`, with draft and published states
- `admin_users`, an explicit administrator allowlist
- Public-read and admin-write Row Level Security policies
- A public `post-images` bucket with admin-only upload, update, and delete policies

## Grant the first administrator

1. Start the app and visit `/admin/login`.
2. Enter your email and follow the secure link Supabase sends you. This creates your Auth user.
3. In the Supabase SQL Editor, run the following with your actual email:

```sql
insert into public.admin_users (user_id)
select id
from auth.users
where email = 'you@example.com'
on conflict (user_id) do nothing;
```

4. Sign out and sign in again. You can now access `/admin`.

Only allow trusted accounts. Authorization is enforced in both server code and database policies.

For deployed environments, add the deployed `/auth/callback` URL to Supabase Auth’s allowed redirect URLs.
Set `NEXT_PUBLIC_SITE_URL` to the deployed origin so canonical social-preview URLs are generated correctly.

## Publishing a post

1. Open `/admin/posts/new`.
2. Add the title, URL slug, excerpt, and Markdown content.
3. Optionally upload a cover image and customize search metadata.
4. Choose **Save draft** to keep it private or **Publish now** to make it visible.

Published posts appear on `/` and `/posts` and are available at `/posts/[slug]`. Drafts are visible only inside the protected studio.

## Scripts

```bash
npm run dev          # Start the Next.js development server
npm run build        # Create the Next.js production build
npm run start        # Run the Next.js production build
npm run lint         # Run ESLint
npm run sites:dev    # Start the optional Sites-compatible preview
npm run sites:build  # Build with the optional Sites-compatible runtime
```

## Project structure

```text
app/                  Public routes, admin routes, layouts, and server actions
components/admin/     Publishing-studio components
components/blog/      Public blog and Markdown components
components/layout/    Shared public-site structure
lib/auth/             Server-side administrator authorization
lib/supabase/         Browser, server, public, and proxy Supabase clients
lib/posts.ts          Public and administrator post queries
supabase/migrations/  Versioned database schema and security policies
types/database.ts     Types generated from the linked Supabase schema
```

See `AGENTS.md` for the full repository conventions.
