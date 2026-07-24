import Link from "next/link";
import { Avatar } from "./ui/Avatar";
import { FollowButton } from "./FollowButton";

export interface UserRowData {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
}

export function UserRow({
  person,
  isFollowing,
  showFollow,
}: {
  person: UserRowData;
  isFollowing: boolean;
  showFollow: boolean;
}) {
  return (
    <div className="card flex items-center gap-3 p-3">
      <Link href={`/u/${person.username}`} className="shrink-0">
        <Avatar name={person.displayName} url={person.avatarUrl} size="md" />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={`/u/${person.username}`}
          className="block truncate text-sm font-semibold hover:text-brand"
        >
          {person.displayName}
        </Link>
        <p className="truncate text-xs text-muted">
          @{person.username}
          {person.bio ? ` · ${person.bio}` : ""}
        </p>
      </div>
      {showFollow && (
        <FollowButton
          targetId={person.id}
          targetUsername={person.username}
          initialFollowing={isFollowing}
        />
      )}
    </div>
  );
}
