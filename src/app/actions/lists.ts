"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { upsertMedia } from "@/lib/media";
import type { MediaType } from "@/lib/types";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in.");
  return { supabase, user };
}

/** Create a list from a form and redirect to it. */
export async function createList(formData: FormData) {
  const { supabase, user } = await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!title) throw new Error("Give your list a title.");

  const { data, error } = await supabase
    .from("lists")
    .insert({ user_id: user.id, title, description: description || null })
    .select("id")
    .single();
  if (error) throw error;

  redirect(`/lists/${data.id}`);
}

export async function deleteList(listId: string) {
  const { supabase, user } = await requireUser();
  await supabase.from("lists").delete().eq("id", listId).eq("user_id", user.id);
  redirect("/me");
}

async function nextPosition(
  supabase: Awaited<ReturnType<typeof requireUser>>["supabase"],
  listId: string,
): Promise<number> {
  const { count } = await supabase
    .from("list_items")
    .select("*", { count: "exact", head: true })
    .eq("list_id", listId);
  return count ?? 0;
}

export async function addToList(input: {
  listId: string;
  type: MediaType;
  tmdbId: number;
}) {
  const { supabase } = await requireUser();
  const mediaId = await upsertMedia(supabase, input.type, input.tmdbId);
  const position = await nextPosition(supabase, input.listId);

  const { error } = await supabase.from("list_items").upsert(
    { list_id: input.listId, media_id: mediaId, position },
    { onConflict: "list_id,media_id" },
  );
  if (error) throw error;

  revalidatePath(`/lists/${input.listId}`);
  revalidatePath(`/title/${input.type}/${input.tmdbId}`);
}

/** Create a new list and immediately add a title to it. Returns the new list id. */
export async function addToNewList(input: {
  title: string;
  type: MediaType;
  tmdbId: number;
}): Promise<string> {
  const { supabase, user } = await requireUser();
  const title = input.title.trim();
  if (!title) throw new Error("Give your list a title.");

  const { data, error } = await supabase
    .from("lists")
    .insert({ user_id: user.id, title })
    .select("id")
    .single();
  if (error) throw error;

  const mediaId = await upsertMedia(supabase, input.type, input.tmdbId);
  await supabase
    .from("list_items")
    .insert({ list_id: data.id, media_id: mediaId, position: 0 });

  revalidatePath(`/title/${input.type}/${input.tmdbId}`);
  return data.id as string;
}

export async function removeFromList(input: { listId: string; mediaId: string }) {
  const { supabase } = await requireUser();
  await supabase
    .from("list_items")
    .delete()
    .eq("list_id", input.listId)
    .eq("media_id", input.mediaId);
  revalidatePath(`/lists/${input.listId}`);
}
