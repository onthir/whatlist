"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Check, Eye, Loader2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { StarInput, Stars } from "@/components/ui/Stars";
import { setListStatus, saveReview, deleteReview } from "@/app/actions/media";
import type { ListStatus, MediaType } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TitleActions({
  type,
  tmdbId,
  initialStatus,
  initialReview,
}: {
  type: MediaType;
  tmdbId: number;
  initialStatus: ListStatus | null;
  initialReview: { rating: number | null; body: string | null } | null;
}) {
  const router = useRouter();
  const [status, setStatus] = React.useState<ListStatus | null>(initialStatus);
  const [pending, start] = React.useTransition();
  const [editing, setEditing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function run(fn: () => Promise<void>) {
    setError(null);
    start(async () => {
      try {
        await fn();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  function toggle(next: ListStatus) {
    const target = status === next ? null : next;
    setStatus(target);
    run(() => setListStatus({ type, tmdbId, status: target }));
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <ToggleButton
          active={status === "watchlist"}
          onClick={() => toggle("watchlist")}
          disabled={pending}
          icon={status === "watchlist" ? <Check size={16} /> : <Bookmark size={16} />}
          label={status === "watchlist" ? "On watchlist" : "Watchlist"}
        />
        <ToggleButton
          active={status === "watched"}
          onClick={() => toggle("watched")}
          disabled={pending}
          icon={status === "watched" ? <Check size={16} /> : <Eye size={16} />}
          label={status === "watched" ? "Watched" : "Mark watched"}
        />
      </div>

      <ReviewEditor
        type={type}
        tmdbId={tmdbId}
        review={initialReview}
        editing={editing}
        setEditing={setEditing}
        onSave={(rating, body) =>
          run(async () => {
            await saveReview({ type, tmdbId, rating, body });
            setStatus("watched");
            setEditing(false);
          })
        }
        onDelete={() =>
          run(async () => {
            await deleteReview({ type, tmdbId });
            setEditing(false);
          })
        }
        pending={pending}
      />

      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  disabled,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  disabled: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-all disabled:opacity-60",
        active
          ? "gradient-brand border-transparent text-white shadow-lg shadow-brand/25"
          : "border-border bg-surface-2 text-foreground hover:border-brand/50",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function ReviewEditor({
  review,
  editing,
  setEditing,
  onSave,
  onDelete,
  pending,
}: {
  type: MediaType;
  tmdbId: number;
  review: { rating: number | null; body: string | null } | null;
  editing: boolean;
  setEditing: (v: boolean) => void;
  onSave: (rating: number | null, body: string | null) => void;
  onDelete: () => void;
  pending: boolean;
}) {
  const [rating, setRating] = React.useState<number>(review?.rating ?? 0);
  const [body, setBody] = React.useState<string>(review?.body ?? "");

  // Show a saved review (not editing).
  if (review && !editing) {
    return (
      <div className="rounded-xl border border-border bg-surface-2 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold">Your review</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              <Pencil size={14} /> Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} disabled={pending}>
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
        {review.rating != null && <Stars value={review.rating} size="md" />}
        {review.body && (
          <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/90">
            {review.body}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface-2 p-4">
      <p className="mb-3 text-sm font-semibold">
        {review ? "Edit your review" : "Rate & review"}
      </p>
      <div className="mb-3">
        <StarInput value={rating} onChange={setRating} />
      </div>
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write your thoughts… (optional)"
        rows={4}
      />
      <div className="mt-3 flex items-center gap-2">
        <Button
          size="sm"
          onClick={() => onSave(rating > 0 ? rating : null, body || null)}
          disabled={pending}
        >
          {pending && <Loader2 size={14} className="animate-spin" />}
          {review ? "Save changes" : "Post review"}
        </Button>
        {review && (
          <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
