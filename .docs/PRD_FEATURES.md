# Product Requirements Document: Product Features

## Document control

| Field | Value |
| --- | --- |
| Product | Workbench Notes |
| Document | Public blog and private publishing studio features |
| Version | 1.0 |
| Status | MVP baseline specification |
| Last updated | 2026-08-22 |
| Audience | Product owner, engineering, design, QA, operations |
| Companion document | [PRD_PROJECT_INITIALIZATION.md](./PRD_PROJECT_INITIALIZATION.md) |

## 1. Executive summary

Workbench Notes is a personal journal about software, design, and building thoughtful digital products. Readers can discover and read published notes without an account. An allowlisted administrator can sign in through a passwordless email link, create and edit Markdown-backed posts in a rich-text editor, manage imagery and search metadata, save drafts, publish content, and review a small publishing dashboard. Each published article also exposes a privacy-conscious, deduplicated view count.

This document defines the implemented MVP behavior as the product baseline, provides testable acceptance criteria, and makes post-MVP exclusions explicit.

## 2. Product vision

Give one author a quiet, deliberate publishing workflow and give readers a fast, considered place to discover useful writing—without the operational and interface weight of a general-purpose CMS.

## 3. Problem statement

### Reader problem

Readers need a clear way to discover recent writing, understand what an article is about before opening it, and consume long-form technical/design content comfortably across devices.

### Author problem

The author needs a private, low-friction place to draft, format, illustrate, optimize, publish, update, and remove posts without editing database rows or redeploying the application for every content change.

## 4. Goals

1. Present a distinctive, responsive public blog with a focused homepage, archive, article pages, and author page.
2. Make published content discoverable through useful titles, excerpts, dates, reading time, metadata, and cover imagery.
3. Give an approved administrator a secure passwordless publishing workflow.
4. Support Markdown as the durable content format while providing a visual editor.
5. Support private drafts and deliberate immediate publishing.
6. Allow cover and in-body image upload with appropriate validation and accessible display.
7. Show a privacy-conscious aggregate view count without installing a third-party analytics product.

## 5. Non-goals for MVP

- Reader accounts, profiles, likes, bookmarks, or comments.
- Multiple publications, teams, roles, or editorial approval workflows.
- Scheduled publishing, revisions, autosave, collaborative editing, or preview links for drafts.
- Tags, categories, full-text search, pagination, related posts, or recommendation ranking.
- A managed newsletter; the current reading-list call to action is an email link only.
- RSS/Atom feeds, sitemap generation, or a robots-management interface.
- Localization or translated content.
- Full analytics dashboards, traffic sources, geography, or unique-reader reporting.
- Automated image transformation, media library browsing, or orphan-file cleanup.

## 6. Personas

### 6.1 Reader

- Arrives from the homepage, a shared article URL, or search/social metadata.
- Wants scannable context and a distraction-light reading experience.
- Uses mobile or desktop and may rely on keyboard or assistive technology.
- Does not need or receive an account.

### 6.2 Administrator/author

- Is a trusted Supabase Auth user explicitly listed in `admin_users`.
- Wants to create, edit, format, illustrate, publish, unpublish, and delete posts.
- Needs clear status, validation, save feedback, and a compact view of the content library.
- Is expected to be a single primary operator in MVP, even though the data model can allowlist more than one user.

### 6.3 Authenticated non-administrator

- Has completed Supabase sign-in but is not allowlisted.
- Must receive a clear access-not-configured state and no access to drafts or mutations.

## 7. Experience principles

- **Editorial first:** writing and reading remain the dominant tasks.
- **Quiet by default:** no pop-ups, engagement traps, or mandatory accounts.
- **Deliberate publishing:** draft and publish actions are explicit.
- **Useful context:** every post provides an excerpt, publication date, estimated reading time, and view count.
- **Progressive interaction:** public content remains available without client-side JavaScript except for enhancements such as view refresh and image expansion.
- **Accessible control:** navigation, forms, formatting controls, feedback, and image expansion work with keyboard and useful labels.

## 8. Information architecture

| Route | Audience | Purpose | Rendering/cache |
| --- | --- | --- | --- |
| `/` | Public | Brand introduction, latest featured post, recent notes, reading-list CTA | Server-rendered, 60-second revalidation |
| `/posts` | Public | Complete published-notes archive | Server-rendered, 60-second revalidation |
| `/posts/[slug]` | Public | Individual published article | Server-rendered, 60-second revalidation |
| `/about` | Public | Author and publication context | Server-rendered |
| `/admin/login` | Public/auth | Passwordless administrator sign-in | Force-dynamic |
| `/auth/callback` | Auth flow | Exchange magic-link code and establish session | Route handler |
| `/admin/unauthorized` | Authenticated non-admin | Explain missing allowlist access | Force-dynamic |
| `/admin` | Administrator | Publishing dashboard | Force-dynamic |
| `/admin/posts` | Administrator | Full post library | Force-dynamic |
| `/admin/posts/new` | Administrator | Create a post | Force-dynamic |
| `/admin/posts/[id]/edit` | Administrator | Edit or delete a post | Force-dynamic |
| `/api/posts/[slug]/view` | Same-origin public client | Record/deduplicate a published-post view | POST, private/no-store response |

## 9. Functional requirements

Priorities use Must, Should, and Could. Must requirements define MVP release acceptance.

### 9.1 Shared public shell

| ID | Priority | Requirement | Acceptance criteria |
| --- | --- | --- | --- |
| PUB-001 | Must | Site identity | Header displays “Workbench Notes.” and links it to `/`. |
| PUB-002 | Must | Primary navigation | Header exposes Notes and About links in a semantic navigation landmark. |
| PUB-003 | Must | Footer | Public pages show the current year and site name. |
| PUB-004 | Must | Responsive layout | Header, footer, typography, cards, images, and content remain usable at 320 px and common desktop widths. |
| PUB-005 | Must | Focus and semantics | Links and controls are keyboard reachable, have visible focus behavior, and use semantic HTML. |

### 9.2 Homepage

| ID | Priority | Requirement | Acceptance criteria |
| --- | --- | --- | --- |
| HOME-001 | Must | Editorial introduction | The page presents the publication purpose and primary headline before the post list. |
| HOME-002 | Must | Latest-post selection | Up to three eligible published posts are loaded in reverse `published_at` order. |
| HOME-003 | Must | Featured post | When at least one post exists, the newest appears as the lead story with title, excerpt, date, reading time, and a link to its article. |
| HOME-004 | Must | Featured imagery | If the lead post has a cover image, it is shown with a readable gradient treatment and can be expanded; a styled fallback appears without an image. |
| HOME-005 | Must | Recent notes | Posts two and three render as recent-note cards and a “View all” link leads to `/posts`. The section is omitted when there are no additional posts. |
| HOME-006 | Must | Empty state | When no eligible posts exist, the page communicates that the first story is being written and does not show broken post UI. |
| HOME-007 | Must | Reading-list CTA | The page offers an email-based expression of interest. Before production, `hello@example.com` must be replaced with an owned address or the CTA removed. |

### 9.3 Notes archive

| ID | Priority | Requirement | Acceptance criteria |
| --- | --- | --- | --- |
| ARCH-001 | Must | Published-post list | `/posts` displays all posts visible through the published-content policy, newest first. |
| ARCH-002 | Must | Post summaries | Each card shows title, excerpt, publication date, estimated reading time, and a link to `/posts/[slug]`. |
| ARCH-003 | Must | Empty state | If no published posts exist, the archive displays a clear “No published posts yet” message. |
| ARCH-004 | Must | Metadata | The archive has a specific page title and description. |
| ARCH-005 | Could | Large-library navigation | Pagination or cursor loading may be added when the post volume makes a single list impractical. It is not part of MVP. |

### 9.4 Article page and content rendering

| ID | Priority | Requirement | Acceptance criteria |
| --- | --- | --- | --- |
| POST-001 | Must | Published-only resolution | A valid eligible slug displays the article; a missing, draft, future-dated, or unknown slug returns the not-found experience. |
| POST-002 | Must | Article header | The page shows title, excerpt, publication date, estimated reading time, view count, and a back link to the archive. |
| POST-003 | Must | Markdown rendering | Stored Markdown renders paragraphs, H2/H3 headings, bold, italic, links, lists, blockquotes, inline code, fenced code, and GFM-compatible content. |
| POST-004 | Must | Cover image | An optional cover appears at a wide article ratio with useful alt text and an expand control. |
| POST-005 | Must | In-body images | Markdown images render responsively, preserve supplied alt text, and support small (40%), medium (70%), and large/full-width display markers. |
| POST-006 | Must | Image lightbox | Expandable images open in a modal overlay, expose dialog semantics, support Escape and outside-click closing, trap focus to the close control, lock background scrolling, and return focus to the trigger. |
| POST-007 | Must | Reading-time estimate | Reading time is calculated from content at 220 words per minute, rounded up, with a minimum of one minute. |
| POST-008 | Must | Per-post metadata | SEO title/description overrides are preferred; otherwise title/excerpt are used. Open Graph article data includes publication time and optional cover image. Twitter card type reflects whether an image exists. |

### 9.5 About page

| ID | Priority | Requirement | Acceptance criteria |
| --- | --- | --- | --- |
| ABOUT-001 | Must | Author context | `/about` explains who writes the site and what readers can expect. |
| ABOUT-002 | Must | Author image | The page loads the author profile image from the public `post-images/about/profile-picture.jpg` object, supplies descriptive alt text, and supports expansion. |
| ABOUT-003 | Must | Page metadata | The page defines a specific title and description. |
| ABOUT-004 | Should | Deployment prerequisite | Production provisioning verifies the profile image exists or replaces the design with a non-broken fallback. |

### 9.6 Passwordless authentication

| ID | Priority | Requirement | Acceptance criteria |
| --- | --- | --- | --- |
| AUTH-001 | Must | Email magic-link request | `/admin/login` accepts a valid email and requests a Supabase OTP/magic link whose redirect target is `/auth/callback?next=/admin`. |
| AUTH-002 | Must | Submission feedback | The form indicates progress, prevents duplicate submission while pending, and reports either the provider error or an instruction to check email. |
| AUTH-003 | Must | Session callback | A valid callback code is exchanged for a session and redirects to a safe relative destination. Invalid/missing exchange redirects to login with a useful error. |
| AUTH-004 | Must | Existing admin redirect | An already authenticated, allowlisted administrator visiting login is redirected to `/admin`. |
| AUTH-005 | Must | Unauthenticated protection | A user without a valid session who requests an admin dashboard route is redirected to `/admin/login`. |
| AUTH-006 | Must | Non-admin protection | An authenticated user absent from `admin_users` is redirected to `/admin/unauthorized` and cannot query drafts or mutate posts. |
| AUTH-007 | Must | Unauthorized guidance | The unauthorized page shows the signed-in email when available and offers retry, sign-out, and return-to-blog actions. |
| AUTH-008 | Must | Sign-out | Sign-out clears the Supabase session and redirects to admin login. |

### 9.7 Admin shell and dashboard

| ID | Priority | Requirement | Acceptance criteria |
| --- | --- | --- | --- |
| ADMIN-001 | Must | Protected shell | Every dashboard page renders only after `requireAdmin()` succeeds. |
| ADMIN-002 | Must | Studio navigation | The admin shell identifies the signed-in user and links to overview, posts, create-post, public blog, and sign-out actions as implemented by the shared sidebar. |
| ADMIN-003 | Must | Summary metrics | `/admin` shows total, published, and draft post counts derived from all administrator-visible posts. |
| ADMIN-004 | Must | Recent activity | Up to five posts, ordered by latest editorial update, display title, update date, status, and an edit link. View increments must not alter this order. |
| ADMIN-005 | Must | Empty dashboard | A new administrator with no posts receives a clear path to create the first post. |

### 9.8 Post library

| ID | Priority | Requirement | Acceptance criteria |
| --- | --- | --- | --- |
| LIB-001 | Must | Complete library | `/admin/posts` shows all drafts and published posts, ordered by `updated_at` descending. |
| LIB-002 | Must | Row information | Each row shows title, public-path preview, status, last update date, and edit action. |
| LIB-003 | Must | Responsive table | The table remains accessible through horizontal scrolling on narrow screens without clipping actions. |
| LIB-004 | Must | Empty library | The empty state explains the draft-first workflow and links to post creation. |

### 9.9 Post editor

| ID | Priority | Requirement | Acceptance criteria |
| --- | --- | --- | --- |
| EDIT-001 | Must | Create and edit modes | The same editor supports a blank new post and an existing post populated by UUID. Unknown IDs show not found. |
| EDIT-002 | Must | Title | Title is required, trimmed, and limited to 160 characters. |
| EDIT-003 | Must | Slug generation | Before manual editing, title changes produce a normalized lowercase hyphenated slug. Manual slug edits remain authoritative. |
| EDIT-004 | Must | Slug validation | The slug is required, unique, and matches lowercase letters/numbers separated by single hyphens. A conflict produces field-level feedback. |
| EDIT-005 | Must | Excerpt | Excerpt is required, trimmed, and limited to 360 characters. |
| EDIT-006 | Must | Durable Markdown | Editor content is persisted as Markdown, not proprietary editor JSON. |
| EDIT-007 | Must | Rich formatting | Text selection supports paragraph, H2, H3, bold, italic, unordered list, ordered list, blockquote, link, and code block operations. |
| EDIT-008 | Must | Code blocks | Code blocks support JavaScript, TypeScript, and plain-text language selection and keyboard tab indentation. |
| EDIT-009 | Must | Draft validation | A draft may be saved with empty content but still requires valid title, slug, and excerpt. |
| EDIT-010 | Must | Publish validation | Publishing requires non-empty content in addition to all common field requirements. |
| EDIT-011 | Must | Explicit intent | Separate “Publish now” and “Save draft” controls determine status. Publishing sets `published_at` to the current time; saving as draft clears it. |
| EDIT-012 | Must | Busy state | Save actions and editor changes are disabled while content images are uploading or deleting and while the form is submitting. |
| EDIT-013 | Must | Error feedback | Validation and upload errors are shown near the relevant field or editor and announced appropriately. |
| EDIT-014 | Must | Save completion | A successful save invalidates affected caches, redirects to the canonical edit route, and shows a success message. |
| EDIT-015 | Must | Published preview | An existing published post offers a link to open its public article in a new tab. |

### 9.10 Cover image and SEO fields

| ID | Priority | Requirement | Acceptance criteria |
| --- | --- | --- | --- |
| MEDIA-001 | Must | Cover upload | An administrator can upload JPG, PNG, WebP, or GIF cover images no larger than 5 MB. |
| MEDIA-002 | Must | Cover URL | An administrator may alternatively provide a valid HTTP/HTTPS cover URL. |
| MEDIA-003 | Must | Uploaded cover storage | Accepted files receive collision-resistant paths under the administrator's folder in the public `post-images` bucket. |
| MEDIA-004 | Must | SEO overrides | Optional SEO title and description accept at most 70 and 170 characters respectively. |
| MEDIA-005 | Must | Metadata fallback | Empty SEO fields cause title and excerpt to be used in article metadata. |
| MEDIA-006 | Should | Replacement cleanup | A future hardening change should remove no-longer-referenced managed cover objects after a successful replacement. MVP does not guarantee this. |

### 9.11 In-body image editing

| ID | Priority | Requirement | Acceptance criteria |
| --- | --- | --- | --- |
| BODYIMG-001 | Must | Upload methods | The administrator can add one or more images through file selection or paste image files into the editor. |
| BODYIMG-002 | Must | Validation | Server validation allows only JPG, PNG, WebP, and GIF up to 5 MB regardless of browser accept filters. |
| BODYIMG-003 | Must | Managed paths | Uploaded content images use `<admin-uuid>/content/<random-uuid>.<extension>` and long-lived cache headers. |
| BODYIMG-004 | Must | Default insertion | Successful uploads are inserted at large width with alt text derived from the file name. |
| BODYIMG-005 | Must | Image sizing | Selected images can switch between small, medium, and large display markers while remaining valid Markdown image URLs. |
| BODYIMG-006 | Must | Managed deletion | Deleting a managed content image removes the exact allowed Storage object before removing the editor node; foreign URLs are removed only from content. |
| BODYIMG-007 | Must | Deletion safety | The server accepts deletion only for the configured Supabase origin, public bucket prefix, and UUID-based content-image path pattern. |
| BODYIMG-008 | Must | Partial failure | If one upload fails, the editor reports the failure and can continue processing other selected images without corrupting existing content. |

### 9.12 Publishing, unpublishing, and deletion

| ID | Priority | Requirement | Acceptance criteria |
| --- | --- | --- | --- |
| FLOW-001 | Must | Publish visibility | After a successful publish and cache invalidation, the post is eligible for homepage, archive, and slug-page reads. |
| FLOW-002 | Must | Draft privacy | Saving an existing post as draft removes it from public reads after cache invalidation while retaining it in the admin library. |
| FLOW-003 | Must | Update | Saving an existing UUID updates that record rather than creating a duplicate. |
| FLOW-004 | Must | Delete confirmation | The edit page asks for explicit browser confirmation before permanent deletion. |
| FLOW-005 | Must | Delete authorization | The server validates the UUID, requires administrator access, deletes the post, invalidates lists, and redirects to the library. |
| FLOW-006 | Must | Deletion effect | Deleted posts are absent from public/admin queries and their view-session rows are removed by cascade. |
| FLOW-007 | Should | Storage cleanup | Post deletion should eventually remove all referenced managed media. It is an operational follow-up, not current MVP behavior. |

### 9.13 View counting

| ID | Priority | Requirement | Acceptance criteria |
| --- | --- | --- | --- |
| VIEW-001 | Must | Record after render | The article initially renders the stored aggregate and asynchronously POSTs to the same-origin view endpoint. |
| VIEW-002 | Must | Same-origin mutation | Requests whose `Origin` does not equal the application origin receive HTTP 403. |
| VIEW-003 | Must | Slug validation | Invalid or longer-than-160-character slugs receive HTTP 400 before privileged database access. |
| VIEW-004 | Must | Published-only counting | Unknown, draft, or future-dated posts receive HTTP 404 and are not counted. |
| VIEW-005 | Must | Browser identifier | The server reuses a valid one-year HttpOnly `blog_visitor_id` UUID cookie or creates one with `SameSite=Lax`, root path, and `Secure` in production. |
| VIEW-006 | Must | Data minimization | The database stores a SHA-256 hash derived from slug and cookie UUID, never the raw UUID. |
| VIEW-007 | Must | Deduplication | One browser increments a given post at most once per 30-minute window; repeat requests return the current count. |
| VIEW-008 | Must | Atomic count | Deduplication and count update occur in the database function, and the returned non-negative integer refreshes the visible count. |
| VIEW-009 | Must | Failure isolation | Tracking errors do not block reading or replace the server-rendered initial count; expected response codes are 400, 403, 404, 500, and 503 as applicable. |
| VIEW-010 | Must | No-cache response | Successful count responses use private, no-store caching semantics. |

## 10. Core user journeys

### 10.1 Reader discovers and reads a note

1. Reader opens `/` and sees the publication introduction.
2. The latest published post appears as featured; up to two more appear below.
3. Reader reviews date, reading time, title, and excerpt.
4. Reader opens the article.
5. Server returns published Markdown content and its current count.
6. Browser attempts a same-origin view record; the displayed count updates only if a valid result returns.
7. Reader may expand cover or in-body images and return to the archive.

### 10.2 Administrator signs in

1. Administrator opens `/admin/login` and submits an email.
2. Supabase sends a secure magic link.
3. The link returns through `/auth/callback`, which exchanges the code for a cookie session.
4. `requireAdmin()` verifies both claims and the `admin_users` allowlist.
5. An allowlisted user reaches the dashboard; a non-allowlisted user receives the unauthorized page.

### 10.3 Administrator creates a draft

1. Administrator chooses “Write a new post.”
2. Title automatically generates a slug until the slug is manually edited.
3. Administrator supplies an excerpt and may add content, cover, in-body images, and SEO overrides.
4. “Save draft” validates all common fields but permits empty content.
5. The post is stored privately and the edit page displays save confirmation.

### 10.4 Administrator publishes a post

1. Administrator opens a new or existing post.
2. “Publish now” validates non-empty content and all field/file constraints.
3. The record becomes `published`, receives the current publication timestamp, and affected paths are revalidated.
4. Administrator lands on the canonical edit page and can open the public article.

### 10.5 Administrator unpublishes or deletes

- To unpublish, the administrator saves the post as a draft; public eligibility and `published_at` are removed.
- To delete, the administrator confirms the destructive action; the post and view sessions are removed and the user returns to the library.

## 11. Data and permissions matrix

| Resource/action | Anonymous reader | Authenticated non-admin | Administrator | Privileged server |
| --- | --- | --- | --- | --- |
| Read eligible published posts | Yes | Yes | Yes | Yes |
| Read drafts/future posts | No | No | Yes | Yes |
| Create/update/delete posts | No | No | Yes | Yes |
| Read own allowlist record | No | Yes, own row only | Yes, own row only | Yes |
| Upload/update/delete post images | No | No | Yes | Yes |
| Read public post images | Yes | Yes | Yes | Yes |
| Read/write view sessions directly | No | No | No | Yes |
| Execute `record_post_view` RPC | No | No | No | Yes |

## 12. Content-state model

| Current state | Action | Resulting state | Publicly visible |
| --- | --- | --- | --- |
| New/unsaved | Save draft | Draft | No |
| New/unsaved | Publish now with valid content | Published | Yes after revalidation/RLS eligibility |
| Draft | Save draft | Draft | No |
| Draft | Publish now with valid content | Published with new current timestamp | Yes |
| Published | Publish now | Published with refreshed current timestamp | Yes |
| Published | Save draft | Draft with `published_at = null` | No after revalidation |
| Draft or published | Confirm delete | Deleted | No |

MVP has no scheduled, archived, review, or soft-deleted state.

## 13. Validation and error behavior

| Input/condition | Expected outcome |
| --- | --- |
| Blank title | Field error; no save |
| Invalid or duplicate slug | Field error; no save |
| Blank excerpt | Field error; no save |
| Empty published content | Editor error; no publish |
| Empty draft content | Allowed if common fields are valid |
| SEO text over limit | Field error; no save |
| Invalid external cover URL | Field error; no save |
| Unsupported/oversized image | Actionable upload error; no unsafe object stored |
| Missing admin session | Redirect to login |
| Authenticated non-admin | Redirect to unauthorized |
| Unknown post UUID in editor | Not found |
| Unknown/unpublished public slug | Not found |
| View API/database failure | Preserve readable article and initial count |

## 14. Search, sharing, and metadata requirements

- Site metadata uses `NEXT_PUBLIC_SITE_URL` as its production origin.
- Default site title is “Workbench Notes” with child pages using the title template.
- A default 1200×630 Open Graph image is served from `/og.png`.
- The article page uses SEO overrides when present and post content fallbacks otherwise.
- Article Open Graph metadata declares article type and publication time.
- Cover images are included in article Open Graph and Twitter metadata when available.
- Archive, About, and login routes each define appropriate titles/descriptions where public discovery is relevant.
- Canonical tags, sitemap, feed, and structured Article JSON-LD are not currently implemented and belong to a future discoverability milestone.

## 15. Accessibility requirements

- Public navigation uses a named navigation landmark.
- Headings follow a meaningful page hierarchy with one primary H1.
- Form fields have visible text labels; required constraints and errors are conveyed in text.
- Dynamic login, editor, and view-count feedback uses status/alert/live semantics as appropriate.
- Icon-only buttons have accessible names.
- Formatting and image-size buttons expose pressed state where applicable.
- The image lightbox provides dialog semantics, keyboard dismissal, focus containment, scroll lock, and focus restoration.
- Images must have useful alt text; administrators remain responsible for improving filename-derived text when editorial tooling permits.
- Color must not be the sole indicator of post status or error state.
- All essential flows must be possible with keyboard only.

## 16. Performance and reliability requirements

- Public pages are server-rendered and use 60-second revalidation where posts can change.
- Admin pages bypass static caching.
- Saving or deleting revalidates affected public and admin paths.
- Content remains readable if view tracking is aborted, unavailable, or returns malformed data.
- Public queries rely on database RLS rather than client filtering of drafts.
- Editor file operations disable conflicting submission to avoid saving transient content state.
- Long articles and code blocks must not create page-wide horizontal overflow.
- View-count increments must not change editorial `updated_at`.

## 17. Product success measures

MVP success focuses on outcome and reliability rather than growth targets.

| Measure | Initial target |
| --- | --- |
| Publish workflow completion | Administrator can create and publish a valid post without database/manual file edits |
| Draft confidentiality | Zero known public reads of draft or future content |
| Core route availability | Homepage, archive, article, about, login, and admin library pass release smoke tests |
| Content correctness | Published title, excerpt, Markdown, cover, metadata, and status match administrator input |
| View-count integrity | Repeat view within 30 minutes does not increment for the same browser/post |
| Build quality | Lint and production build pass for every release |
| Accessibility | Core reader and administrator journeys complete with keyboard only |

Traffic-growth, subscriber-conversion, and search-performance targets require analytics and newsletter capabilities that are outside MVP.

## 18. Release acceptance scenarios

1. **Zero-content launch:** With no posts, public home/archive and admin dashboard/library show correct empty states.
2. **Draft isolation:** Admin creates a draft with empty content; it appears in the studio and cannot be retrieved publicly by slug or public query.
3. **First publication:** Admin adds valid content and publishes; the post becomes featured, appears in the archive, and resolves by slug with correct metadata.
4. **Update and unpublish:** Admin edits the post, republishes, then saves as draft; public content updates and then becomes unavailable after revalidation.
5. **Authorization:** Anonymous user and signed-in non-admin cannot access the dashboard or mutate posts; allowlisted admin can.
6. **Media:** Admin uploads supported cover/content images, resizes an in-body image, publishes it, expands it publicly, and safely deletes a managed content image.
7. **View deduplication:** First same-origin article view increments once; repeat within 30 minutes does not; the page remains readable when the endpoint fails.
8. **Destructive flow:** Admin cancels deletion once, then confirms; post disappears from library and public routes and view-session rows cascade.
9. **Responsive/accessibility:** Reader and admin core journeys work at 320 px, desktop width, and keyboard-only navigation.
10. **Release gate:** `npm run lint` and `npm run build` both succeed with production-like environment configuration.

## 19. Post-MVP roadmap candidates

These are candidates, not committed scope. Prioritization should be driven by observed author/reader needs.

| Candidate | User value | Key dependency/risk |
| --- | --- | --- |
| Draft preview links | Review unpublished work on real layouts | Secure expiring tokens and cache isolation |
| Autosave and revision history | Reduce writing-loss risk | Conflict semantics and storage growth |
| Scheduled publishing | Publish without manual timing | Scheduler reliability and timezone UX |
| Search, tags, and pagination | Improve discovery as library grows | Schema and URL design |
| RSS, sitemap, canonical URLs, JSON-LD | Improve syndication and search discoverability | Metadata strategy |
| Real newsletter integration | Replace mailto CTA with subscription workflow | Consent, provider, privacy policy |
| Media library and cleanup | Reuse images and prevent orphan storage | Reference tracking and safe deletion |
| Analytics dashboard | Understand content performance | Privacy model and retention policy |
| Automated tests | Reduce regression risk | Test framework and isolated Supabase environment |
| Multiple editorial roles | Support a team | Role model, RLS redesign, audit log |

## 20. Known launch decisions and content prerequisites

1. Replace `hello@example.com` with an owned contact/list address or remove the reading-list CTA.
2. Ensure `post-images/about/profile-picture.jpg` exists in the production Supabase bucket or implement a fallback.
3. Confirm the final site title, author copy, default Open Graph image, and favicon.
4. Confirm the deployed Supabase hostname is accepted by Next.js image configuration.
5. Decide whether republishing an already-published post should reset `published_at`; this is the current MVP behavior.
6. Define the manual recovery procedure for accidentally deleted posts because deletion is permanent and no revision history exists.
7. Decide when library size warrants pagination, search, tags, or archive grouping.

