# Working in this repository

## Purpose

This repository is a personal blog built with Next.js, TypeScript, Tailwind CSS 4, and Supabase. Keep changes small, typed, accessible, and easy to review.

## Code organization

- `app/` owns routes, route layouts, metadata, loading states, and error boundaries. Keep route files focused on composition and data loading.
- `components/layout/` contains site-wide structure such as headers and footers.
- `components/blog/` contains blog-domain UI. Put generic primitives in `components/ui/` only after they are reused.
- `components/admin/` contains publishing-studio UI. Keep authorization checks in server code, not these components.
- `lib/` contains framework-independent data access and domain logic. Supabase client factories belong in `lib/supabase/`.
- `lib/auth/` owns server-side authentication and administrator authorization.
- `supabase/migrations/` is the source of truth for database tables, indexes, triggers, Storage configuration, and Row Level Security.
- `types/` contains shared domain types. Prefer types generated from the Supabase schema for database rows.
- `public/` contains static assets. Use descriptive, stable filenames.

Colocate route-specific components with their route when they are not reused. Promote code into a shared directory only when there is a real second consumer.

## Implementation rules

- Prefer Server Components. Add `'use client'` only at the smallest interactive boundary.
- Fetch data on the server unless browser-only behavior requires otherwise.
- Never expose a Supabase service-role key to the browser. Only `NEXT_PUBLIC_` variables may be used by browser code.
- Enforce access with Supabase Row Level Security; UI checks are not authorization.
- Protect every admin page and Server Action with `requireAdmin()` and keep `admin_users` as the authorization allowlist.
- Add database changes through a new migration, apply them with `supabase db push`, and regenerate `types/database.ts`.
- Keep environment names synchronized between `.env.example`, code, and the README.
- Use the `@/` alias for cross-directory imports and relative imports within a small module folder.
- Avoid `any`; validate data received from forms, APIs, and URL parameters.
- Keep styling in Tailwind utilities. Add global CSS only for tokens, base styles, or genuinely shared patterns.
- Use semantic HTML, visible focus states, useful labels, and keyboard-accessible interactions.

## Naming

- React component exports use PascalCase and component filenames use kebab-case.
- Hooks start with `use`; server actions use verb-first names such as `createPost`.
- Supabase tables and columns use `snake_case`; TypeScript values use `camelCase`.
- Dynamic route folders describe their parameter, for example `app/posts/[slug]/`.

## Before handing off a change

Run:

```bash
npm run lint
npm run build
```

Update tests when behavior changes, keep `README.md` setup steps current, and do not commit secrets or generated build output.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
