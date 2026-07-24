import Link from "next/link";
import { notFound } from "next/navigation";
import { ListPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { mediaRowToNormalized } from "@/lib/media";
import { Avatar } from "@/components/ui/Avatar";
import { PosterGrid, EmptyState } from "@/components/PosterGrid";
import { EditableListGrid, DeleteListButton } from "@/components/lists/ListManager";
import type { MediaRow } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("lists").select("title").eq("id", id).maybeSingle();
  return { title: data?.title ?? "List" };
}

export default async function ListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const user = await getCurrentUser();

  const { data: list } = await supabase
    .from("lists")
    .select(
      "id, title, description, user_id, profiles(username, display_name, avatar_url), list_items(position, media(*))",
    )
    .eq("id", id)
    .maybeSingle();

  if (!list) notFound();

  const owner = list.profiles as unknown as {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  const isOwner = user?.id === list.user_id;

  const rawItems =
    (list.list_items as unknown as { position: number; media: MediaRow }[]) ?? [];
  const items = rawItems
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((it) => ({
      mediaId: it.media.id,
      media: mediaRowToNormalized(it.media),
    }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{list.title}</h1>
          {list.description && (
            <p className="mt-2 max-w-2xl text-foreground/90">{list.description}</p>
          )}
          <div className="mt-3 flex items-center gap-2 text-sm text-muted">
            <Link href={`/u/${owner.username}`} className="flex items-center gap-2 hover:text-foreground">
              <Avatar
                name={owner.display_name ?? owner.username}
                url={owner.avatar_url}
                size="sm"
              />
              <span>{owner.display_name ?? owner.username}</span>
            </Link>
            <span>·</span>
            <span>
              {items.length} {items.length === 1 ? "title" : "titles"}
            </span>
          </div>
        </div>
        {isOwner && <DeleteListButton listId={list.id} />}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<ListPlus size={36} />}
          title="This list is empty"
          subtitle={
            isOwner
              ? "Open any movie or show and use “Add to list” to fill it up."
              : undefined
          }
        />
      ) : isOwner ? (
        <EditableListGrid listId={list.id} items={items} />
      ) : (
        <PosterGrid items={items.map((it) => it.media)} />
      )}
    </div>
  );
}
