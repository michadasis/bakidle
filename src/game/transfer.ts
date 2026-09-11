import { STORAGE_VERSION, STREAK_KEY } from "./storage";

/**
 * Moving progress between browsers or devices. Progress only ever lives in localStorage, which
 * is scoped to one browser on one origin, so a player who switches phone or clears their data
 * would otherwise lose their streak with no way back. The export is a single line of text they
 * can paste anywhere, so it needs no account and no server.
 */

/** The part of the Web Storage API used here, so the tests can pass a plain fake. */
export interface KeyValueStore {
  readonly length: number;
  key(index: number): string | null;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const PREFIX = "BAKIDLE1:";

interface Payload {
  v: 1;
  keys: Record<string, string>;
}

/** Keys the current build reads. Older versions are purged on boot, so they are not carried. */
export function isTransferableKey(key: string): boolean {
  return (
    key.startsWith("bakidle_") &&
    (key.includes(`_${STORAGE_VERSION}_`) || key.endsWith(`_${STORAGE_VERSION}`))
  );
}

function toBase64(text: string): string {
  let binary = "";
  for (const byte of new TextEncoder().encode(text)) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(encoded: string): string {
  const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

export function exportData(store: KeyValueStore): string {
  const keys: Record<string, string> = {};
  for (let i = 0; i < store.length; i++) {
    const key = store.key(i);
    if (!key || !isTransferableKey(key)) continue;
    const value = store.getItem(key);
    if (value !== null) keys[key] = value;
  }
  const payload: Payload = { v: 1, keys };
  return PREFIX + toBase64(JSON.stringify(payload));
}

export type ParseResult =
  | { ok: true; keys: Record<string, string> }
  | { ok: false; error: string };

const DAMAGED = "That code is damaged or incomplete. Copy it again and paste the whole thing.";

export function parseTransferCode(code: string): ParseResult {
  // Codes get pasted through chat apps and notes, which like to wrap long lines.
  const compact = code.replace(/\s+/g, "");
  if (!compact) return { ok: false, error: "Paste a transfer code first." };
  if (!compact.startsWith(PREFIX)) return { ok: false, error: "That isn't a Bakidle transfer code." };

  let payload: unknown;
  try {
    payload = JSON.parse(fromBase64(compact.slice(PREFIX.length)));
  } catch {
    return { ok: false, error: DAMAGED };
  }
  const p = payload as Partial<Payload> | null;
  if (!p || typeof p !== "object" || p.v !== 1 || !p.keys || typeof p.keys !== "object") {
    return { ok: false, error: "That code comes from a different version of Bakidle." };
  }

  const keys: Record<string, string> = {};
  for (const [key, value] of Object.entries(p.keys)) {
    // Only ever write keys this build owns, whatever a code claims to contain.
    if (!isTransferableKey(key) || typeof value !== "string") {
      return { ok: false, error: "That code contains data Bakidle doesn't recognise." };
    }
    try {
      JSON.parse(value);
    } catch {
      return { ok: false, error: DAMAGED };
    }
    keys[key] = value;
  }
  if (Object.keys(keys).length === 0) return { ok: false, error: "That code has no progress in it." };
  return { ok: true, keys };
}

/** What a code holds, so the player can see what they are about to replace their progress with. */
export function summarize(keys: Record<string, string>): {
  played: number;
  currentStreak: number;
  maxStreak: number;
} {
  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
  let played = 0;
  for (const [key, value] of Object.entries(keys)) {
    if (key.startsWith(`bakidle_stats_${STORAGE_VERSION}_`)) played += num(JSON.parse(value)?.played);
  }
  const streak = keys[STREAK_KEY] ? JSON.parse(keys[STREAK_KEY]) : null;
  return { played, currentStreak: num(streak?.currentStreak), maxStreak: num(streak?.maxStreak) };
}

/**
 * Replaces this device's progress with the imported progress rather than merging it: two
 * streaks cannot be meaningfully combined. Keys that are not Bakidle's are left alone.
 */
export function importData(store: KeyValueStore, keys: Record<string, string>): void {
  for (let i = store.length - 1; i >= 0; i--) {
    const key = store.key(i);
    if (key && key.startsWith("bakidle_")) store.removeItem(key);
  }
  for (const [key, value] of Object.entries(keys)) store.setItem(key, value);
}
