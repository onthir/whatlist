// ---------------------------------------------------------------------------
// Environment configuration.
//
// The app reads the same variable NAMES in every environment; only their
// VALUES differ (local → dev Supabase project, Vercel prod → prod project,
// Vercel preview → dev project). See ENVIRONMENTS.md.
// ---------------------------------------------------------------------------

export type AppEnv = "development" | "preview" | "production";

/** Which environment this instance is running as. */
export const APP_ENV: AppEnv = ((): AppEnv => {
  const explicit = process.env.NEXT_PUBLIC_APP_ENV;
  if (explicit === "development" || explicit === "preview" || explicit === "production") {
    return explicit;
  }
  // Fallback: no explicit value set → infer from the build.
  return process.env.NODE_ENV === "production" ? "production" : "development";
})();

export const isProduction = APP_ENV === "production";

/** Public site URL used for auth email redirect links. */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** The Supabase project "ref" (subdomain) — handy for confirming which DB you're on. */
export const supabaseProjectRef: string | null = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const match = url?.match(/https?:\/\/([^.]+)\.supabase\./);
  return match?.[1] ?? null;
})();

/**
 * Read a required env var, throwing a helpful error if it's missing.
 * Called at runtime (never at import), so a build with placeholder values
 * won't fail here.
 */
export function requireEnv(name: keyof typeof publicEnv | keyof typeof serverEnv): string {
  const value = { ...publicEnv, ...serverEnv }[name];
  if (!value) {
    throw new Error(
      `Missing environment variable "${name}". Copy .env.example to .env.local ` +
        `and fill in your values (see ENVIRONMENTS.md).`,
    );
  }
  return value;
}

// Referenced statically so Next inlines the NEXT_PUBLIC_* values into the bundle.
const publicEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

const serverEnv = {
  TMDB_ACCESS_TOKEN: process.env.TMDB_ACCESS_TOKEN,
};
