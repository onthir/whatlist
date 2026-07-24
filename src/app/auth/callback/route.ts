import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Handles email-confirmation and password-recovery links.
 * Supabase redirects here with a `code` we exchange for a session.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("Invalid or expired link. Please try again.")}`,
  );
}
