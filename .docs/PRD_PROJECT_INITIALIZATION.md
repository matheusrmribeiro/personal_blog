# Product Requirements Document: Project Initialization

## Document control

| Field | Value |
| --- | --- |
| Product | Workbench Notes |
| Document | Project initialization and technical foundation |
| Version | 1.0 |
| Status | Baseline specification |
| Last updated | 2026-08-22 |
| Audience | Product owner, engineering, design, QA, operations |
| Companion document | [PRD_FEATURES.md](./PRD_FEATURES.md) |

## 1. Executive summary

Workbench Notes is a public personal blog with a private publishing studio. This document defines the foundation required to develop, secure, operate, and extend the product. It covers repository initialization, application architecture, configuration, Supabase provisioning, authorization, data access, styling, quality gates, and release readiness. User-facing behavior is specified separately in the companion feature PRD.

The current repository is the reference MVP implementation. This PRD can therefore be used both to validate the existing foundation and to reconstruct it consistently in another environment.

## 2. Problem statement

A personal publishing product needs more than a set of pages. It needs a repeatable local setup, a secure separation between public and administrative access, a versioned database, typed data contracts, safe secret handling, predictable deployment behavior, and reviewable quality gates. Without that foundation, editorial features become difficult to maintain and can expose private drafts or privileged credentials.

## 3. Product outcome

Create a small, typed, accessible, and production-ready foundation on which a single-author blog and private publishing studio can run with Supabase as its managed backend.

## 4. Goals

1. Allow a developer to run the application locally from a clean checkout with documented prerequisites and configuration.
2. Establish a maintainable Next.js App Router structure with server-first rendering and small client boundaries.
3. Provision a versioned Supabase schema for posts, administrator access, image storage, and privacy-conscious view counting.
4. Enforce administrator authorization in server code and Row Level Security, independently of UI visibility.
5. Keep database access strongly typed and environment variables consistent across code, documentation, and examples.
6. Establish responsive design tokens, metadata defaults, accessibility expectations, and repeatable lint/build gates.
7. Support deployment to a standard Next.js runtime, with optional Sites-compatible scripts already present in the project.

## 5. Non-goals

- Defining the detailed public and administrative feature experience; see the companion feature PRD.
- Supporting arbitrary multi-tenant blogs or per-author workspaces.
- Building a general-purpose CMS or plugin platform.
- Selecting a final hosting vendor, domain, email provider, or monitoring vendor.
- Adding comments, subscriptions, search, tags, payments, or social-network functionality.
- Maintaining multiple database backends.

## 6. Users and stakeholders

| Role | Need |
| --- | --- |
| Reader | A fast, reliable, accessible public reading experience without authentication. |
| Administrator/author | A secure way to manage private drafts and published content. |
| Developer | A documented, typed, reproducible environment with clear module boundaries. |
| Operator/product owner | Safe configuration, migrations, predictable releases, and low operational overhead. |

## 7. Constraints and guiding principles

- The stack is Next.js 16, React 19, TypeScript, Tailwind CSS 4, and Supabase.
- Node.js 22.13 or newer and npm are required.
- Server Components are the default; `'use client'` is used only for browser interaction.
- Public data is fetched on the server unless a browser-only behavior requires otherwise.
- The `admin_users` table is the explicit authorization allowlist.
- Every admin page and every mutating Server Action must be protected with `requireAdmin()`.
- Supabase RLS is a mandatory security boundary; client-side checks are never sufficient authorization.
- Secret or service-role credentials must never be exposed through `NEXT_PUBLIC_` variables or browser bundles.
- Database changes are additive migrations, followed by `supabase db push` and regeneration of `types/database.ts`.
- Tailwind utilities own component styling; global CSS is reserved for tokens, base styles, and shared patterns.
- Cross-directory imports use the `@/` alias.

## 8. Technical baseline

### 8.1 Runtime and framework

| Area | Baseline |
| --- | --- |
| Runtime | Node.js `>=22.13.0` |
| Package manager | npm with committed lockfile |
| Web framework | Next.js `^16.3.2`, App Router |
| UI runtime | React and React DOM `^19.2.8` |
| Language | TypeScript `^5.9.3`, strict typed code, no intentional `any` |
| Styling | Tailwind CSS `4.2.1` via PostCSS |
| Backend | Supabase Postgres, Auth, Storage, and SSR clients |
| Validation | Zod `^4.4.3` |
| Content | Tiptap editor; Markdown persistence; React Markdown with GFM rendering |
| Quality | ESLint 9 with Next.js configuration; production build gate |

### 8.2 Repository structure

| Path | Responsibility |
| --- | --- |
| `app/` | Routes, layouts, metadata, route handlers, Server Actions, loading/error boundaries when needed |
| `components/layout/` | Shared public shell such as header and footer |
| `components/blog/` | Public blog-domain presentation |
| `components/admin/` | Publishing-studio UI; never the sole authorization boundary |
| `components/ui/` | Reusable primitives with a demonstrated second consumer |
| `lib/` | Data access and framework-independent domain logic |
| `lib/auth/` | Server-side authentication and administrator authorization |
| `lib/supabase/` | Browser, server, public, privileged, configuration, and session-proxy clients |
| `supabase/migrations/` | Source of truth for schema, functions, indexes, triggers, RLS, and Storage policies |
| `types/` | Generated database types and shared domain projections |
| `public/` | Stable public assets such as the favicon and default social image |
| `.docs/` | Product and implementation requirements |

### 8.3 Required scripts

| Command | Purpose | Release critical |
| --- | --- | --- |
| `npm run dev` | Local Next.js development server | Yes |
| `npm run build` | Production Next.js build | Yes |
| `npm run start` | Serve the production Next.js build | Yes |
| `npm run lint` | Repository lint validation | Yes |
| `npm run sites:dev` | Optional Sites-compatible development runtime | No |
| `npm run sites:build` | Optional Sites-compatible production build | Only for Sites releases |
| `npm run sites:start` | Serve the optional Sites-compatible output | Only for Sites releases |

## 9. Environment and configuration

### 9.1 Variables

| Variable | Exposure | Required | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser and server | Yes | Supabase project origin |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser and server | Yes | RLS-constrained public/authenticated access |
| `SUPABASE_SECRET_KEY` | Server only | Yes in deployed MVP | Privileged invocation of the view-count RPC |
| `NEXT_PUBLIC_SITE_URL` | Browser and server metadata | Yes in production | Canonical origin for metadata and redirects; local default is `http://localhost:3000` |

Rules:

- `.env.example`, application code, and setup documentation must use identical names.
- Real values belong in `.env.local` or the deployment platform's secret store and must not be committed.
- `SUPABASE_SECRET_KEY` must be read only by server-only code.
- Application startup must fail with a clear error when required public Supabase configuration is absent.
- The production Supabase Auth configuration must allow the deployed `/auth/callback` URL.
- The Next.js image remote pattern must match the deployed Supabase project, or be made environment-derived before changing Supabase projects.

### 9.2 Environment matrix

| Environment | Purpose | Data expectation | Required checks |
| --- | --- | --- | --- |
| Local | Development and manual QA | Developer-linked Supabase project | Install, migrate, type generation, lint, build |
| Preview | Review of proposed changes | Isolated or explicitly approved Supabase project | Build, configuration, auth callback, smoke test |
| Production | Public blog and private studio | Production Supabase project | Migrations applied, secrets configured, administrator allowlisted, full release checklist |

## 10. Data foundation

### 10.1 Core entities

| Entity | Purpose | Key rules |
| --- | --- | --- |
| `posts` | Stores drafts and published posts | UUID primary key; unique valid slug; status is `draft` or `published`; a published record requires `published_at`; `view_count` is non-negative |
| `admin_users` | Explicit administrator allowlist | `user_id` references `auth.users`; deletion cascades from the Auth user |
| `post_view_sessions` | Deduplicates views | Composite key of post and SHA-256 visitor hash; no grants to anonymous or authenticated clients |
| `post-images` bucket | Publicly serves post imagery | 5 MB object limit; JPG, PNG, WebP, and GIF; only administrators can upload/update/delete |

### 10.2 Post fields

| Field | Type/constraint | Purpose |
| --- | --- | --- |
| `id` | UUID, generated | Stable identifier |
| `author_id` | UUID, required | Owning Auth user |
| `title` | 1-160 characters | Display title |
| `slug` | Unique lowercase alphanumeric/hyphen pattern | Public URL segment |
| `excerpt` | Up to 360 characters | Card and default description text |
| `content` | Text | Markdown source of truth |
| `cover_image_url` | Nullable text | Card, article, and social imagery |
| `seo_title` | Nullable, up to 70 characters | Optional search/social title override |
| `seo_description` | Nullable, up to 170 characters | Optional search/social description override |
| `status` | `draft` or `published` | Editorial state |
| `published_at` | Nullable timestamp | Publication ordering and eligibility |
| `view_count` | Non-negative bigint | Public aggregate view count |
| `created_at` / `updated_at` | Timestamps | Audit and admin ordering |

### 10.3 Database behavior

- Published content is publicly selectable only when `status = 'published'` and `published_at <= now()`.
- Administrators can read all posts and create, update, or delete posts through RLS policies backed by `is_admin()`.
- New posts must use the authenticated user's ID as `author_id`.
- Editorial updates refresh `updated_at`; view-count increments do not reorder recent editorial activity.
- Post queries are indexed for publication order and author access.
- Deleting a post cascades its view-session rows.
- The view-count function is executable only by the privileged server role.
- Generated TypeScript types in `types/database.ts` must reflect the applied schema.

## 11. Application architecture

### 11.1 Rendering and caching

- Public pages use Server Components and server-side Supabase queries.
- Public homepage, archive, and article pages use a 60-second revalidation window.
- Administrative routes are force-dynamic and always evaluate the current session and data.
- Mutations revalidate affected public and admin paths before redirecting.
- Client Components are limited to authentication form interaction, the editor, deletion confirmation, view recording, and the image lightbox.

### 11.2 Supabase clients

| Client | Credential/session | Permitted use |
| --- | --- | --- |
| Browser client | Publishable key and browser session | Supabase Auth interactions only where browser state is required |
| Server client | Publishable key and cookie session | Authenticated reads/writes subject to RLS |
| Public client | Publishable key, no persisted session | Public server-side reads subject to RLS |
| Privileged client | Server-only secret key | Narrow server-only operations such as view-count RPC |
| Session proxy | Publishable key and request/response cookies | Refresh/propagate authentication claims |

### 11.3 Authentication and authorization

1. Supabase Auth provides passwordless email sign-in.
2. The callback exchanges the one-time code for a session and permits only a safe relative `next` destination.
3. The request proxy refreshes session claims without applying business authorization.
4. `requireAdmin()` verifies the session and a matching `admin_users` row.
5. Missing authentication redirects to `/admin/login`; authenticated non-admin users redirect to `/admin/unauthorized`.
6. RLS independently enforces the same public/admin data boundary.

## 12. Design and accessibility foundation

- The public theme uses semantic tokens for paper, surface, ink, muted text, dividers, and accent.
- Geist Sans and Geist Mono are the default typefaces.
- Shared prose styles must support headings, paragraphs, links, lists, blockquotes, inline code, code blocks, and responsive images.
- The layout must work from small mobile screens through desktop widths.
- Interactive controls require visible focus states, accessible names, semantic elements, and keyboard operation.
- Dialog-like experiences must manage focus, support Escape, prevent background interaction, and return focus to the trigger.
- Status and validation messages must use appropriate live-region semantics where updates occur without navigation.
- Metadata must define a site title template, description, Open Graph defaults, Twitter card defaults, favicon, and a canonical metadata base.

## 13. Foundational requirements and acceptance criteria

| ID | Priority | Requirement | Acceptance criteria |
| --- | --- | --- | --- |
| INIT-001 | Must | Reproducible install | A clean checkout with Node 22.13+ completes `npm install` using the committed lockfile. |
| INIT-002 | Must | Local startup | After copying `.env.example` to `.env.local` and supplying valid values, `npm run dev` starts without configuration-name changes. |
| INIT-003 | Must | Typed application | Application and Supabase access compile without intentional `any`; database rows use generated schema types. |
| INIT-004 | Must | Server-first architecture | Routes render as Server Components unless browser-only interaction is documented at the smallest boundary. |
| INIT-005 | Must | Versioned database | All tables, functions, triggers, indexes, RLS, grants, and Storage setup are reproducible from ordered migrations. |
| INIT-006 | Must | Public/private isolation | Anonymous users can read eligible published posts and cannot read drafts, administrator records, or view-session records. |
| INIT-007 | Must | Admin defense in depth | Every admin layout/action verifies `requireAdmin()`, and RLS rejects unauthorized direct database access. |
| INIT-008 | Must | Secret isolation | The privileged key is absent from browser bundles, public environment variables, logs, and committed files. |
| INIT-009 | Must | Session continuity | Supabase session cookies are refreshed through the request proxy and available to server-side authorization. |
| INIT-010 | Must | Safe auth callback | The callback exchanges a valid code, rejects unsafe external `next` redirects, and routes failure to the login page with a useful message. |
| INIT-011 | Must | Storage controls | The bucket enforces 5 MB and supported MIME types; only allowlisted admins can mutate objects. |
| INIT-012 | Must | Consistent configuration | `.env.example`, README, and application lookups stay synchronized. Missing configuration produces actionable errors. |
| INIT-013 | Must | Quality gates | `npm run lint` and `npm run build` pass before handoff or release. |
| INIT-014 | Must | Responsive shell | Public and admin layouts remain usable at 320 px width and common desktop sizes without inaccessible overflow. |
| INIT-015 | Must | Accessible baseline | Navigation, forms, dialogs, status messages, and controls are operable with keyboard and expose useful accessible names. |
| INIT-016 | Should | Deployment portability | Deployment documentation identifies runtime, environment values, Supabase callback URL, image host configuration, and migration order. |
| INIT-017 | Should | Preview safety | Preview deployments do not mutate production data unless explicitly approved and documented. |
| INIT-018 | Should | Automated verification | CI or the hosting gate executes lint and production build on pull requests. |

## 14. Non-functional requirements

### 14.1 Security and privacy

- Treat all form values, URL parameters, uploaded files, cookies, and API responses as untrusted.
- Validate mutations on the server even when fields also have browser constraints.
- Restrict privileged database function execution to the server-only role.
- View tracking must store a one-way hash rather than the raw visitor cookie value.
- Do not introduce cross-origin mutation endpoints without explicit CSRF protection.
- Avoid open redirects from the auth callback.
- Do not log credentials, magic-link codes, visitor identifiers, post drafts, or full session claims.

### 14.2 Reliability

- Public read errors must fail clearly rather than silently returning fabricated content.
- Administrative mutation errors must preserve the editor state where possible and present actionable feedback.
- A failed view-count request must not prevent the article from being read.
- Migrations must be safe to apply in order to an empty project and must remain the schema source of truth.

### 14.3 Performance

- Public content should be server-rendered and cached with the defined revalidation strategy.
- Fonts and stable public assets should use framework-supported optimization.
- Images must preserve aspect ratio and avoid blocking access to article text.
- Client JavaScript must be limited to interactive features.
- No third-party analytics script is required for MVP.

### 14.4 Maintainability

- Route files should remain focused on composition and data loading.
- Shared components are promoted only after a real second consumer exists.
- Database logic belongs in migrations or `lib/`, not duplicated across UI components.
- Environment names and setup instructions must change in the same pull request as code lookups.
- Implementation must follow the current Next.js guides in `node_modules/next/dist/docs/` before framework-sensitive changes.

## 15. Initialization workflow

1. Install Node.js 22.13+ and npm.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and provide a Supabase URL, publishable key, server-only secret key, and site URL.
4. Create or select a Supabase project.
5. Link it with `supabase link --project-ref <project-ref>`.
6. Apply the ordered migrations with `supabase db push`.
7. Regenerate database types with `supabase gen types typescript --linked > types/database.ts`.
8. Start `npm run dev` and use `/admin/login` once to create the initial Auth user.
9. Insert that user's ID into `public.admin_users` through a trusted administrative channel.
10. Verify public routes, draft isolation, admin access, image upload, and publishing.
11. Run `npm run lint` and `npm run build`.
12. Configure the deployment environment, allowed Auth callback, canonical site URL, and compatible image host.

## 16. Delivery plan

| Phase | Deliverable | Exit condition |
| --- | --- | --- |
| 0. Repository bootstrap | Next.js/TypeScript/Tailwind project, scripts, aliases, lockfile | Local development and production build run |
| 1. Backend foundation | Supabase clients, migrations, generated types, RLS, Storage | Schema is reproducible and policies pass manual access checks |
| 2. Security foundation | Auth callback, session proxy, admin allowlist and guards | Anonymous, authenticated non-admin, and admin outcomes are distinct and correct |
| 3. UI foundation | Public/admin shells, design tokens, metadata, prose styles | Responsive and keyboard smoke tests pass |
| 4. Operational readiness | Environment docs, administrator bootstrap, release checklist | Clean environment can be configured and released without undocumented steps |

## 17. Verification strategy

At minimum, each release candidate must verify:

- Fresh dependency installation or lockfile integrity.
- Successful lint and production build.
- Public access to an eligible published post.
- Inability for an anonymous/public client to read a draft.
- Redirect of an unauthenticated admin request to login.
- Redirect of an authenticated but non-allowlisted account to unauthorized.
- Successful allowlisted admin access.
- Server rejection of invalid post fields and unsupported/oversized images.
- Successful schema application and generated-type consistency.
- Absence of secret values from the client bundle and source control.
- Mobile and keyboard usability for public navigation, auth, editor controls, and image dialog.

Automated unit, integration, and end-to-end suites are not currently defined in `package.json`; adding them is a recommended hardening task before the product grows beyond a single operator.

## 18. Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Misconfigured RLS exposes drafts | Critical privacy breach | Keep RLS migrations authoritative; test with anonymous and authenticated clients; retain server guards. |
| Secret key leaks to browser | Critical backend compromise | Server-only module, non-public variable name, bundle review, secret scanning. |
| Supabase project hostname changes | Images fail through Next.js optimization | Update or derive `remotePatterns` as part of environment migration. |
| Preview uses production Supabase | Test edits affect live content | Use isolated preview data or require explicit approval. |
| Auth redirect is omitted in Supabase | Magic links fail after deployment | Add deployed `/auth/callback` to allowed redirects before launch. |
| Schema/types drift | Runtime or type errors | Regenerate `types/database.ts` after every pushed migration and review the diff. |
| Storage files become orphaned | Cost and clutter | Add cleanup policy/tooling in a later operational milestone; current post deletion does not guarantee object cleanup. |
| No automated test suite | Regressions rely on manual QA | Add focused authorization, mutation, and route tests before major feature expansion. |

## 19. Release definition of done

- All Must requirements in section 13 are satisfied.
- Supabase migrations are applied to the target project in order.
- `types/database.ts` matches the target schema.
- Required environment variables and Auth redirects are configured.
- The first administrator is allowlisted through a trusted process.
- `npm run lint` and `npm run build` pass.
- Public/private data-boundary and core accessibility smoke tests pass.
- No secrets or generated build output are committed.
- Setup and deployment instructions reflect the released behavior.

## 20. Open operational decisions

These decisions do not block the local MVP but must be resolved before a formal production launch:

1. Final hosting runtime and domain.
2. Whether preview environments receive isolated Supabase projects.
3. Whether the hard-coded Supabase image hostname should become environment-derived.
4. Monitoring/error-reporting provider and retention policy.
5. Backup, restore, and content-export procedure.
6. Automated test framework and CI provider.
7. Storage lifecycle behavior for replaced cover images and deleted posts.

