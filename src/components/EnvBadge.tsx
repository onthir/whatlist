import { APP_ENV, isProduction, supabaseProjectRef } from "@/lib/env";

/**
 * A small fixed badge shown in every non-production environment so you always
 * know whether you're looking at the dev/preview app (and which DB it points
 * at). Renders nothing in production.
 */
export function EnvBadge() {
  if (isProduction) return null;

  const color =
    APP_ENV === "preview"
      ? "bg-sky-500"
      : "bg-amber-400";

  return (
    <div
      title={`Supabase project: ${supabaseProjectRef ?? "not configured"}`}
      className={`fixed bottom-3 left-3 z-50 select-none rounded-full ${color} px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-black shadow-lg shadow-black/30`}
    >
      {APP_ENV}
      {supabaseProjectRef ? ` · ${supabaseProjectRef}` : ""}
    </div>
  );
}
