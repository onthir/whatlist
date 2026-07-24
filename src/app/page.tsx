import Link from "next/link";
import Image from "next/image";
import { Sparkles, Users, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { getTrending, posterUrl } from "@/lib/tmdb";
import { PosterGrid, EmptyState } from "@/components/PosterGrid";
import { FeedItem, type FeedItemData } from "@/components/FeedItem";
import { Button } from "@/components/ui/Button";
import type { MediaRow, NormalizedMedia } from "@/lib/types";

async function safeTrending(): Promise<NormalizedMedia[]> {
  try {
    return (await getTrending()).slice(0, 12);
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  const trending = await safeTrending();

  // -------- Logged out: landing --------
  if (!user) {
    // A public sample of recent written reviews (RLS allows anon read).
    const { data: recentRows } = await supabase
      .from("reviews")
      .select(
        "rating, body, created_at, profiles(username, display_name, avatar_url), media(*)",
      )
      .not("body", "is", null)
      .order("created_at", { ascending: false })
      .limit(6);

    const recent: FeedItemData[] = (recentRows ?? []).map((r) => {
      const p = r.profiles as unknown as {
        username: string;
        display_name: string | null;
        avatar_url: string | null;
      };
      return {
        username: p.username,
        displayName: p.display_name ?? p.username,
        avatarUrl: p.avatar_url,
        media: r.media as unknown as MediaRow,
        rating: r.rating,
        body: r.body,
        date: r.created_at,
      };
    });

    return (
      <div className="space-y-12">
        <section className="relative overflow-hidden rounded-3xl border border-border bg-surface/50 px-6 py-16 text-center sm:py-24">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
              Track everything you{" "}
              <span className="gradient-text">watch</span>.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-muted">
              Build your watchlist, log movies &amp; TV you&apos;ve seen, rate and
              review them, and follow friends to see what they&apos;re into.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/signup">
                <Button size="lg">Get started — it&apos;s free</Button>
              </Link>
              <Link href="/search">
                <Button size="lg" variant="secondary">
                  Browse titles
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {recent.length > 0 && (
          <section>
            <SectionHeading icon={<Sparkles size={18} />} title="Recent reviews from the community" />
            <div className="grid gap-3 sm:grid-cols-2">
              {recent.map((item, i) => (
                <FeedItem key={i} item={item} />
              ))}
            </div>
            <p className="mt-4 text-center text-sm text-muted">
              <Link href="/signup" className="font-medium text-brand hover:underline">
                Sign up
              </Link>{" "}
              to rate, review, and follow other watchers.
            </p>
          </section>
        )}

        {trending.length > 0 && (
          <section>
            <SectionHeading icon={<TrendingUp size={18} />} title="Trending this week" />
            <PosterGrid items={trending} />
          </section>
        )}
      </div>
    );
  }

  // -------- Logged in: feed --------
  const { data: follows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id);
  const followingIds = follows?.map((f) => f.following_id) ?? [];

  let feed: FeedItemData[] = [];
  if (followingIds.length > 0) {
    const { data: reviews } = await supabase
      .from("reviews")
      .select(
        "rating, body, created_at, profiles(username, display_name, avatar_url), media(*)",
      )
      .in("user_id", followingIds)
      .order("created_at", { ascending: false })
      .limit(20);

    feed =
      reviews?.map((r) => {
        const p = r.profiles as unknown as {
          username: string;
          display_name: string | null;
          avatar_url: string | null;
        };
        return {
          username: p.username,
          displayName: p.display_name ?? p.username,
          avatarUrl: p.avatar_url,
          media: r.media as unknown as MediaRow,
          rating: r.rating,
          body: r.body,
          date: r.created_at,
        };
      }) ?? [];
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
      <section>
        <SectionHeading icon={<Sparkles size={18} />} title="From people you follow" />
        {feed.length > 0 ? (
          <div className="space-y-3">
            {feed.map((item, i) => (
              <FeedItem key={i} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Users size={36} />}
            title="Your feed is quiet"
            subtitle={
              followingIds.length === 0
                ? "Follow some people to see their reviews here."
                : "The people you follow haven't reviewed anything yet."
            }
          />
        )}
        <div className="mt-4">
          <Link href="/people">
            <Button variant="outline" size="sm">
              <Users size={15} /> Find people to follow
            </Button>
          </Link>
        </div>
      </section>

      <aside>
        <SectionHeading icon={<TrendingUp size={18} />} title="Trending" />
        {trending.length > 0 ? (
          <div className="grid grid-cols-3 gap-3 lg:grid-cols-2">
            {trending.slice(0, 8).map((m) => (
              <TrendingPoster key={`${m.mediaType}-${m.tmdbId}`} media={m} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">Trending unavailable.</p>
        )}
      </aside>
    </div>
  );
}

function SectionHeading({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
      <span className="text-brand">{icon}</span>
      {title}
    </h2>
  );
}

function TrendingPoster({ media }: { media: NormalizedMedia }) {
  const poster = posterUrl(media.posterPath, "w342");
  return (
    <Link
      href={`/title/${media.mediaType}/${media.tmdbId}`}
      className="group relative block aspect-[2/3] overflow-hidden rounded-lg border border-border bg-surface-2"
    >
      {poster ? (
        <Image
          src={poster}
          alt={media.title}
          fill
          sizes="120px"
          className="object-cover transition-transform group-hover:scale-105"
        />
      ) : (
        <span className="flex h-full items-center justify-center p-2 text-center text-xs text-muted">
          {media.title}
        </span>
      )}
    </Link>
  );
}
