import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/PosterGrid";
import { MarkReadOnMount } from "@/components/MarkReadOnMount";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/notifications");

  const { data: notifications } = await supabase
    .from("notifications")
    .select(
      "id, type, read, created_at, profiles!notifications_actor_id_fkey(username, display_name, avatar_url)",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const rows = notifications ?? [];
  const hasUnread = rows.some((n) => !n.read);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <MarkReadOnMount hasUnread={hasUnread} />
      <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
        <Bell size={22} className="text-brand" /> Notifications
      </h1>

      {rows.length === 0 ? (
        <EmptyState
          icon={<Bell size={34} />}
          title="No notifications yet"
          subtitle="When someone follows you, it'll show up here."
        />
      ) : (
        <div className="space-y-2">
          {rows.map((n) => {
            const actor = n.profiles as unknown as {
              username: string;
              display_name: string | null;
              avatar_url: string | null;
            };
            const name = actor.display_name ?? actor.username;
            return (
              <div
                key={n.id}
                className={`card flex items-center gap-3 p-3 ${
                  n.read ? "" : "ring-1 ring-brand/40"
                }`}
              >
                <Link href={`/u/${actor.username}`} className="shrink-0">
                  <Avatar name={name} url={actor.avatar_url} size="md" />
                </Link>
                <div className="min-w-0 flex-1 text-sm">
                  <Link href={`/u/${actor.username}`} className="font-semibold hover:text-brand">
                    {name}
                  </Link>{" "}
                  <span className="text-muted">started following you</span>
                </div>
                <UserPlus size={16} className="shrink-0 text-brand" />
                <span className="shrink-0 text-xs text-muted">
                  {formatDate(n.created_at)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
