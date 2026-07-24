import { cache } from "react";
import { createClient } from "./supabase/server";

/**
 * The current authenticated user, memoized for the duration of a single
 * server request. Because the root layout's Navbar and the page being rendered
 * both need the user, `cache()` collapses their separate `getUser()` calls into
 * one network round-trip to Supabase Auth.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
