import { describe, expect, it } from "vitest";
import golden from "./__golden__/legacy-behaviour.json";
import { CHARACTERS } from "@/data/characters";
import { answersForDay, resetDeckCache } from "@/game/deck";
import { computeComparisons, formatAge } from "@/game/compare";
import { GAME_MODES } from "@/game/modes";
import { answerPool, guessPool } from "@/game/pools";
import type { Settings } from "@/game/settings";
import { dailyKey, statsKey } from "@/game/storage";
import { formatCountdown } from "@/game/time";

/**
 * The refactor is only correct if it is invisible. Every expectation here was captured from
 * the original script.js before a line of it was rewritten; nothing in this file was authored
 * by hand, so it cannot drift towards the new implementation.
 */
describe("behaviour matches the pre-refactor build", () => {
  for (const combo of golden.combos) {
    const settings = combo.settings as Settings;

    describe(`pool: ${combo.label}`, () => {
      it("draws the same answer for every mode on every day", () => {
        resetDeckCache();
        const actual: (string | null)[][] = [];
        for (let day = 0; day < golden.days; day++) {
          const picks = answersForDay(day, settings);
          actual.push(GAME_MODES.map((m) => picks[m.id]?.name ?? null));
        }
        expect(actual).toEqual(combo.answers);
      });

      it("keeps the same pool sizes", () => {
        for (const mode of GAME_MODES) {
          expect({
            answer: answerPool(mode.id, settings).length,
            guess: guessPool(mode.id, settings).length,
          }).toEqual(combo.pools[mode.id as keyof typeof combo.pools]);
        }
      });

      it("writes to the same storage keys", () => {
        // Players in the wild hold their progress under these exact strings.
        expect(dailyKey("classic", 3, settings)).toBe(combo.keys.daily);
        expect(statsKey("classic")).toBe(combo.keys.stats);
      });
    });
  }

  it("compares two characters the same way", () => {
    for (const c of golden.comparisons) {
      const guess = CHARACTERS.find((x) => x.name === c.guess)!;
      const answer = CHARACTERS.find((x) => x.name === c.answer)!;
      expect(computeComparisons(guess, answer)).toEqual(c.result);
    }
  });

  it("formats ages and countdowns the same way", () => {
    expect([18, 99, 146, 200_000_000].map(formatAge)).toEqual(golden.formats.ages);
    expect([0, 1000, 61_000, 3_600_000, 86_399_000].map(formatCountdown)).toEqual(
      golden.formats.countdowns
    );
  });

  it("carries the same roster, stat for stat", () => {
    const actual = CHARACTERS.map((c) => ({
      name: c.name,
      height: c.height ?? null,
      weight: c.weight ?? null,
      age: c.age ?? null,
      saga: c.saga,
      grapplerOnly: !!c.grapplerOnly,
      mangaOnly: !!c.mangaOnly,
    }));
    expect(actual).toEqual(golden.roster);
  });
});
