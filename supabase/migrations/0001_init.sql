-- =============================================================================
-- WhatList — initial schema
-- Run this in the Supabase SQL Editor (or via the Supabase CLI).
-- =============================================================================

-- Case-insensitive text (for usernames).
create extension if not exists citext;

-- ---- Enums -----------------------------------------------------------------
do $$ begin
  create type media_type as enum ('movie', 'tv');
exception when duplicate_object then null; end $$;

do $$ begin
  create type list_status as enum ('watchlist', 'watched');
exception when duplicate_object then null; end $$;

-- ---- profiles --------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  username     citext unique not null,
  display_name text,
  avatar_url   text,
  bio          text,
  created_at   timestamptz not null default now()
);

-- ---- media (shared TMDB cache) ---------------------------------------------
create table if not exists public.media (
  id            uuid primary key default gen_random_uuid(),
  tmdb_id       integer not null,
  media_type    media_type not null,
  title         text not null,
  poster_path   text,
  backdrop_path text,
  release_date  date,
  overview      text,
  genres        jsonb not null default '[]'::jsonb,
  vote_average  numeric(4, 2),
  cached_at     timestamptz not null default now(),
  unique (tmdb_id, media_type)
);

-- ---- user_media (watchlist / watched) --------------------------------------
create table if not exists public.user_media (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  media_id   uuid not null references public.media (id) on delete cascade,
  status     list_status not null default 'watchlist',
  watched_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (user_id, media_id)
);
create index if not exists user_media_user_idx on public.user_media (user_id);
create index if not exists user_media_media_idx on public.user_media (media_id);

-- ---- reviews (rating + optional text) --------------------------------------
create table if not exists public.reviews (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  media_id   uuid not null references public.media (id) on delete cascade,
  rating     smallint check (rating between 1 and 10),
  body       text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, media_id)
);
create index if not exists reviews_media_idx on public.reviews (media_id);
create index if not exists reviews_user_idx on public.reviews (user_id);

-- ---- follows (one-way) -----------------------------------------------------
create table if not exists public.follows (
  follower_id  uuid not null references auth.users (id) on delete cascade,
  following_id uuid not null references auth.users (id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);
create index if not exists follows_following_idx on public.follows (following_id);

-- ---- updated_at trigger for reviews ----------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reviews_set_updated_at on public.reviews;
create trigger reviews_set_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

-- ---- create a profile row on signup ----------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
begin
  base_username := coalesce(
    nullif(new.raw_user_meta_data ->> 'username', ''),
    split_part(new.email, '@', 1),
    'user'
  );
  -- Ensure uniqueness by appending a short suffix if needed.
  if exists (select 1 from public.profiles where username = base_username::citext) then
    base_username := base_username || '_' || substr(new.id::text, 1, 6);
  end if;

  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    base_username,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), base_username)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.profiles   enable row level security;
alter table public.media      enable row level security;
alter table public.user_media enable row level security;
alter table public.reviews    enable row level security;
alter table public.follows    enable row level security;

-- profiles: everyone (authenticated) can read; only owner can write.
create policy "profiles_select" on public.profiles
  for select to authenticated using (true);
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- media: shared cache — readable + writable by any authenticated user.
create policy "media_select" on public.media
  for select to authenticated using (true);
create policy "media_insert" on public.media
  for insert to authenticated with check (true);
create policy "media_update" on public.media
  for update to authenticated using (true) with check (true);

-- user_media: readable by all authenticated; only owner writes.
create policy "user_media_select" on public.user_media
  for select to authenticated using (true);
create policy "user_media_write_own" on public.user_media
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- reviews: readable by all authenticated; only owner writes.
create policy "reviews_select" on public.reviews
  for select to authenticated using (true);
create policy "reviews_write_own" on public.reviews
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- follows: readable by all authenticated; only the follower manages their rows.
create policy "follows_select" on public.follows
  for select to authenticated using (true);
create policy "follows_write_own" on public.follows
  for all to authenticated using (auth.uid() = follower_id) with check (auth.uid() = follower_id);
