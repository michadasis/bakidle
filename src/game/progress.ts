import { GAME_MODES, type ModeId } from "./modes";
import { answerPool } from "./pools";
import type { Settings } from "./settings";
import { dailyKey, readJson, statsKey, STREAK_KEY, writeJson } from "./storage";

export interface DailyRecord {
  guesses: string[];
  finished: boolean;
  won: boolean;
  /**
   * Where this player came in among everyone who solved the mode today. Written once, when the
   * counter answers, so reopening a finished round shows the same position rather than a new
   * one. Absent when the counter was unavailable, and it goes with the round when the day rolls.
   */
  rank?: number;
}

export function loadDaily(mode: ModeId, day: number, settings: Settings): DailyRecord | null {
  return readJson<DailyRecord | null>(dailyKey(mode, day, settings), null);
}

export function saveDaily(mode: ModeId, day: number, settings: Settings, rec: DailyRecord): void {
  writeJson(dailyKey(mode, day, settings), rec);
}

/** Finishing a mode closes it for the current UTC day only. */
export function isModeFinished(mode: ModeId, day: number, settings: Settings): boolean {
  const rec = loadDaily(mode, day, settings);
  return !!rec && rec.finished;
}

export function playableModes(settings: Settings) {
  return GAME_MODES.filter((m) => answerPool(m.id, settings).length > 0);
}

/**
 * The first mode still unsolved today, read top to bottom in the same order the mode list
 * shows them. Skips the mode just finished and any with an empty pool. Null when nothing is
 * left, which turns the button into a way back to the list.
 */
export function nextUnplayedMode(mode: ModeId, day: number, settings: Settings) {
  return (
    GAME_MODES.find(
      (m) =>
        m.id !== mode &&
        answerPool(m.id, settings).length > 0 &&
        !isModeFinished(m.id, day, settings)
    ) ?? null
  );
}

/* ---------- stats ---------- */

export interface Stats {
  played: number;
  wins: number;
  totalGuesses: number;
  best: number | null;
  distribution: Record<string, number>;
}

export function loadStats(mode: ModeId): Stats {
  const s = {
    played: 0,
    wins: 0,
    distribution: {},
    ...readJson<Partial<Stats>>(statsKey(mode), {}),
  } as Stats;
  // Records written before guesses were totalled only kept the histogram, so derive the totals
  // from it once. The 7+ bucket has no exact value and counts as 7, which makes both numbers a
  // floor rather than a guess.
  if (s.totalGuesses === undefined || s.best === undefined) {
    let total = 0;
    let best: number | null = null;
    for (const [bucket, count] of Object.entries(s.distribution)) {
      const tries = bucket === "7+" ? 7 : Number(bucket);
      total += tries * count;
      if (count > 0) best = best === null ? tries : Math.min(best, tries);
    }
    s.totalGuesses = total;
    s.best = best;
  }
  return s;
}

export function recordWin(mode: ModeId, tries: number): Stats {
  const s = loadStats(mode);
  s.played++;
  s.wins++;
  s.totalGuesses += tries;
  s.best = s.best === null ? tries : Math.min(s.best, tries);
  const bucket = tries >= 7 ? "7+" : String(tries);
  s.distribution[bucket] = (s.distribution[bucket] || 0) + 1;
  writeJson(statsKey(mode), s);
  return s;
}

/* ---------- streak, shared across every mode ---------- */

export interface Streak {
  currentStreak: number;
  maxStreak: number;
  lastWinDay: number | null;
}

export function loadStreak(today: number): Streak {
  const g = readJson<Streak>(STREAK_KEY, { currentStreak: 0, maxStreak: 0, lastWinDay: null });
  if (g.lastWinDay !== null && g.lastWinDay !== today && g.lastWinDay !== today - 1) {
    g.currentStreak = 0;
    writeJson(STREAK_KEY, g);
  }
  return g;
}

export function recordStreakWin(today: number): Streak {
  const g = loadStreak(today);
  if (g.lastWinDay !== today) {
    g.currentStreak = g.lastWinDay === today - 1 ? g.currentStreak + 1 : 1;
    g.lastWinDay = today;
    g.maxStreak = Math.max(g.maxStreak, g.currentStreak);
    writeJson(STREAK_KEY, g);
  }
  return g;
}
