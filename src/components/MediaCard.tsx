import Link from "next/link";
import Image from "next/image";
import { Film, Tv } from "lucide-react";
import type { NormalizedMedia } from "@/lib/types";
import { posterUrl } from "@/lib/tmdb";
import { toYear } from "@/lib/utils";

export function MediaCard({ media }: { media: NormalizedMedia }) {
  const poster = posterUrl(media.posterPath, "w342");
  const year = toYear(media.releaseDate);
  const isTv = media.mediaType === "tv";

  return (
    <Link
      href={`/title/${media.mediaType}/${media.tmdbId}`}
      className="group block"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-border bg-surface-2 shadow-sm transition-all group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-black/40 group-hover:ring-2 group-hover:ring-brand/60">
        {poster ? (
          <Image
            src={poster}
            alt={media.title}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 180px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-3 text-center text-sm text-muted">
            {media.title}
          </div>
        )}
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/90 backdrop-blur">
          {isTv ? <Tv size={11} /> : <Film size={11} />}
          {isTv ? "TV" : "Film"}
        </span>
      </div>
      <div className="mt-2 px-0.5">
        <p className="line-clamp-1 text-sm font-medium text-foreground group-hover:text-brand">
          {media.title}
        </p>
        {year && <p className="text-xs text-muted">{year}</p>}
      </div>
    </Link>
  );
}
