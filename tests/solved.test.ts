import { describe, expect, it } from "vitest";
import { formatCount, isValidPlayerId, ordinal, PLAYER_KEY } from "@/game/solved";
import { STORAGE_VERSION } from "@/game/storage";

describe("wording the solved counters", () => {
  it("gets the ordinal suffixes right, including the teens", () => {
    const cases: [number, string][] = [
      [1, "1st"],
      [2, "2nd"],
      [3, "3rd"],
      [4, "4th"],
      [11, "11th"],
      [12, "12th"],
      [13, "13th"],
      [21, "21st"],
      [22, "22nd"],
      [23, "23rd"],
      [101, "101st"],
      [111, "111th"],
      [112, "112th"],
      [113, "113th"],
      [1003, "1,003rd"],
      [17493, "17,493rd"],
    ];
    for (const [n, want] of cases) expect(ordinal(n), String(n)).toBe(want);
  });

  it("separates thousands so a big count stays readable", () => {
    expect(formatCount(7)).toBe("7");
    expect(formatCount(1234)).toBe("1,234");
    expect(formatCount(31239)).toBe("31,239");
  });
});

describe("the id that counts a browser once", () => {
  it("accepts what the game generates and refuses anything else", () => {
    expect(isValidPlayerId("0123456789abcdef01234567")).toBe(true);
    expect(isValidPlayerId("aA0_-bbbbbbbb")).toBe(true);
    // Too short, too long, wrong shape, or not a string at all.
    expect(isValidPlayerId("short")).toBe(false);
    expect(isValidPlayerId("x".repeat(65))).toBe(false);
    expect(isValidPlayerId("has spaces in it")).toBe(false);
    expect(isValidPlayerId("semi:colons:here")).toBe(false);
    expect(isValidPlayerId(null)).toBe(false);
    expect(isValidPlayerId(12345678901234)).toBe(false);
    expect(isValidPlayerId({})).toBe(false);
  });

  it("keeps the id under a versioned key, so it survives the boot purge", () => {
    expect(PLAYER_KEY).toBe(`bakidle_player_${STORAGE_VERSION}`);
    expect(PLAYER_KEY).toContain(`_${STORAGE_VERSION}`);
  });
});
