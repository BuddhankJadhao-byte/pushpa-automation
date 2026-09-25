-- ============================================================================
-- Pushpa Automation — database schema, Row Level Security and storage rules.
-- Run once in Supabase → SQL Editor. Safe to re-run (idempotent).
--
-- Security model
--   * Visitors (role "anon") can only READ published content.
--   * Enquiries are written only through submit_inquiry() — never directly.
--   * Only a signed-in user whose CONFIRMED email is listed in public.admins
--     can create, change or delete anything (checked by public.is_admin()).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Owners
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  email text primary key check (email = lower(email))
);
alter table public.admins enable row level security; -- no policies: invisible to the API
revoke all on table public.admins from anon, authenticated;

insert into public.admins (email) values ('pariindia91@gmail.com') on conflict do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users u
    join public.admins a on a.email = lower(u.email)
    where u.id = auth.uid()
      and u.email_confirmed_at is not null
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

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

-- ---------------------------------------------------------------------------
-- Content tables
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  category text not null check (char_length(category) between 2 and 60),
  price text not null default '' check (char_length(price) <= 60),
  summary text not null default '' check (char_length(summary) <= 600),
  specs text[] not null default '{}' check (cardinality(specs) <= 20 and char_length(array_to_string(specs, '')) <= 4000),
  tags text[] not null default '{}' check (cardinality(tags) <= 8 and char_length(array_to_string(tags, '')) <= 320),
  oem text not null default '' check (char_length(oem) <= 80),
  image text check (char_length(image) <= 500),
  published boolean not null default true,
  position integer not null default 0 check (position between 0 and 9999),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 120),
  client text not null default '' check (char_length(client) <= 120),
  location text not null default '' check (char_length(location) <= 120),
  year text not null default '' check (char_length(year) <= 20),
  summary text not null default '' check (char_length(summary) <= 1000),
  tags text[] not null default '{}' check (cardinality(tags) <= 8 and char_length(array_to_string(tags, '')) <= 320),
  image text check (char_length(image) <= 500),
  published boolean not null default true,
  position integer not null default 0 check (position between 0 and 9999),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  author text not null check (char_length(author) between 2 and 80),
  role text not null default '' check (char_length(role) <= 120),
  rating smallint not null default 5 check (rating between 1 and 5),
  body text not null check (char_length(body) between 10 and 1000),
  published boolean not null default true,
  position integer not null default 0 check (position between 0 and 9999),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id smallint primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb check (pg_column_size(data) <= 8192),
  updated_at timestamptz not null default now()
);

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();
drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at before update on public.projects for each row execute function public.set_updated_at();
drop trigger if exists reviews_updated_at on public.reviews;
create trigger reviews_updated_at before update on public.reviews for each row execute function public.set_updated_at();
drop trigger if exists site_settings_updated_at on public.site_settings;
create trigger site_settings_updated_at before update on public.site_settings for each row execute function public.set_updated_at();

-- Visitors read published rows; owners read and write everything.
do $$
declare t text;
begin
  foreach t in array array['products', 'projects', 'reviews'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon, authenticated', t);
    execute format('grant select on table public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on table public.%I to authenticated', t);

    execute format('drop policy if exists "read published" on public.%I', t);
    execute format('create policy "read published" on public.%I for select to anon, authenticated using (published or (select public.is_admin()))', t);
    execute format('drop policy if exists "owner insert" on public.%I', t);
    execute format('create policy "owner insert" on public.%I for insert to authenticated with check ((select public.is_admin()))', t);
    execute format('drop policy if exists "owner update" on public.%I', t);
    execute format('create policy "owner update" on public.%I for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', t);
    execute format('drop policy if exists "owner delete" on public.%I', t);
    execute format('create policy "owner delete" on public.%I for delete to authenticated using ((select public.is_admin()))', t);
  end loop;
end $$;

alter table public.site_settings enable row level security;
revoke all on table public.site_settings from anon, authenticated;
grant select on table public.site_settings to anon, authenticated;
grant insert, update on table public.site_settings to authenticated;
drop policy if exists "read settings" on public.site_settings;
create policy "read settings" on public.site_settings for select to anon, authenticated using (true);
drop policy if exists "owner insert settings" on public.site_settings;
create policy "owner insert settings" on public.site_settings for insert to authenticated with check ((select public.is_admin()));
drop policy if exists "owner update settings" on public.site_settings;
create policy "owner update settings" on public.site_settings for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Enquiries (personal data: readable by owners only)
-- ---------------------------------------------------------------------------
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  phone text not null check (char_length(phone) between 7 and 20),
  email text not null default '' check (char_length(email) <= 120),
  topic text not null check (char_length(topic) between 2 and 60),
  message text not null check (char_length(message) between 5 and 2000),
  source text not null default 'contact' check (source in ('contact', 'estimate')),
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now()
);
create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);

alter table public.inquiries enable row level security;
revoke all on table public.inquiries from anon, authenticated;
grant select, update, delete on table public.inquiries to authenticated;
drop policy if exists "owner read inquiries" on public.inquiries;
create policy "owner read inquiries" on public.inquiries for select to authenticated using ((select public.is_admin()));
drop policy if exists "owner update inquiries" on public.inquiries;
create policy "owner update inquiries" on public.inquiries for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "owner delete inquiries" on public.inquiries;
create policy "owner delete inquiries" on public.inquiries for delete to authenticated using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Rate limiting (sliding window, shared across all server instances)
-- ---------------------------------------------------------------------------
create table if not exists public.rate_limits (
  key text not null check (char_length(key) <= 200),
  hit_at timestamptz not null default now()
);
create index if not exists rate_limits_key_hit_idx on public.rate_limits (key, hit_at);
alter table public.rate_limits enable row level security; -- no policies: only the function below touches it
revoke all on table public.rate_limits from anon, authenticated;

-- Returns true and records a hit when `key` has fewer than `max_hits` hits in the window.
create or replace function public.rate_limit(key text, max_hits integer, window_seconds integer)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  hits integer;
begin
  if char_length(key) > 200 or max_hits not between 1 and 1000 or window_seconds not between 1 and 86400 then
    raise exception 'invalid rate limit arguments';
  end if;

  -- Serialise concurrent requests for the same key.
  perform pg_advisory_xact_lock(hashtextextended(key, 0));

  delete from public.rate_limits r where r.hit_at < now() - interval '1 day';

  select count(*) into hits
  from public.rate_limits r
  where r.key = rate_limit.key and r.hit_at > now() - make_interval(secs => window_seconds);

  if hits >= max_hits then
    return false;
  end if;

  insert into public.rate_limits (key) values (rate_limit.key);
  return true;
end;
$$;
revoke all on function public.rate_limit(text, integer, integer) from public;
grant execute on function public.rate_limit(text, integer, integer) to anon, authenticated;

-- The only way to create an enquiry. Also caps total volume so a flood cannot fill the table.
create or replace function public.submit_inquiry(
  name text, phone text, email text, topic text, message text, source text
)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if not public.rate_limit('inquiry:global', 300, 3600) then
    raise exception 'too many enquiries, try again later';
  end if;

  insert into public.inquiries (name, phone, email, topic, message, source)
  values (
    btrim(submit_inquiry.name), btrim(submit_inquiry.phone), lower(btrim(coalesce(submit_inquiry.email, ''))),
    btrim(submit_inquiry.topic), btrim(submit_inquiry.message), submit_inquiry.source
  );
end;
$$;
revoke all on function public.submit_inquiry(text, text, text, text, text, text) from public;
grant execute on function public.submit_inquiry(text, text, text, text, text, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Image storage: public read, owner-only write, images only, 4 MB max
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 4194304, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "owner read media" on storage.objects;
create policy "owner read media" on storage.objects for select to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
drop policy if exists "owner upload media" on storage.objects;
create policy "owner upload media" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (select public.is_admin()));
drop policy if exists "owner update media" on storage.objects;
create policy "owner update media" on storage.objects for update to authenticated
  using (bucket_id = 'media' and (select public.is_admin()))
  with check (bucket_id = 'media' and (select public.is_admin()));
drop policy if exists "owner delete media" on storage.objects;
create policy "owner delete media" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
