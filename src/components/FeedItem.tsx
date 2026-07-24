import Link from "next/link";
import Image from "next/image";
import { Avatar } from "./ui/Avatar";
import { Stars } from "./ui/Stars";
import { posterUrl } from "@/lib/tmdb";
import { formatDate, toYear } from "@/lib/utils";
import type { MediaRow } from "@/lib/types";

export interface FeedItemData {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  media: MediaRow;
  rating: number | null;
  body: string | null;
  date: string;
}

export function FeedItem({ item }: { item: FeedItemData }) {
  const poster = posterUrl(item.media.poster_path, "w185");
  const year = toYear(item.media.release_date);
  const titleHref = `/title/${item.media.media_type}/${item.media.tmdb_id}`;

  return (
    <div className="card flex gap-4 p-4">
      <Link
        href={titleHref}
        className="relative aspect-[2/3] w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2 sm:w-20"
      >
        {poster && (
          <Image src={poster} alt={item.media.title} fill className="object-cover" sizes="80px" />
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm">
          <Link href={`/u/${item.username}`}>
            <Avatar name={item.displayName} url={item.avatarUrl} size="sm" />
          </Link>
          <span className="min-w-0">
            <Link href={`/u/${item.username}`} className="font-semibold hover:text-brand">
              {item.displayName}
            </Link>{" "}
            <span className="text-muted">reviewed</span>
          </span>
          <span className="ml-auto shrink-0 text-xs text-muted">
            {formatDate(item.date)}
          </span>
        </div>

        <Link href={titleHref} className="mt-1.5 block">
          <span className="font-semibold hover:text-brand">{item.media.title}</span>
          {year && <span className="ml-2 text-sm text-muted">{year}</span>}
        </Link>

        {item.rating != null && (
          <div className="mt-1">
            <Stars value={item.rating} size="sm" />
          </div>
        )}
        {item.body && (
          <p className="mt-1.5 line-clamp-3 whitespace-pre-wrap text-sm text-foreground/90">
            {item.body}
          </p>
        )}
      </div>
    </div>
  );
}
