import type { ModeId } from "./modes";
import { poolTag, type Settings } from "./settings";

/**
 * Bump to wipe every player's saved progress, streaks and stats at once. Old keys are cleared
 * on boot by purgeLegacyStorage().
 *
 * Every key the game has ever written is built here and nowhere else. The exact strings are
 * load-bearing: players in the wild hold progress, stats, streaks and settings under them, and
 * changing one silently discards a real person's streak.
 */
export const STORAGE_VERSION = "v2";

export const dailyKey = (mode: ModeId, day: number, settings: Settings) =>
  `bakidle_daily_${STORAGE_VERSION}_${mode}_${poolTag(settings)}_${day}`;

export const statsKey = (mode: ModeId) => `bakidle_stats_${STORAGE_VERSION}_${mode}`;

export const STREAK_KEY = `bakidle_streak_global_${STORAGE_VERSION}`;

export const SETTINGS_KEY = `bakidle_settings_${STORAGE_VERSION}`;

/**
 * Every accessor is wrapped: a private window, cleared site data or a browser set to block
 * storage makes these throw rather than return null, and a thrown error here would take the
 * whole render with it.
 */
export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable; the round still plays, it just will not be remembered */
  }
}

/**
 * Drops entries from earlier storage versions (including the retired per-mode 24h locks) and
 * finished days that are behind us, so localStorage does not grow without bound.
 */
export function purgeLegacyStorage(today: number): void {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith("bakidle_")) continue;
      if (key.startsWith("bakidle_lock_")) {
        localStorage.removeItem(key);
        continue;
      }
      if (!key.includes(`_${STORAGE_VERSION}_`) && !key.endsWith(`_${STORAGE_VERSION}`)) {
        localStorage.removeItem(key);
        continue;
      }
      if (key.startsWith(`bakidle_daily_${STORAGE_VERSION}_`)) {
        const day = Number(key.slice(key.lastIndexOf("_") + 1));
        if (Number.isFinite(day) && day !== today) localStorage.removeItem(key);
      }
    }
  } catch {
    /* nothing to purge if storage cannot be read */
  }
}
