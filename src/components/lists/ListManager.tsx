"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, Trash2, Loader2 } from "lucide-react";
import { removeFromList, deleteList } from "@/app/actions/lists";
import { Button } from "@/components/ui/Button";
import { posterUrl } from "@/lib/images";
import { toYear } from "@/lib/utils";
import type { NormalizedMedia } from "@/lib/types";

export interface EditableItem {
  mediaId: string;
  media: NormalizedMedia;
}

export function EditableListGrid({
  listId,
  items,
}: {
  listId: string;
  items: EditableItem[];
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  function remove(mediaId: string) {
    setPendingId(mediaId);
    removeFromList({ listId, mediaId })
      .then(() => router.refresh())
      .finally(() => setPendingId(null));
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map(({ media, mediaId }) => {
        const poster = posterUrl(media.posterPath, "w342");
        const year = toYear(media.releaseDate);
        return (
          <div key={mediaId} className="group relative">
            <Link href={`/title/${media.mediaType}/${media.tmdbId}`} className="block">
              <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-border bg-surface-2">
                {poster ? (
                  <Image
                    src={poster}
                    alt={media.title}
                    fill
                    sizes="180px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-2 text-center text-xs text-muted">
                    {media.title}
                  </div>
                )}
              </div>
              <p className="mt-2 line-clamp-1 text-sm font-medium">{media.title}</p>
              {year && <p className="text-xs text-muted">{year}</p>}
            </Link>
            <button
              onClick={() => remove(mediaId)}
              disabled={pendingId === mediaId}
              aria-label="Remove from list"
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white opacity-0 backdrop-blur transition-opacity hover:bg-danger group-hover:opacity-100"
            >
              {pendingId === mediaId ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <X size={14} />
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function DeleteListButton({ listId }: { listId: string }) {
  const [pending, start] = React.useTransition();

  function onDelete() {
    if (!confirm("Delete this list? This can't be undone.")) return;
    start(() => {
      deleteList(listId);
    });
  }

  return (
    <Button variant="danger" size="sm" onClick={onDelete} disabled={pending}>
      {pending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
      Delete list
    </Button>
  );
}
