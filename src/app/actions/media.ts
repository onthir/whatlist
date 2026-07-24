"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { upsertMedia } from "@/lib/media";
import type { ListStatus, MediaType } from "@/lib/types";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in.");
  return { supabase, user };
}

/**
 * Set (or clear) a title's list status for the current user.
 * `status: null` removes it from all lists.
 */
export async function setListStatus(input: {
  type: MediaType;
  tmdbId: number;
  status: ListStatus | null;
}) {
  const { supabase, user } = await requireUser();

  if (input.status === null) {
    const { data: media } = await supabase
      .from("media")
      .select("id")
      .eq("tmdb_id", input.tmdbId)
      .eq("media_type", input.type)
      .maybeSingle();
    if (media) {
      await supabase
        .from("user_media")
        .delete()
        .eq("user_id", user.id)
        .eq("media_id", media.id);
    }
  } else {
    const mediaId = await upsertMedia(supabase, input.type, input.tmdbId);
    const { error } = await supabase.from("user_media").upsert(
      {
        user_id: user.id,
        media_id: mediaId,
        status: input.status,
        watched_at: input.status === "watched" ? new Date().toISOString() : null,
      },
      { onConflict: "user_id,media_id" },
    );
    if (error) throw error;
  }

  revalidatePath(`/title/${input.type}/${input.tmdbId}`);
  revalidatePath("/me");
}

/** Create or update the current user's review for a title. Implies "watched". */
export async function saveReview(input: {
  type: MediaType;
  tmdbId: number;
  rating: number | null; // 1–10 or null
  body: string | null;
}) {
  const { supabase, user } = await requireUser();

  if (input.rating == null && !input.body?.trim()) {
    throw new Error("Add a rating or some text before saving.");
  }

  const mediaId = await upsertMedia(supabase, input.type, input.tmdbId);

  const { error } = await supabase.from("reviews").upsert(
    {
      user_id: user.id,
      media_id: mediaId,
      rating: input.rating,
      body: input.body?.trim() || null,
    },
    { onConflict: "user_id,media_id" },
  );
  if (error) throw error;

  // A review means you've watched it — ensure it's on the watched list.
  await supabase.from("user_media").upsert(
    {
      user_id: user.id,
      media_id: mediaId,
      status: "watched",
      watched_at: new Date().toISOString(),
    },
    { onConflict: "user_id,media_id" },
  );

  revalidatePath(`/title/${input.type}/${input.tmdbId}`);
  revalidatePath("/me");
}

/** Delete the current user's review for a title. */
export async function deleteReview(input: { type: MediaType; tmdbId: number }) {
  const { supabase, user } = await requireUser();

  const { data: media } = await supabase
    .from("media")
    .select("id")
    .eq("tmdb_id", input.tmdbId)
    .eq("media_type", input.type)
    .maybeSingle();

  if (media) {
    await supabase
      .from("reviews")
      .delete()
      .eq("user_id", user.id)
      .eq("media_id", media.id);
  }

  revalidatePath(`/title/${input.type}/${input.tmdbId}`);
  revalidatePath("/me");
}
