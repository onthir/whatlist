import type { SupabaseClient } from "@supabase/supabase-js";
import type { MediaRow, MediaType, NormalizedMedia } from "./types";
import { getDetail } from "./tmdb";

/** Map a cached `media` row to the normalized shape used by UI components. */
export function mediaRowToNormalized(row: MediaRow): NormalizedMedia {
  return {
    tmdbId: row.tmdb_id,
    mediaType: row.media_type,
    title: row.title,
    posterPath: row.poster_path,
    backdropPath: row.backdrop_path,
    releaseDate: row.release_date,
    overview: row.overview,
    genres: Array.isArray(row.genres) ? row.genres : [],
    voteAverage: row.vote_average,
  };
}

/**
 * Ensure a TMDB title exists in our `media` cache and return its row id.
 * Fetches fresh detail from TMDB, then upserts on (tmdb_id, media_type).
 */
export async function upsertMedia(
  supabase: SupabaseClient,
  type: MediaType,
  tmdbId: number,
): Promise<string> {
  const detail = await getDetail(type, tmdbId);
  return upsertNormalized(supabase, detail);
}

/** Upsert an already-normalized title (avoids a second TMDB round-trip). */
export async function upsertNormalized(
  supabase: SupabaseClient,
  media: NormalizedMedia,
): Promise<string> {
  const { data, error } = await supabase
    .from("media")
    .upsert(
      {
        tmdb_id: media.tmdbId,
        media_type: media.mediaType,
        title: media.title,
        poster_path: media.posterPath,
        backdrop_path: media.backdropPath,
        release_date: media.releaseDate || null,
        overview: media.overview,
        genres: media.genres,
        vote_average: media.voteAverage,
        cached_at: new Date().toISOString(),
      },
      { onConflict: "tmdb_id,media_type" },
    )
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}
