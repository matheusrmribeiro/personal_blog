create extension if not exists pgcrypto;

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete restrict,
  title text not null check (char_length(title) between 1 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  excerpt text not null default '' check (char_length(excerpt) <= 360),
  content text not null default '',
  cover_image_url text,
  seo_title text check (seo_title is null or char_length(seo_title) <= 70),
  seo_description text check (
    seo_description is null or char_length(seo_description) <= 170
  ),
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status = 'draft' or published_at is not null)
);

create index posts_publication_idx
  on public.posts (status, published_at desc);

create index posts_author_idx
  on public.posts (author_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger posts_set_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.admin_users enable row level security;
alter table public.posts enable row level security;

grant select on public.posts to anon;
grant select, insert, update, delete on public.posts to authenticated;
grant select on public.admin_users to authenticated;

create policy "Published posts are public"
on public.posts
for select
to anon, authenticated
using (status = 'published' and published_at <= now());

create policy "Admins can read every post"
on public.posts
for select
to authenticated
using ((select public.is_admin()));

create policy "Admins can create posts"
on public.posts
for insert
to authenticated
with check (
  (select public.is_admin())
  and author_id = (select auth.uid())
);

create policy "Admins can update posts"
on public.posts
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Admins can delete posts"
on public.posts
for delete
to authenticated
using ((select public.is_admin()));

create policy "Admins can verify their access"
on public.admin_users
for select
to authenticated
using (user_id = (select auth.uid()));

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'post-images',
  'post-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Admins can upload post images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'post-images'
  and (select public.is_admin())
);

create policy "Admins can update post images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'post-images'
  and (select public.is_admin())
)
with check (
  bucket_id = 'post-images'
  and (select public.is_admin())
);

create policy "Admins can delete post images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'post-images'
  and (select public.is_admin())
);

comment on table public.posts is 'Draft and published blog posts managed by authenticated administrators.';
comment on table public.admin_users is 'Allowlist of Supabase Auth users who may manage blog content.';
