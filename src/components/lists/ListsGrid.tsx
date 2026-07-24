import Link from "next/link";
import { Plus, ListPlus } from "lucide-react";
import { posterUrl } from "@/lib/images";
import { EmptyState } from "@/components/PosterGrid";

export interface ListPreview {
  id: string;
  title: string;
  count: number;
  posters: string[];
}

export function ListsGrid({
  lists,
  canCreate,
}: {
  lists: ListPreview[];
  canCreate: boolean;
}) {
  if (lists.length === 0 && !canCreate) {
    return <EmptyState icon={<ListPlus size={36} />} title="No lists yet" />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {canCreate && (
        <Link
          href="/lists/new"
          className="flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface/40 text-muted transition-colors hover:border-brand/50 hover:text-foreground"
        >
          <Plus size={26} />
          <span className="mt-1 text-sm font-medium">Create a list</span>
        </Link>
      )}
      {lists.map((l) => (
        <Link
          key={l.id}
          href={`/lists/${l.id}`}
          className="group overflow-hidden rounded-xl border border-border bg-surface transition-all hover:-translate-y-0.5 hover:ring-2 hover:ring-brand/50"
        >
          <div className="flex h-28 gap-0.5 overflow-hidden bg-surface-2">
            {l.posters.length > 0 ? (
              l.posters.map((p, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={posterUrl(p, "w185")!}
                  alt=""
                  className="h-full w-1/4 flex-1 object-cover"
                />
              ))
            ) : (
              <div className="flex w-full items-center justify-center text-sm text-muted">
                Empty list
              </div>
            )}
          </div>
          <div className="p-3">
            <p className="truncate text-sm font-semibold group-hover:text-brand">
              {l.title}
            </p>
            <p className="text-xs text-muted">
              {l.count} {l.count === 1 ? "title" : "titles"}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
