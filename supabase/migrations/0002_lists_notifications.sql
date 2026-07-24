-- =============================================================================
-- WhatList — custom lists + notifications
-- Run this in the Supabase SQL Editor AFTER 0001_init.sql.
-- =============================================================================

-- ---- lists -----------------------------------------------------------------
create table if not exists public.lists (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  title       text not null,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists lists_user_idx on public.lists (user_id);

create table if not exists public.list_items (
  list_id    uuid not null references public.lists (id) on delete cascade,
  media_id   uuid not null references public.media (id) on delete cascade,
  position   integer not null default 0,
  note       text,
  created_at timestamptz not null default now(),
  primary key (list_id, media_id)
);
create index if not exists list_items_list_idx on public.list_items (list_id);

drop trigger if exists lists_set_updated_at on public.lists;
create trigger lists_set_updated_at
  before update on public.lists
  for each row execute function public.set_updated_at();

-- ---- notifications ---------------------------------------------------------
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade, -- recipient
  actor_id   uuid not null references public.profiles (id) on delete cascade, -- who acted
  type       text not null default 'follow',
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx
  on public.notifications (user_id, read, created_at desc);

-- Create a notification when someone follows you.
create or replace function public.notify_on_follow()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, actor_id, type)
  values (new.following_id, new.follower_id, 'follow');
  return new;
end;
$$;

drop trigger if exists on_follow_created on public.follows;
create trigger on_follow_created
  after insert on public.follows
  for each row execute function public.notify_on_follow();

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.lists         enable row level security;
alter table public.list_items    enable row level security;
alter table public.notifications enable row level security;

-- lists: readable by all authenticated; only owner writes.
create policy "lists_select" on public.lists
  for select to authenticated using (true);
create policy "lists_write_own" on public.lists
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- list_items: readable by all authenticated; writable only by the list owner.
create policy "list_items_select" on public.list_items
  for select to authenticated using (true);
create policy "list_items_write_own" on public.list_items
  for all to authenticated
  using (
    exists (
      select 1 from public.lists
      where lists.id = list_items.list_id and lists.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.lists
      where lists.id = list_items.list_id and lists.user_id = auth.uid()
    )
  );

-- notifications: recipients can read / update (mark read) / delete their own.
-- Inserts happen via the security-definer trigger only.
create policy "notifications_select_own" on public.notifications
  for select to authenticated using (auth.uid() = user_id);
create policy "notifications_update_own" on public.notifications
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notifications_delete_own" on public.notifications
  for delete to authenticated using (auth.uid() = user_id);
