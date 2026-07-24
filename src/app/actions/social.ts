"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setFollow(input: {
  targetId: string;
  targetUsername: string;
  follow: boolean;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in.");
  if (user.id === input.targetId) throw new Error("You can't follow yourself.");

  if (input.follow) {
    const { error } = await supabase
      .from("follows")
      .upsert(
        { follower_id: user.id, following_id: input.targetId },
        { onConflict: "follower_id,following_id" },
      );
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", input.targetId);
    if (error) throw error;
  }

  revalidatePath(`/u/${input.targetUsername}`);
  revalidatePath("/people");
  revalidatePath("/");
}
