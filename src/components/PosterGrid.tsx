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
