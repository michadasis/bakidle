/**
 * The epoch is a UTC midnight, so every day boundary lands on 12:00 AM UTC. One clock for the
 * whole site: the countdown, the puzzle rollover and the played-today markers all read from
 * here, so every mode resets together for every player at the same instant.
 */
export const EPOCH_MS = Date.UTC(2026, 8, 6);
export const DAY_MS = 86_400_000;

export function globalDayIndex(now: number = Date.now()): number {
  return Math.floor((now - EPOCH_MS) / DAY_MS);
}

export function msUntilGlobalReset(now: number = Date.now()): number {
  return DAY_MS - ((((now - EPOCH_MS) % DAY_MS) + DAY_MS) % DAY_MS);
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

/* ---------- archive dates: every day index maps to exactly one UTC calendar date ---------- */

export function dayIndexToUTCDate(day: number): Date {
  return new Date(EPOCH_MS + day * DAY_MS);
}

/** YYYY-MM-DD, the URL-friendly form of a day index. */
export function dayIndexToDateSlug(day: number): string {
  return dayIndexToUTCDate(day).toISOString().slice(0, 10);
}

/** The inverse of dayIndexToDateSlug. Null for anything that is not a well-formed date. */
export function dateSlugToDayIndex(slug: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(slug)) return null;
  const ms = Date.parse(`${slug}T00:00:00Z`);
  if (Number.isNaN(ms)) return null;
  const day = Math.round((ms - EPOCH_MS) / DAY_MS);
  // Round-trip check: catches slugs like 2026-02-30 that Date.parse quietly rolls into March.
  return dayIndexToDateSlug(day) === slug ? day : null;
}

export function formatArchiveDate(day: number): string {
  return dayIndexToUTCDate(day).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
