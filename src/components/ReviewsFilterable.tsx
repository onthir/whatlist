"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Star as StarIcon } from "lucide-react";
import { Stars } from "@/components/ui/Stars";
import { EmptyState } from "@/components/PosterGrid";
import { posterUrl } from "@/lib/images";
import { toYear, cn } from "@/lib/utils";
import type { MediaType } from "@/lib/types";

export interface ReviewEntry {
  mediaType: MediaType;
  tmdbId: number;
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
  rating: number | null; // 1–10
  body: string | null;
  date: string;
}

type Sort = "newest" | "highest" | "lowest";

const RATING_FILTERS = [
  { label: "All", min: 0 },
  { label: "★4+", min: 8 },
  { label: "★3+", min: 6 },
  { label: "★2+", min: 4 },
];

export function ReviewsFilterable({ items }: { items: ReviewEntry[] }) {
  const [minRating, setMinRating] = React.useState(0);
  const [sort, setSort] = React.useState<Sort>("newest");

  const filtered = React.useMemo(() => {
    let out = items;
    if (minRating > 0) {
      out = out.filter((r) => (r.rating ?? 0) >= minRating);
    }
    const sorted = [...out];
    if (sort === "newest") {
      sorted.sort((a, b) => b.date.localeCompare(a.date));
    } else if (sort === "highest") {
      sorted.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
    } else {
      sorted.sort((a, b) => (a.rating ?? 99) - (b.rating ?? 99));
    }
    return sorted;
  }, [items, minRating, sort]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1.5">
          {RATING_FILTERS.map((f) => (
            <button
              key={f.label}
              onClick={() => setMinRating(f.min)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                minRating === f.min
                  ? "border-transparent gradient-brand text-white"
                  : "border-border bg-surface text-muted hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="ml-auto h-8 rounded-lg border border-border bg-surface px-2 text-xs text-foreground focus:border-brand focus:outline-none"
        >
          <option value="newest">Newest</option>
          <option value="highest">Highest rated</option>
          <option value="lowest">Lowest rated</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<StarIcon size={34} />}
          title={minRating > 0 ? "No reviews match this filter" : "No reviews yet"}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((r, i) => (
            <Row key={`${r.mediaType}-${r.tmdbId}-${i}`} r={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ r }: { r: ReviewEntry }) {
  const poster = posterUrl(r.posterPath, "w185");
  const year = toYear(r.releaseDate);
  const href = `/title/${r.mediaType}/${r.tmdbId}`;
  return (
    <div className="card flex gap-4 p-4">
      <Link
        href={href}
        className="relative aspect-[2/3] w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2"
      >
        {poster && (
          <Image src={poster} alt={r.title} fill className="object-cover" sizes="64px" />
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={href} className="font-semibold hover:text-brand">
          {r.title}
        </Link>
        {year && <span className="ml-2 text-sm text-muted">{year}</span>}
        {r.rating != null && (
          <div className="mt-1">
            <Stars value={r.rating} size="sm" />
          </div>
        )}
        {r.body && (
          <p className="mt-1.5 whitespace-pre-wrap text-sm text-foreground/90">{r.body}</p>
        )}
      </div>
    </div>
  );
}
