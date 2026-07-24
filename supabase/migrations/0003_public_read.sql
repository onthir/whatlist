
-- =============================================================================
-- WhatList — public (logged-out) read access
--
-- Lets unauthenticated visitors see PUBLIC content only: cached titles,
-- profiles, and reviews (which powers community ratings + review previews).
-- Private data (watchlist/watched, lists, follows, notifications) stays
-- readable only by authenticated users.
--
-- Run this in the SQL Editor of BOTH your dev and prod projects, after 0002.
-- =============================================================================

-- media: cached TMDB titles are public.
drop policy if exists "media_select_anon" on public.media;
create policy "media_select_anon" on public.media
  for select to anon using (true);

-- profiles: public (usernames, display names, avatars, bios).
drop policy if exists "profiles_select_anon" on public.profiles;
create policy "profiles_select_anon" on public.profiles
  for select to anon using (true);

-- reviews: public ratings + written reviews.
drop policy if exists "reviews_select_anon" on public.reviews;
create policy "reviews_select_anon" on public.reviews
  for select to anon using (true);
