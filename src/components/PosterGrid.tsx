import { Film, Tv } from "lucide-react";
import type { NormalizedMedia } from "@/lib/types";
import { MediaCard } from "./MediaCard";

export function PosterGrid({ items }: { items: NormalizedMedia[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((m) => (
        <MediaCard key={`${m.mediaType}-${m.tmdbId}`} media={m} />
      ))}
    </div>
  );
}

/** Poster grid split into separate "Movies" and "TV Shows" sections. */
export function GroupedPosterGrid({ items }: { items: NormalizedMedia[] }) {
  const movies = items.filter((m) => m.mediaType === "movie");
  const tv = items.filter((m) => m.mediaType === "tv");

  return (
    <div className="space-y-8">
      {movies.length > 0 && (
        <TypeSection icon={<Film size={15} />} title="Movies" items={movies} />
      )}
      {tv.length > 0 && (
        <TypeSection icon={<Tv size={15} />} title="TV Shows" items={tv} />
      )}
    </div>
  );
}

function TypeSection({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: NormalizedMedia[];
}) {
  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <span className="text-brand">{icon}</span>
        {title}
        <span className="text-xs font-normal text-muted">({items.length})</span>
      </h3>
      <PosterGrid items={items} />
    </div>
  );
}

export function EmptyState({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/40 px-6 py-16 text-center">
      {icon && <div className="mb-3 text-muted">{icon}</div>}
      <p className="text-lg font-semibold text-foreground">{title}</p>
      {subtitle && <p className="mt-1 max-w-sm text-sm text-muted">{subtitle}</p>}
    </div>
  );
}
