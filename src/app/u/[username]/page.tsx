import Link from "next/link";
import { notFound } from "next/navigation";
import { Bookmark, Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { mediaRowToNormalized } from "@/lib/media";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { PosterGrid, EmptyState } from "@/components/PosterGrid";
import { FollowButton } from "@/components/FollowButton";
import { ReviewsFilterable, type ReviewEntry } from "@/components/ReviewsFilterable";
import { ListsGrid } from "@/components/lists/ListsGrid";
import type { MediaRow } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return { title: `@${username}` };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio, created_at")
    .eq("username", username)
    .maybeSingle();

  if (!profile) notFound();

  const user = await getCurrentUser();
  const isSelf = user?.id === profile.id;

  const [
    { data: watchlist },
    { data: watched },
    { data: reviews },
    { data: lists },
    { count: followers },
    { count: following },
    { data: followRow },
  ] = await Promise.all([
    supabase
      .from("user_media")
      .select("created_at, media(*)")
      .eq("user_id", profile.id)
      .eq("status", "watchlist")
      .order("created_at", { ascending: false }),
    supabase
      .from("user_media")
      .select("created_at, media(*)")
      .eq("user_id", profile.id)
      .eq("status", "watched")
      .order("created_at", { ascending: false }),
    supabase
      .from("reviews")
      .select("rating, body, created_at, media(*)")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("lists")
      .select("id, title, list_items(media(poster_path))")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", profile.id),
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", profile.id),
    user && !isSelf
      ? supabase
          .from("follows")
          .select("follower_id")
          .eq("follower_id", user.id)
          .eq("following_id", profile.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const watchlistMedia =
    watchlist?.map((r) => mediaRowToNormalized(r.media as unknown as MediaRow)) ?? [];
  const watchedMedia =
    watched?.map((r) => mediaRowToNormalized(r.media as unknown as MediaRow)) ?? [];

  const reviewEntries: ReviewEntry[] = (reviews ?? []).map((r) => {
    const m = r.media as unknown as MediaRow;
    return {
      mediaType: m.media_type,
      tmdbId: m.tmdb_id,
      title: m.title,
      posterPath: m.poster_path,
      releaseDate: m.release_date,
      rating: r.rating,
      body: r.body,
      date: r.created_at,
    };
  });

  const listData = (lists ?? []).map((l) => {
    const items = (l.list_items as unknown as { media: { poster_path: string | null } | null }[]) ?? [];
    return {
      id: l.id as string,
      title: l.title as string,
      count: items.length,
      posters: items
        .map((it) => it.media?.poster_path ?? null)
        .filter((p): p is string => !!p)
        .slice(0, 4),
    };
  });

  const displayName = profile.display_name ?? profile.username;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <Avatar name={displayName} url={profile.avatar_url} size="xl" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{displayName}</h1>
          <p className="text-sm text-muted">@{profile.username}</p>
          {profile.bio && (
            <p className="mt-2 max-w-lg text-sm text-foreground/90">{profile.bio}</p>
          )}
          <div className="mt-3 flex gap-5 text-sm">
            <Stat value={watchedMedia.length} label="Watched" />
            <Stat value={reviews?.length ?? 0} label="Reviews" />
            <Link href={`/u/${profile.username}/followers`} className="hover:text-brand">
              <Stat value={followers ?? 0} label="Followers" />
            </Link>
            <Link href={`/u/${profile.username}/following`} className="hover:text-brand">
              <Stat value={following ?? 0} label="Following" />
            </Link>
          </div>
        </div>
        <div>
          {isSelf ? (
            <Link href="/me">
              <Button variant="secondary">Edit profile</Button>
            </Link>
          ) : user ? (
            <FollowButton
              targetId={profile.id}
              targetUsername={profile.username}
              initialFollowing={!!followRow}
            />
          ) : (
            <Link href="/login">
              <Button>Follow</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Lists */}
      <Tabs
        tabs={[
          {
            label: "Watched",
            count: watchedMedia.length,
            content:
              watchedMedia.length > 0 ? (
                <PosterGrid items={watchedMedia} />
              ) : (
                <EmptyState icon={<Eye size={36} />} title="Nothing watched yet" />
              ),
          },
          {
            label: "Watchlist",
            count: watchlistMedia.length,
            content:
              watchlistMedia.length > 0 ? (
                <PosterGrid items={watchlistMedia} />
              ) : (
                <EmptyState icon={<Bookmark size={36} />} title="Watchlist is empty" />
              ),
          },
          {
            label: "Reviews",
            count: reviewEntries.length,
            content: <ReviewsFilterable items={reviewEntries} />,
          },
          {
            label: "Lists",
            count: listData.length,
            content: <ListsGrid lists={listData} canCreate={isSelf} />,
          },
        ]}
      />
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <span className="flex items-baseline gap-1">
      <span className="font-bold text-foreground">{value}</span>
      <span className="text-muted">{label}</span>
    </span>
  );
}
