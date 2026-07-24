"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ListPlus, Check, Plus, Loader2 } from "lucide-react";
import { addToList, removeFromList, addToNewList } from "@/app/actions/lists";
import type { MediaType } from "@/lib/types";

interface ListOption {
  id: string;
  title: string;
  hasItem: boolean;
}

export function AddToListMenu({
  type,
  tmdbId,
  mediaId,
  lists,
}: {
  type: MediaType;
  tmdbId: number;
  mediaId: string | null;
  lists: ListOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<ListOption[]>(lists);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState("");
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function toggle(opt: ListOption) {
    setBusy(opt.id);
    try {
      if (opt.hasItem && mediaId) {
        await removeFromList({ listId: opt.id, mediaId });
      } else {
        await addToList({ listId: opt.id, type, tmdbId });
      }
      setOptions((prev) =>
        prev.map((o) => (o.id === opt.id ? { ...o, hasItem: !o.hasItem } : o)),
      );
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    setBusy("__new__");
    try {
      const newId = await addToNewList({ title, type, tmdbId });
      setOptions((prev) => [{ id: newId, title, hasItem: true }, ...prev]);
      setNewTitle("");
      setCreating(false);
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 text-sm font-medium transition-colors hover:border-brand/50"
      >
        <ListPlus size={16} /> Add to list
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-surface shadow-2xl shadow-black/50">
          <div className="max-h-64 overflow-y-auto p-1.5">
            {options.length === 0 && !creating && (
              <p className="px-3 py-2 text-sm text-muted">No lists yet.</p>
            )}
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => toggle(opt)}
                disabled={busy === opt.id}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-surface-2"
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                    opt.hasItem
                      ? "border-transparent gradient-brand text-white"
                      : "border-border"
                  }`}
                >
                  {busy === opt.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : opt.hasItem ? (
                    <Check size={12} />
                  ) : null}
                </span>
                <span className="truncate">{opt.title}</span>
              </button>
            ))}
          </div>

          <div className="border-t border-border p-1.5">
            {creating ? (
              <form onSubmit={create} className="flex gap-1.5 p-1">
                <input
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="New list name"
                  maxLength={120}
                  className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm focus:border-brand focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={busy === "__new__"}
                  className="flex h-9 shrink-0 items-center rounded-lg gradient-brand px-3 text-sm font-medium text-white"
                >
                  {busy === "__new__" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Add"
                  )}
                </button>
              </form>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-brand transition-colors hover:bg-surface-2"
              >
                <Plus size={16} /> Create new list
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
