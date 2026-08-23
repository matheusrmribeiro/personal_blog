drop function public.record_post_view(text, uuid);

alter table public.post_view_sessions
  rename column visitor_id to visitor_hash;

alter table public.post_view_sessions
  alter column visitor_hash type text using visitor_hash::text,
  add constraint post_view_sessions_visitor_hash_check
    check (visitor_hash ~ '^[0-9a-f]{64}$');

create function public.record_post_view(
  p_post_slug text,
  p_visitor_hash text
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
    visitor_hash,
    last_viewed_at
  )
  values (target_post_id, p_visitor_hash, now())
  on conflict (post_id, visitor_hash) do update
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

revoke execute on function public.record_post_view(text, text)
  from public, anon, authenticated;
grant execute on function public.record_post_view(text, text) to service_role;

