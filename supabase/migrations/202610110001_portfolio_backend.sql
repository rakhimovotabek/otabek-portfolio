begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated, service_role;

create table public.portfolio_projects (
  id text primary key check (id ~ '^[a-z0-9-]+$')
);
insert into public.portfolio_projects(id) values
  ('sat-chi'), ('huquq-test'), ('sme-financial-assistant'),
  ('telegram-media-downloader'), ('ielts-progress-tracker');

create table private.portfolio_owners (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table private.portfolio_owners enable row level security;

-- Identity and AAL claims come from Supabase's verified JWT, never request JSON.
create function public.is_portfolio_owner() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((auth.jwt() ->> 'aal') = 'aal2', false)
    and exists (select 1 from private.portfolio_owners where user_id = auth.uid());
$$;
revoke all on function public.is_portfolio_owner() from public, anon, service_role;
grant execute on function public.is_portfolio_owner() to authenticated;

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 80),
  reply_contact text check (reply_contact is null or char_length(btrim(reply_contact)) between 1 and 254),
  message text not null check (char_length(btrim(message)) between 10 and 4000),
  status text not null default 'unread' check (status in ('unread', 'read', 'archived')),
  created_at timestamptz not null default now()
);
create index contact_inbox_order on public.contact_messages(status, created_at desc, id desc);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('project', 'guestbook')),
  target_id text references public.portfolio_projects(id) on update restrict on delete restrict,
  author_name text not null check (char_length(btrim(author_name)) between 2 and 80),
  content text not null check (char_length(btrim(content)) between 3 and 2000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_comment_target check (
    (target_type = 'project' and target_id is not null) or
    (target_type = 'guestbook' and target_id is null)
  )
);
create index comments_public_order on public.comments(target_type, target_id, created_at, id) where status = 'approved';
create index comments_moderation_order on public.comments(status, created_at, id);
create function private.touch_comment() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at := clock_timestamp(); return new; end;
$$;
revoke all on function private.touch_comment() from public, anon, authenticated, service_role;
create trigger comment_updated before update on public.comments
for each row execute function private.touch_comment();

alter table public.portfolio_projects enable row level security;
alter table public.contact_messages enable row level security;
alter table public.comments enable row level security;
revoke all on public.portfolio_projects, public.contact_messages, public.comments from public, anon, authenticated, service_role;

-- Public key grants only an approved projection; no direct anonymous writes.
grant select(id, target_type, target_id, author_name, content, created_at) on public.comments to anon;
create policy approved_comments on public.comments for select to anon using (status = 'approved');

-- Owner operations use the owner's JWT and RLS, not the service credential.
grant select on public.contact_messages, public.comments to authenticated;
grant update(status) on public.contact_messages, public.comments to authenticated;
create policy owner_read_inbox on public.contact_messages for select to authenticated using ((select public.is_portfolio_owner()));
create policy owner_update_inbox on public.contact_messages for update to authenticated using ((select public.is_portfolio_owner())) with check ((select public.is_portfolio_owner()));
create policy owner_read_comments on public.comments for select to authenticated using ((select public.is_portfolio_owner()));
create policy owner_moderate_comments on public.comments for update to authenticated using ((select public.is_portfolio_owner())) with check ((select public.is_portfolio_owner()));

-- Validated server inserts cannot set status or caller-chosen IDs/timestamps.
grant insert(name, reply_contact, message) on public.contact_messages to service_role;
grant insert(target_type, target_id, author_name, content) on public.comments to service_role;

create table private.submission_limits (
  bucket_key text primary key,
  hits integer not null check (hits > 0),
  expires_at timestamptz not null
);
create index submission_limits_expiry on private.submission_limits(expires_at);
alter table private.submission_limits enable row level security;
revoke all on private.portfolio_owners, private.submission_limits from public, anon, authenticated, service_role;

-- Fixed quotas, shared by contact/project/guestbook. Row-locked UPSERTs work
-- across instances. Denied/failed attempts conservatively consume earlier buckets.
create function public.consume_submission_limit(p_subject_hash text) returns boolean
language plpgsql security definer set search_path = '' as $$
declare quota record; stamp timestamptz := clock_timestamp(); accepted text;
begin
  if p_subject_hash !~ '^[0-9a-f]{64}$' or p_subject_hash is null then
    raise exception 'Invalid abuse key';
  end if;
  delete from private.submission_limits where expires_at <= stamp;
  for quota in select * from (values
    ('global-hour', 200, 3600),
    ('ip-hour:' || p_subject_hash, 5, 3600),
    ('ip-day:' || p_subject_hash, 20, 86400)
  ) as limits(bucket, capacity, seconds) loop
    accepted := null;
    insert into private.submission_limits(bucket_key, hits, expires_at)
      values (quota.bucket, 1, stamp + make_interval(secs => quota.seconds))
    on conflict (bucket_key) do update set
      hits = case when private.submission_limits.expires_at <= stamp then 1 else private.submission_limits.hits + 1 end,
      expires_at = case when private.submission_limits.expires_at <= stamp then excluded.expires_at else private.submission_limits.expires_at end
    where private.submission_limits.expires_at <= stamp or private.submission_limits.hits < quota.capacity
    returning bucket_key into accepted;
    if accepted is null then return false; end if;
  end loop;
  return true;
end;
$$;
revoke all on function public.consume_submission_limit(text) from public, anon, authenticated;
grant execute on function public.consume_submission_limit(text) to service_role;

-- Run hourly via a trusted scheduler so idle periods also purge expired hashes.
create function public.purge_submission_limits() returns void
language sql security definer set search_path = '' as $$
  delete from private.submission_limits where expires_at <= clock_timestamp();
$$;
revoke all on function public.purge_submission_limits() from public, anon, authenticated;
grant execute on function public.purge_submission_limits() to service_role;
commit;
