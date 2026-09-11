import type { Character } from "@/data/characters";
import { GAME_MODES, SEED_OFFSETS, type ModeId } from "./modes";
import { answerPool } from "./pools";
import { poolTag, type Settings } from "./settings";

const DECK_SALT = 2_654_435_761;

/** Modes resolve in list order and each only avoids the modes above it. */
const MODE_RANK: readonly ModeId[] = GAME_MODES.map((m) => m.id);

function hashSeed(n: number): number {
  let x = n | 0;
  x = ((x >> 16) ^ x) * 0x45d9f3b;
  x = ((x >> 16) ^ x) * 0x45d9f3b;
  x = (x >> 16) ^ x;
  return x >>> 0;
}

/** Fisher-Yates driven by a deterministic xorshift, so every client builds the same order. */
function shuffledOrder(n: number, seed: number): number[] {
  const order = Array.from({ length: n }, (_, i) => i);
  let s = seed >>> 0 || 1;
  const next = () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s;
  };
  for (let i = n - 1; i > 0; i--) {
    const j = next() % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/**
 * Decks are cached per pool variant, mode and cycle. Pools of different sizes roll over on
 * different days, so a cycle number only means anything alongside the mode it belongs to.
 */
const deckCache = new Map<string, Character[]>();
let deckCacheTag: string | null = null;

function modeDeck(modeId: ModeId, cycle: number, settings: Settings): Character[] {
  const tag = poolTag(settings);
  if (deckCacheTag !== tag) {
    deckCacheTag = tag;
    deckCache.clear();
  }
  const key = `${modeId}:${cycle}`;
  const hit = deckCache.get(key);
  if (hit) return hit;

  const pool = answerPool(modeId, settings);
  const size = pool.length;
  const deck = shuffledOrder(size, hashSeed(cycle * DECK_SALT + SEED_OFFSETS[modeId])).map(
    (i) => pool[i]
  );
  // Cache before repairing: the repair only reads decks of earlier modes, but caching first
  // keeps a cycle from being built twice if one of those reads lands back on this mode.
  deckCache.set(key, deck);

  const earlier = MODE_RANK.slice(0, MODE_RANK.indexOf(modeId));
  if (earlier.length) {
    const startDay = cycle * size;
    const clashes = (day: number, card: Character) =>
      earlier.some((other) => {
        const taken = cardOn(other, day, settings);
        return taken !== null && taken.name === card.name;
      });
    // A card sharing a day with an earlier mode is swapped elsewhere in this same deck. The
    // whole cycle is in hand, so the swap can pick any slot rather than only the untouched
    // tail, and swapping two positions leaves the deck a permutation - the mode still answers
    // with every character exactly once before repeating.
    for (let slot = 0; slot < size; slot++) {
      if (!clashes(startDay + slot, deck[slot])) continue;
      for (let t = 0; t < size; t++) {
        if (t === slot) continue;
        if (clashes(startDay + slot, deck[t]) || clashes(startDay + t, deck[slot])) continue;
        [deck[slot], deck[t]] = [deck[t], deck[slot]];
        break;
      }
    }
  }
  return deck;
}

export function cardOn(modeId: ModeId, day: number, settings: Settings): Character | null {
  const size = answerPool(modeId, settings).length;
  if (size === 0) return null;
  return modeDeck(modeId, Math.floor(day / size), settings)[day % size];
}

/**
 * Every mode's answer for one day. Picking modes independently let one character be the
 * answer in two of them at once, which happened on about 29% of days and handed a free win to
 * anyone who solved one mode then opened another.
 */
export function answersForDay(day: number, settings: Settings): Record<ModeId, Character | null> {
  const target = Math.max(0, day);
  const picks = {} as Record<ModeId, Character | null>;
  for (const mode of GAME_MODES) picks[mode.id] = cardOn(mode.id, target, settings);
  return picks;
}

export function answerForDay(mode: ModeId, day: number, settings: Settings): Character | null {
  return answersForDay(day, settings)[mode];
}

/** Exposed for tests that need a cold cache. */
export function resetDeckCache(): void {
  deckCacheTag = null;
  deckCache.clear();
}
