export type MediaType = "movie" | "tv";
export type ListStatus = "watchlist" | "watched";

/** A normalized title, shared between TMDB results and our cached rows. */
export interface NormalizedMedia {
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  overview: string | null;
  genres: string[];
  voteAverage: number | null;
}

/** A row in our `media` cache table. */
export interface MediaRow {
  id: string;
  tmdb_id: number;
  media_type: MediaType;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string | null;
  overview: string | null;
  genres: string[];
  vote_average: number | null;
  cached_at: string;
}

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export interface Review {
  user_id: string;
  media_id: string;
  rating: number | null; // 1–10 (half-star steps)
  body: string | null;
  created_at: string;
  updated_at: string;
}
