"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Film, Tv, Loader2 } from "lucide-react";
import type { NormalizedMedia } from "@/lib/types";
import { posterUrl } from "@/lib/images";
import { toYear } from "@/lib/utils";

export function SearchBar({
  className,
  initialQuery = "",
  autoFocus = false,
}: {
  className?: string;
  initialQuery?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [q, setQ] = React.useState(initialQuery);
  const [results, setResults] = React.useState<NormalizedMedia[]>([]);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [active, setActive] = React.useState(-1);
  const boxRef = React.useRef<HTMLDivElement>(null);

  // Debounced fetch as the user types. All state updates happen inside the
  // timeout callback (never synchronously in the effect body).
  React.useEffect(() => {
    const query = q.trim();
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      if (query.length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: ctrl.signal,
        });
        const data = await res.json();
        setResults(data.results ?? []);
        setActive(-1);
      } catch {
        /* aborted or failed */
      } finally {
        setLoading(false);
      }
    }, query.length < 2 ? 0 : 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  // Close on outside click.
  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function go(m: NormalizedMedia) {
    setOpen(false);
    setQ("");
    router.push(`/title/${m.mediaType}/${m.tmdbId}`);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (active >= 0 && results[active]) return go(results[active]);
    const query = q.trim();
    if (query) {
      setOpen(false);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showDropdown = open && q.trim().length >= 2;

  return (
    <div ref={boxRef} className={`relative ${className ?? ""}`}>
      <form onSubmit={submit}>
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            autoFocus={autoFocus}
            placeholder="Search movies & TV…"
            className="h-10 w-full rounded-full border border-border bg-surface pl-9 pr-9 text-sm text-foreground placeholder:text-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
          {loading && (
            <Loader2
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted"
            />
          )}
        </div>
      </form>

      {showDropdown && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-surface shadow-2xl shadow-black/50">
          {results.length === 0 && !loading ? (
            <p className="px-4 py-3 text-sm text-muted">No matches.</p>
          ) : (
            <ul className="max-h-96 overflow-y-auto py-1">
              {results.map((m, i) => {
                const poster = posterUrl(m.posterPath, "w92");
                const year = toYear(m.releaseDate);
                return (
                  <li key={`${m.mediaType}-${m.tmdbId}`}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(m)}
                      className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                        active === i ? "bg-surface-2" : "hover:bg-surface-2"
                      }`}
                    >
                      <span className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-surface-2">
                        {poster ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={poster}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {m.title}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-muted">
                          {m.mediaType === "tv" ? (
                            <Tv size={11} />
                          ) : (
                            <Film size={11} />
                          )}
                          {m.mediaType === "tv" ? "TV" : "Film"}
                          {year ? ` · ${year}` : ""}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
