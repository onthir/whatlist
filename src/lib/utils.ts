import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names, resolving conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a release date string (YYYY-MM-DD) to just the year. */
export function toYear(date?: string | null): string | null {
  if (!date) return null;
  const year = date.slice(0, 4);
  return /^\d{4}$/.test(year) ? year : null;
}

/** Convert a 1–10 rating (half-star steps) to a 0.5–5 star number. */
export function ratingToStars(rating?: number | null): number | null {
  if (rating == null) return null;
  return rating / 2;
}

/** Short, human date like "Jul 24, 2026". */
export function formatDate(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
