"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const px = { sm: 14, md: 18, lg: 26 };

/** Read-only star display. `value` is 1–10 (half-star steps); null shows empty. */
export function Stars({
  value,
  size = "md",
  className,
}: {
  value: number | null;
  size?: keyof typeof px;
  className?: string;
}) {
  const stars = (value ?? 0) / 2; // 0–5
  const s = px[size];
  return (
    <div className={cn("inline-flex", className)} aria-label={value ? `${stars} out of 5 stars` : "No rating"}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, stars - i));
        return (
          <span key={i} className="relative inline-block" style={{ width: s, height: s }}>
            <Star size={s} className="absolute inset-0 text-border" fill="currentColor" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star size={s} className="text-gold" fill="currentColor" />
            </span>
          </span>
        );
      })}
    </div>
  );
}

/** Interactive half-star picker. Calls onChange with 1–10 (0 = cleared). */
export function StarInput({
  value,
  onChange,
  size = "lg",
}: {
  value: number;
  onChange: (v: number) => void;
  size?: keyof typeof px;
}) {
  const [hover, setHover] = React.useState<number | null>(null);
  const s = px[size];
  const shown = hover ?? value; // 1–10

  return (
    <div className="inline-flex items-center gap-1">
      <div className="inline-flex" onMouseLeave={() => setHover(null)}>
        {[0, 1, 2, 3, 4].map((i) => {
          const starVal = shown / 2 - i; // fraction for this star
          const fill = Math.max(0, Math.min(1, starVal));
          return (
            <span key={i} className="relative inline-block cursor-pointer" style={{ width: s, height: s }}>
              <Star size={s} className="absolute inset-0 text-border" fill="currentColor" />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star size={s} className="text-gold" fill="currentColor" />
              </span>
              {/* Left half = .5, right half = full */}
              <button
                type="button"
                aria-label={`Rate ${i + 0.5} stars`}
                className="absolute inset-y-0 left-0 w-1/2"
                onMouseEnter={() => setHover(i * 2 + 1)}
                onClick={() => onChange(i * 2 + 1)}
              />
              <button
                type="button"
                aria-label={`Rate ${i + 1} stars`}
                className="absolute inset-y-0 right-0 w-1/2"
                onMouseEnter={() => setHover(i * 2 + 2)}
                onClick={() => onChange(i * 2 + 2)}
              />
            </span>
          );
        })}
      </div>
      {value > 0 && (
        <button
          type="button"
          onClick={() => onChange(0)}
          className="ml-2 text-xs text-muted hover:text-danger"
        >
          Clear
        </button>
      )}
    </div>
  );
}
