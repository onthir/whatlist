"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProfileState = { error?: string; message?: string };

export async function updateProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const username = String(formData.get("username") ?? "").trim();
  const displayName = String(formData.get("display_name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const avatarUrl = String(formData.get("avatar_url") ?? "").trim();

  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return {
      error: "Username must be 3–20 characters: letters, numbers, underscores.",
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      username,
      display_name: displayName || username,
      bio: bio || null,
      avatar_url: avatarUrl || null,
    })
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") return { error: "That username is taken." };
    return { error: error.message };
  }

  revalidatePath("/me");
  revalidatePath(`/u/${username}`);
  return { message: "Profile updated." };
}
