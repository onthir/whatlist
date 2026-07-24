"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { setFollow } from "@/app/actions/social";
import { cn } from "@/lib/utils";

export function FollowButton({
  targetId,
  targetUsername,
  initialFollowing,
}: {
  targetId: string;
  targetUsername: string;
  initialFollowing: boolean;
}) {
  const router = useRouter();
  const [following, setFollowing] = React.useState(initialFollowing);
  const [pending, start] = React.useTransition();
  const [hover, setHover] = React.useState(false);

  function toggle() {
    const next = !following;
    setFollowing(next);
    start(async () => {
      try {
        await setFollow({ targetId, targetUsername, follow: next });
        router.refresh();
      } catch {
        setFollowing(!next); // revert
      }
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-5 text-sm font-medium transition-all disabled:opacity-60",
        following
          ? "border border-border bg-surface-2 text-foreground hover:border-danger/50 hover:text-danger"
          : "gradient-brand text-white shadow-lg shadow-brand/25 hover:brightness-110",
      )}
    >
      {pending ? (
        <Loader2 size={16} className="animate-spin" />
      ) : following ? (
        <UserCheck size={16} />
      ) : (
        <UserPlus size={16} />
      )}
      {following ? (hover ? "Unfollow" : "Following") : "Follow"}
    </button>
  );
}
