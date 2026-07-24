import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { PeopleSearchBar } from "@/components/PeopleSearchBar";
import { UserRow, type UserRowData } from "@/components/UserRow";
import { EmptyState } from "@/components/PosterGrid";

export const metadata = { title: "Find people" };

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  const supabase = await createClient();
  const user = await getCurrentUser();

  // Who the current user already follows.
  const { data: myFollows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user!.id);
  const followingSet = new Set(myFollows?.map((f) => f.following_id) ?? []);

  let profilesQuery = supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio")
    .neq("id", user!.id)
    .limit(30);

  if (query) {
    profilesQuery = profilesQuery.or(
      `username.ilike.%${query}%,display_name.ilike.%${query}%`,
    );
  } else {
    profilesQuery = profilesQuery.order("created_at", { ascending: false });
  }

  const { data: people } = await profilesQuery;

  const rows: UserRowData[] =
    people?.map((p) => ({
      id: p.id,
      username: p.username,
      displayName: p.display_name ?? p.username,
      avatarUrl: p.avatar_url,
      bio: p.bio,
    })) ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Find people</h1>
        <p className="mt-1 text-sm text-muted">
          Follow friends to see what they&apos;re watching.
        </p>
      </div>

      <PeopleSearchBar initialQuery={query} />

      {!query && (
        <p className="text-sm font-medium text-muted">Suggested people</p>
      )}

      {rows.length === 0 ? (
        <EmptyState
          icon={<Users size={36} />}
          title={query ? `No people found for “${query}”` : "No one here yet"}
          subtitle={query ? "Try a different name." : "Invite friends to join WhatList!"}
        />
      ) : (
        <div className="space-y-2.5">
          {rows.map((p) => (
            <UserRow
              key={p.id}
              person={p}
              isFollowing={followingSet.has(p.id)}
              showFollow
            />
          ))}
        </div>
      )}
    </div>
  );
}
