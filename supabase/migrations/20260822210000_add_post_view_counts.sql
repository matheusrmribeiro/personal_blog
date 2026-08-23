alter table public.posts
  add column view_count bigint not null default 0
  check (view_count >= 0);

create table public.post_view_sessions (
  post_id uuid not null references public.posts(id) on delete cascade,
  visitor_id uuid not null,
  last_viewed_at timestamptz not null default now(),
  primary key (post_id, visitor_id)
);

comment on table public.post_view_sessions is
  'Server-only deduplication records used to count one post view per browser every 30 minutes.';

alter table public.post_view_sessions enable row level security;

revoke all on table public.post_view_sessions from anon, authenticated;

-- Updating a counter is not an editorial change and must not move a post to the
-- top of the admin "recently updated" list.
drop trigger posts_set_updated_at on public.posts;

create trigger posts_set_updated_at
before update of
  author_id,
  title,
  slug,
  excerpt,
  content,
  cover_image_url,
  seo_title,
  seo_description,
  status,
  published_at
on public.posts
for each row execute function public.set_updated_at();

create or replace function public.record_post_view(
  p_post_slug text,
  p_visitor_id uuid
)
returns bigint
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_post_id uuid;
  current_view_count bigint;
  view_was_recorded boolean := false;
begin
  select posts.id
  into target_post_id
  from public.posts as posts
  where posts.slug = p_post_slug
    and posts.status = 'published'
    and posts.published_at <= now();

  if target_post_id is null then
    return null;
  end if;

  insert into public.post_view_sessions as sessions (
    post_id,
    visitor_id,
    last_viewed_at
  )
  values (target_post_id, p_visitor_id, now())
  on conflict (post_id, visitor_id) do update
  set last_viewed_at = excluded.last_viewed_at
  where sessions.last_viewed_at <= excluded.last_viewed_at - interval '30 minutes'
  returning true into view_was_recorded;

  if view_was_recorded then
    update public.posts
    set view_count = view_count + 1
    where id = target_post_id
    returning view_count into current_view_count;
  else
    select posts.view_count
    into current_view_count
    from public.posts as posts
    where posts.id = target_post_id;
  end if;

  return current_view_count;
end;
$$;

revoke execute on function public.record_post_view(text, uuid)
  from public, anon, authenticated;
grant execute on function public.record_post_view(text, uuid) to service_role;
