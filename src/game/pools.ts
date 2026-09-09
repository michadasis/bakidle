import { CHARACTERS, type Character } from "@/data/characters";
import type { ModeId } from "./modes";
import type { Settings } from "./settings";

/**
 * Published stats are patchy. Some of the cast have a height and weight but no recorded age,
 * and plenty have none of the three, because the source material never printed them.
 */
export function hasFullStats(c: Character): boolean {
  return (
    Number.isFinite(c.height) && Number.isFinite(c.weight) && Number.isFinite(c.age)
  );
}

/** Enough to be worth guessing in Classic: the age cell reads "?" instead of comparing. */
export function canCompareStats(c: Character): boolean {
  return Number.isFinite(c.height) && Number.isFinite(c.weight);
}

/**
 * Characters the anime has never adapted sit out unless they are switched on, and then they
 * are in the game fully: answerable and guessable like everyone else.
 */
export function inPlay(settings: Settings): readonly Character[] {
  return settings.includeMangaOnly ? CHARACTERS : CHARACTERS.filter((c) => !c.mangaOnly);
}

/** Everyone a setting has left in play. */
export function eligibleCharacters(settings: Settings): readonly Character[] {
  const pool = inPlay(settings);
  return settings.modernOnly ? pool.filter((c) => !c.grapplerOnly) : pool;
}

/** Who can be today's answer in a given mode. */
export function answerPool(mode: ModeId, settings: Settings): readonly Character[] {
  const pool = eligibleCharacters(settings);
  if (mode === "classic") return pool.filter(hasFullStats);
  if (mode === "splash") return pool.filter((c) => c.image);
  if (mode === "voice") return pool.filter((c) => Array.isArray(c.voiceClips) && c.voiceClips.length > 0);
  return pool;
}

/**
 * Who you are allowed to type. Anyone a setting has excluded is gone from the search too, so
 * the list never offers a character who cannot be today's answer.
 */
export function guessPool(mode: ModeId, settings: Settings): readonly Character[] {
  const pool = eligibleCharacters(settings);
  return mode === "classic" ? pool.filter(canCompareStats) : pool;
}

export type RejectionReason = "unknown" | "mangaOnly" | "grapplerOnly" | "noStats";

/** Why a typed name was refused, so the message can say something true. */
export function rejectionReason(name: string, mode: ModeId, settings: Settings): RejectionReason {
  const known = CHARACTERS.find((c) => c.name.toLowerCase() === name.toLowerCase());
  if (!known) return "unknown";
  if (known.mangaOnly && !settings.includeMangaOnly) return "mangaOnly";
  if (known.grapplerOnly && settings.modernOnly) return "grapplerOnly";
  return "noStats";
}

export function findCharacter(name: string): Character | undefined {
  return CHARACTERS.find((c) => c.name.toLowerCase() === name.toLowerCase());
}
