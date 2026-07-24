import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertCircle, Star } from "lucide-react";
import { getDetail, posterUrl, backdropUrl } from "@/lib/tmdb";
import { upsertNormalized } from "@/lib/media";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { TitleActions } from "@/components/title/TitleActions";
import { AddToListMenu } from "@/components/lists/AddToListMenu";
import { ReviewItem, type ReviewItemData } from "@/components/ReviewItem";
import { EmptyState } from "@/components/PosterGrid";
import type { ListStatus, MediaType } from "@/lib/types";
import { toYear } from "@/lib/utils";

function runtimeLabel(mins: number | null): string | null {
  if (!mins) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string; tmdbId: string }>;
}) {
  const { type, tmdbId } = await params;
  if ((type !== "movie" && type !== "tv") || !/^\d+$/.test(tmdbId)) {
    return { title: "Not found" };
  }
  try {
    const detail = await getDetail(type as MediaType, Number(tmdbId));
    return { title: detail.title };
  } catch {
    return { title: "Title" };
  }
}

export default async function TitlePage({
  params,
}: {
  params: Promise<{ type: string; tmdbId: string }>;
}) {
  const { type, tmdbId } = await params;
  if ((type !== "movie" && type !== "tv") || !/^\d+$/.test(tmdbId)) {
    notFound();
  }
  const mediaType = type as MediaType;
  const id = Number(tmdbId);

  let detail;
  try {
    detail = await getDetail(mediaType, id);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("404")) notFound();
    return (
      <div className="mx-auto flex max-w-xl items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
        <span>Couldn&apos;t load this title. {msg}</span>
      </div>
    );
  }

  const supabase = await createClient();
  const user = await getCurrentUser();

  // Cache this title into our `media` table on view (logged-in users, per RLS),
  // otherwise just look up an existing cache row.
  let mediaId: string | null = null;
  if (user) {
    try {
      mediaId = await upsertNormalized(supabase, detail);
    } catch {
      /* RLS or transient error — fall back to a read below */
    }
  }
  if (!mediaId) {
    const { data: mediaRow } = await supabase
      .from("media")
      .select("id")
      .eq("tmdb_id", id)
      .eq("media_type", mediaType)
      .maybeSingle();
    mediaId = mediaRow?.id ?? null;
  }

  let myStatus: ListStatus | null = null;
  let myReview: { rating: number | null; body: string | null } | null = null;
  let reviews: ReviewItemData[] = [];

  if (mediaId) {
    if (user) {
      const [{ data: um }, { data: rv }] = await Promise.all([
        supabase
          .from("user_media")
          .select("status")
          .eq("user_id", user.id)
          .eq("media_id", mediaId)
          .maybeSingle(),
        supabase
          .from("reviews")
          .select("rating, body")
          .eq("user_id", user.id)
          .eq("media_id", mediaId)
          .maybeSingle(),
      ]);
      myStatus = (um?.status as ListStatus) ?? null;
      myReview = rv ?? null;
    }

    const { data: allReviews } = await supabase
      .from("reviews")
      .select(
        "rating, body, created_at, user_id, profiles(username, display_name, avatar_url)",
      )
      .eq("media_id", mediaId)
      .order("created_at", { ascending: false });

    reviews =
      allReviews?.map((r) => {
        const p = r.profiles as unknown as {
          username: string;
          display_name: string | null;
          avatar_url: string | null;
        };
        return {
          username: p.username,
          displayName: p.display_name ?? p.username,
          avatarUrl: p.avatar_url,
          rating: r.rating,
          body: r.body,
          date: r.created_at,
        };
      }) ?? [];
  }

  // The current user's lists, marking which already contain this title.
  let listOptions: { id: string; title: string; hasItem: boolean }[] = [];
  if (user) {
    const { data: myLists } = await supabase
      .from("lists")
      .select("id, title")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    let containing = new Set<string>();
    if (mediaId && myLists && myLists.length > 0) {
      const { data: li } = await supabase
        .from("list_items")
        .select("list_id")
        .eq("media_id", mediaId)
        .in(
          "list_id",
          myLists.map((l) => l.id),
        );
      containing = new Set(li?.map((x) => x.list_id) ?? []);
    }
    listOptions = (myLists ?? []).map((l) => ({
      id: l.id,
      title: l.title,
      hasItem: containing.has(l.id),
    }));
  }

  const backdrop = backdropUrl(detail.backdropPath);
  const poster = posterUrl(detail.posterPath, "w500");
  const year = toYear(detail.releaseDate);
  const runtime = runtimeLabel(detail.runtime);

  return (
    <div className="-mt-8">
      {/* Hero */}
      <div className="relative -mx-4 h-[38vh] min-h-56 overflow-hidden sm:h-[46vh]">
        {backdrop && (
          <Image
            src={backdrop}
            alt=""
            fill
            priority
            className="object-cover object-top opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
      </div>

      <div className="relative z-10 -mt-32 grid grid-cols-1 gap-8 md:-mt-40 md:grid-cols-[220px_1fr]">
        {/* Poster + actions */}
        <div className="mx-auto w-40 md:mx-0 md:w-full">
          <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-border bg-surface-2 shadow-2xl shadow-black/50">
            {poster ? (
              <Image src={poster} alt={detail.title} fill className="object-cover" sizes="220px" />
            ) : (
              <div className="flex h-full items-center justify-center p-3 text-center text-sm text-muted">
                {detail.title}
              </div>
            )}
          </div>

          <div className="mt-4">
            {user ? (
              <div className="space-y-3">
                <TitleActions
                  type={mediaType}
                  tmdbId={id}
                  initialStatus={myStatus}
                  initialReview={myReview}
                />
                <AddToListMenu
                  type={mediaType}
                  tmdbId={id}
                  mediaId={mediaId}
                  lists={listOptions}
                />
              </div>
            ) : (
              <Link
                href="/login"
                className="flex h-11 items-center justify-center rounded-xl gradient-brand text-sm font-medium text-white shadow-lg shadow-brand/25"
              >
                Log in to track this
              </Link>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="pt-2 md:pt-24">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {detail.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            <span className="rounded-md bg-surface-2 px-2 py-0.5 text-xs font-medium uppercase tracking-wide">
              {mediaType === "tv" ? "TV Series" : "Movie"}
            </span>
            {year && <span>{year}</span>}
            {runtime && <span>{runtime}</span>}
            {detail.voteAverage ? (
              <span className="inline-flex items-center gap-1">
                <Star size={14} className="text-gold" fill="currentColor" />
                {detail.voteAverage.toFixed(1)}
              </span>
            ) : null}
          </div>

          {detail.tagline && (
            <p className="mt-3 text-base italic text-muted">{detail.tagline}</p>
          )}

          {detail.genres.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {detail.genres.map((g) => (
                <span
                  key={g}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-foreground/80"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {detail.overview && (
            <p className="mt-5 max-w-2xl leading-relaxed text-foreground/90">
              {detail.overview}
            </p>
          )}

          {/* Cast */}
          {detail.cast.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 text-lg font-semibold">Top cast</h2>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {detail.cast.map((c) => (
                  <div key={c.id} className="w-20 shrink-0 text-center">
                    <div className="relative mx-auto mb-1.5 aspect-square w-16 overflow-hidden rounded-full border border-border bg-surface-2">
                      {c.profilePath ? (
                        <Image
                          src={posterUrl(c.profilePath, "w185")!}
                          alt={c.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted">
                          {c.name.slice(0, 1)}
                        </div>
                      )}
                    </div>
                    <p className="line-clamp-2 text-xs font-medium">{c.name}</p>
                    <p className="line-clamp-1 text-[11px] text-muted">{c.character}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-12">
        <h2 className="mb-1 text-xl font-semibold">
          Reviews {reviews.length > 0 && <span className="text-muted">({reviews.length})</span>}
        </h2>
        {reviews.length === 0 ? (
          <EmptyState
            title="No reviews yet"
            subtitle={user ? "Be the first to rate and review this title." : "Log in to leave the first review."}
          />
        ) : (
          <div className="card px-4">
            {reviews.map((r, i) => (
              <ReviewItem key={`${r.username}-${i}`} review={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
