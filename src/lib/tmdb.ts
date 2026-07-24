import type { MediaType, NormalizedMedia } from "./types";

// Re-export the pure image helpers so existing `@/lib/tmdb` imports keep working.
export { posterUrl, backdropUrl } from "./images";

const TMDB_BASE = "https://api.themoviedb.org/3";

function authHeaders(): HeadersInit {
  const token = process.env.TMDB_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      "TMDB_ACCESS_TOKEN is not set. Add it to your .env.local (see .env.example).",
    );
  }
  return {
    Authorization: `Bearer ${token}`,
    accept: "application/json",
  };
}

async function tmdbFetch<T>(
  path: string,
  params: Record<string, string> = {},
): Promise<T> {
  const url = new URL(`${TMDB_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url.toString(), {
    headers: authHeaders(),
    // Cache TMDB responses on the server for an hour.
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`TMDB request failed (${res.status}): ${path}`);
  }
  return res.json() as Promise<T>;
}

// ---- Raw TMDB shapes we care about ----------------------------------------

interface TmdbItem {
  id: number;
  media_type?: string;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string | null;
  vote_average?: number;
  genres?: { id: number; name: string }[];
  genre_ids?: number[];
}

interface TmdbPaged<T> {
  results: T[];
}

// ---- Normalization ---------------------------------------------------------

export function normalize(item: TmdbItem, typeHint?: MediaType): NormalizedMedia {
  const mediaType: MediaType =
    (item.media_type as MediaType) ??
    typeHint ??
    (item.title !== undefined ? "movie" : "tv");

  return {
    tmdbId: item.id,
    mediaType,
    title: item.title ?? item.name ?? "Untitled",
    posterPath: item.poster_path ?? null,
    backdropPath: item.backdrop_path ?? null,
    releaseDate: item.release_date ?? item.first_air_date ?? null,
    overview: item.overview ?? null,
    genres: item.genres?.map((g) => g.name) ?? [],
    voteAverage: item.vote_average ?? null,
  };
}

// ---- Public API ------------------------------------------------------------

/** Search movies and TV shows in one call. */
export async function searchMulti(query: string): Promise<NormalizedMedia[]> {
  const q = query.trim();
  if (!q) return [];
  const data = await tmdbFetch<TmdbPaged<TmdbItem>>("/search/multi", {
    query: q,
    include_adult: "false",
  });
  return data.results
    .filter((r) => r.media_type === "movie" || r.media_type === "tv")
    .map((r) => normalize(r));
}

/** Trending movies + TV for the week. */
export async function getTrending(): Promise<NormalizedMedia[]> {
  const data = await tmdbFetch<TmdbPaged<TmdbItem>>("/trending/all/week");
  return data.results
    .filter((r) => r.media_type === "movie" || r.media_type === "tv")
    .map((r) => normalize(r));
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
}

export interface MediaDetail extends NormalizedMedia {
  runtime: number | null;
  tagline: string | null;
  cast: CastMember[];
}

/** Full detail for a single title, including top cast. */
export async function getDetail(
  type: MediaType,
  id: number,
): Promise<MediaDetail> {
  const data = await tmdbFetch<
    TmdbItem & {
      runtime?: number;
      episode_run_time?: number[];
      tagline?: string;
      credits?: { cast?: { id: number; name: string; character: string; profile_path: string | null }[] };
    }
  >(`/${type}/${id}`, { append_to_response: "credits" });

  const base = normalize(data, type);
  const runtime =
    data.runtime ?? (data.episode_run_time && data.episode_run_time[0]) ?? null;

  return {
    ...base,
    runtime,
    tagline: data.tagline || null,
    cast:
      data.credits?.cast?.slice(0, 12).map((c) => ({
        id: c.id,
        name: c.name,
        character: c.character,
        profilePath: c.profile_path,
      })) ?? [],
  };
}
