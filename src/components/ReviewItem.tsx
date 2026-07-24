import Link from "next/link";
import { Avatar } from "./ui/Avatar";
import { Stars } from "./ui/Stars";
import { formatDate } from "@/lib/utils";

export interface ReviewItemData {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  rating: number | null;
  body: string | null;
  date: string;
}

export function ReviewItem({ review }: { review: ReviewItemData }) {
  return (
    <div className="flex gap-3 border-b border-border py-4 last:border-0">
      <Link href={`/u/${review.username}`} className="shrink-0">
        <Avatar name={review.displayName} url={review.avatarUrl} size="md" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <Link
            href={`/u/${review.username}`}
            className="text-sm font-semibold hover:text-brand"
          >
            {review.displayName}
          </Link>
          <span className="text-xs text-muted">@{review.username}</span>
          {review.rating != null && <Stars value={review.rating} size="sm" />}
          <span className="ml-auto text-xs text-muted">
            {formatDate(review.date)}
          </span>
        </div>
        {review.body && (
          <p className="mt-1.5 whitespace-pre-wrap text-sm text-foreground/90">
            {review.body}
          </p>
        )}
      </div>
    </div>
  );
}
