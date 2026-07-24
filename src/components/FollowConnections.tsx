import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { UserRow, type UserRowData } from "@/components/UserRow";
import { EmptyState } from "@/components/PosterGrid";
import { cn } from "@/lib/utils";

export async function FollowConnections({
  username,
  mode,
}: {
  username: string;
  mode: "followers" | "following";
}) {
  const supabase = await createClient();
  const user = await getCurrentUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .eq("username", username)
    .maybeSingle();
  if (!profile) notFound();

  // Collect the relevant user ids from the follows table.
  const followsQuery =
    mode === "followers"
      ? supabase.from("follows").select("follower_id").eq("following_id", profile.id)
      : supabase.from("follows").select("following_id").eq("follower_id", profile.id);
  const { data: followRows } = await followsQuery;
  const ids =
    followRows?.map((r) =>
      mode === "followers"
        ? (r as { follower_id: string }).follower_id
        : (r as { following_id: string }).following_id,
    ) ?? [];

  let rows: UserRowData[] = [];
  const followingSet = new Set<string>();

  if (ids.length > 0) {
    const [{ data: people }, myFollows] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, bio")
        .in("id", ids),
      user
        ? supabase.from("follows").select("following_id").eq("follower_id", user.id)
        : Promise.resolve({ data: [] as { following_id: string }[] }),
    ]);
    (myFollows.data ?? []).forEach((f) => followingSet.add(f.following_id));
    rows =
      people?.map((p) => ({
        id: p.id,
        username: p.username,
        displayName: p.display_name ?? p.username,
        avatarUrl: p.avatar_url,
        bio: p.bio,
      })) ?? [];
  }

  const displayName = profile.display_name ?? profile.username;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link
        href={`/u/${profile.username}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft size={15} /> {displayName}
      </Link>

      <div className="flex gap-1 border-b border-border">
        <TabLink href={`/u/${profile.username}/followers`} active={mode === "followers"}>
          Followers
        </TabLink>
        <TabLink href={`/u/${profile.username}/following`} active={mode === "following"}>
          Following
        </TabLink>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={<Users size={34} />}
          title={mode === "followers" ? "No followers yet" : "Not following anyone yet"}
        />
      ) : (
        <div className="space-y-2.5">
          {rows.map((p) => (
            <UserRow
              key={p.id}
              person={p}
              isFollowing={followingSet.has(p.id)}
              showFollow={!!user && user.id !== p.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TabLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative -mb-px px-4 py-2.5 text-sm font-medium transition-colors",
        active ? "text-foreground" : "text-muted hover:text-foreground",
      )}
    >
      {children}
      {active && (
        <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full gradient-brand" />
      )}
    </Link>
  );
}
