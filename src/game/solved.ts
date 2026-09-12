import type { ModeId } from "./modes";

/** 1st, 2nd, 3rd, 4th, and the teens that break the pattern: 11th, 12th, 13th. */
export function ordinal(n: number): string {
  const abs = Math.abs(Math.trunc(n));
  const lastTwo = abs % 100;
  const last = abs % 10;
  const suffix =
    lastTwo >= 11 && lastTwo <= 13 ? "th" : last === 1 ? "st" : last === 2 ? "nd" : last === 3 ? "rd" : "th";
  return `${Math.trunc(n).toLocaleString("en-US")}${suffix}`;
}

/** Thousands separated, so five figures stay readable at a glance. */
export function formatCount(n: number): string {
  return n.toLocaleString("en-US");
}

export interface SolvedResult {
  count: number | null;
  rank?: number | null;
}

/**
 * The counters are decoration: every call is allowed to fail quietly, and the game plays exactly
 * the same without them. Nothing here blocks a guess, a win or a render.
 */
export async function fetchSolvedCount(mode: ModeId, signal?: AbortSignal): Promise<number | null> {
  try {
    const res = await fetch(`/api/solved?mode=${mode}`, { cache: "no-store", signal });
    if (!res.ok) return null;
    const body = (await res.json()) as SolvedResult;
    return typeof body.count === "number" ? body.count : null;
  } catch {
    return null;
  }
}

/** Records this win and returns the position it earned, or null if the counter is unavailable. */
export async function reportSolved(mode: ModeId): Promise<SolvedResult> {
  try {
    const res = await fetch("/api/solved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
      cache: "no-store",
    });
    if (!res.ok) return { count: null, rank: null };
    return (await res.json()) as SolvedResult;
  } catch {
    return { count: null, rank: null };
  }
}
