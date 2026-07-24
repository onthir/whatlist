import Link from "next/link";
import { Clapperboard, Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { SearchBar } from "./SearchBar";
import { UserMenu } from "./UserMenu";
import { Button } from "./ui/Button";

export async function Navbar() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  let profile: { username: string; display_name: string | null; avatar_url: string | null } | null =
    null;
  let unread = 0;
  if (user) {
    const [{ data }, { count }] = await Promise.all([
      supabase
        .from("profiles")
        .select("username, display_name, avatar_url")
        .eq("id", user.id)
        .single(),
      supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false),
    ]);
    profile = data;
    unread = count ?? 0;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand shadow-lg shadow-brand/30">
            <Clapperboard size={20} className="text-white" />
          </span>
          <span className="hidden text-lg font-bold tracking-tight sm:block">
            What<span className="gradient-text">List</span>
          </span>
        </Link>

        <div className="flex-1">
          <SearchBar className="mx-auto max-w-md" />
        </div>

        <nav className="flex shrink-0 items-center gap-2">
          {profile ? (
            <>
              <Link
                href="/notifications"
                aria-label="Notifications"
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
              >
                <Bell size={20} />
                {unread > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-2 px-1 text-[10px] font-bold text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>
              <UserMenu
                username={profile.username}
                displayName={profile.display_name ?? profile.username}
                avatarUrl={profile.avatar_url}
              />
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
