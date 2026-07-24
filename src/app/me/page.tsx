import Link from "next/link";
import { redirect } from "next/navigation";
import { Bookmark, Eye, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { mediaRowToNormalized } from "@/lib/media";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { PosterGrid, EmptyState } from "@/components/PosterGrid";
import { ProfileEditForm } from "@/components/ProfileEditForm";
import type { MediaRow } from "@/lib/types";

export const metadata = { title: "My lists" };

export default async function MePage() {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/me");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  const [{ data: watchlist }, { data: watched }] = await Promise.all([
    supabase
      .from("user_media")
      .select("created_at, media(*)")
      .eq("user_id", user.id)
      .eq("status", "watchlist")
      .order("created_at", { ascending: false }),
    supabase
      .from("user_media")
      .select("created_at, media(*)")
      .eq("user_id", user.id)
      .eq("status", "watched")
      .order("created_at", { ascending: false }),
  ]);

  const watchlistMedia =
    watchlist?.map((r) => mediaRowToNormalized(r.media as unknown as MediaRow)) ?? [];
  const watchedMedia =
    watched?.map((r) => mediaRowToNormalized(r.media as unknown as MediaRow)) ?? [];

  const displayName = profile.display_name ?? profile.username;

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4">
        <Avatar name={displayName} url={profile.avatar_url} size="lg" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{displayName}</h1>
          <p className="text-sm text-muted">@{profile.username}</p>
        </div>
        <Link href={`/u/${profile.username}`}>
          <Button variant="secondary" size="sm">
            <ExternalLink size={15} /> View public profile
          </Button>
        </Link>
      </div>

      <section>
        <Tabs
          tabs={[
            {
              label: "Watched",
              count: watchedMedia.length,
              content:
                watchedMedia.length > 0 ? (
                  <PosterGrid items={watchedMedia} />
                ) : (
                  <EmptyState
                    icon={<Eye size={36} />}
                    title="Nothing watched yet"
                    subtitle="Mark titles as watched and they'll show up here."
                  />
                ),
            },
            {
              label: "Watchlist",
              count: watchlistMedia.length,
              content:
                watchlistMedia.length > 0 ? (
                  <PosterGrid items={watchlistMedia} />
                ) : (
                  <EmptyState
                    icon={<Bookmark size={36} />}
                    title="Your watchlist is empty"
                    subtitle="Search for a movie or show and add it to your watchlist."
                  />
                ),
            },
          ]}
        />
      </section>

      <section className="card p-6">
        <h2 className="mb-1 text-lg font-semibold">Edit profile</h2>
        <p className="mb-5 text-sm text-muted">
          Update how you appear to other people on WhatList.
        </p>
        <ProfileEditForm
          username={profile.username}
          displayName={displayName}
          bio={profile.bio}
          avatarUrl={profile.avatar_url}
        />
      </section>
    </div>
  );
}
