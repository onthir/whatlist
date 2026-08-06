import { Users, Search } from "lucide-react";
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

  // Only search when the user has typed something — no auto-suggestions.
  let rows: UserRowData[] = [];
  const followingSet = new Set<string>();

  if (query) {
    const [{ data: people }, { data: myFollows }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, bio")
        .neq("id", user!.id)
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(30),
      supabase.from("follows").select("following_id").eq("follower_id", user!.id),
    ]);

    (myFollows ?? []).forEach((f) => followingSet.add(f.following_id));
    rows =
      people?.map((p) => ({
        id: p.id,
        username: p.username,
        displayName: p.display_name ?? p.username,
        avatarUrl: p.avatar_url,
        bio: p.bio,
      })) ?? [];
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Find people</h1>
        <p className="mt-1 text-sm text-muted">
          Search by username to follow friends and see what they&apos;re watching.
        </p>
      </div>

      <PeopleSearchBar initialQuery={query} />

      {!query ? (
        <EmptyState
          icon={<Search size={36} />}
          title="Search for someone"
          subtitle="Enter a username (or display name) above to find people to follow."
        />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<Users size={36} />}
          title={`No people found for “${query}”`}
          subtitle="Check the spelling or try their exact username."
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
