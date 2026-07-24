import { NextResponse } from "next/server";
import { searchMulti } from "@/lib/tmdb";

/** Lightweight endpoint powering the navbar search autocomplete. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  if (!q.trim()) return NextResponse.json({ results: [] });

  try {
    const results = (await searchMulti(q)).slice(0, 8);
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
