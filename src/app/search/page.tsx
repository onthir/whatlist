import { Search as SearchIcon, AlertCircle } from "lucide-react";
import { searchMulti } from "@/lib/tmdb";
import { SearchBar } from "@/components/SearchBar";
import { PosterGrid, EmptyState } from "@/components/PosterGrid";
import type { NormalizedMedia } from "@/lib/types";

export const metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  let results: NormalizedMedia[] = [];
  let error: string | null = null;
  if (query) {
    try {
      results = await searchMulti(query);
    } catch (e) {
      error = e instanceof Error ? e.message : "Search failed.";
    }
  }

  return (
    <div className="space-y-8">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Search <span className="gradient-text">movies &amp; TV</span>
        </h1>
        <p className="mt-2 text-sm text-muted">
          Find something to add to your watchlist.
        </p>
        <SearchBar
          className="mt-5"
          initialQuery={query}
          autoFocus={!query}
        />
      </div>

      {error && (
        <div className="mx-auto flex max-w-xl items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!query && !error && (
        <EmptyState
          icon={<SearchIcon size={40} />}
          title="Start typing to search"
          subtitle="Search across thousands of movies and TV shows powered by TMDB."
        />
      )}

      {query && !error && results.length === 0 && (
        <EmptyState
          icon={<SearchIcon size={40} />}
          title={`No results for “${query}”`}
          subtitle="Try a different title or check the spelling."
        />
      )}

      {results.length > 0 && (
        <div>
          <p className="mb-4 text-sm text-muted">
            {results.length} result{results.length === 1 ? "" : "s"} for “{query}”
          </p>
          <PosterGrid items={results} />
        </div>
      )}
    </div>
  );
}
