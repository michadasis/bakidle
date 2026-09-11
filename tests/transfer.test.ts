import { describe, expect, it } from "vitest";
import { STORAGE_VERSION, STREAK_KEY, statsKey } from "@/game/storage";
import {
  exportData,
  importData,
  parseTransferCode,
  summarize,
  type KeyValueStore,
} from "@/game/transfer";

class FakeStore implements KeyValueStore {
  private map = new Map<string, string>();
  constructor(entries: Record<string, string> = {}) {
    for (const [k, v] of Object.entries(entries)) this.map.set(k, v);
  }
  get length() {
    return this.map.size;
  }
  key(i: number) {
    return [...this.map.keys()][i] ?? null;
  }
  getItem(k: string) {
    return this.map.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.map.set(k, v);
  }
  removeItem(k: string) {
    this.map.delete(k);
  }
  dump() {
    return Object.fromEntries(this.map);
  }
}

const v = STORAGE_VERSION;
const mine = {
  [statsKey("classic")]: JSON.stringify({ played: 12, wins: 12 }),
  [statsKey("quote")]: JSON.stringify({ played: 3, wins: 3 }),
  [STREAK_KEY]: JSON.stringify({ currentStreak: 5, maxStreak: 9 }),
  [`bakidle_daily_${v}_classic_all_4`]: JSON.stringify({ guesses: ["Baki Hanma"], finished: false }),
  // Non-ASCII survives the round trip, so a future setting with a name in it will too.
  [`bakidle_settings_${v}`]: JSON.stringify({ modernOnly: true, includeMangaOnly: false, note: "é" }),
};

describe("transferring progress between devices", () => {
  it("carries exactly the current build's keys to the other device", () => {
    const from = new FakeStore({ ...mine, bakidle_stats_v1_classic: "{}", "other-site": "x" });
    const parsed = parseTransferCode(exportData(from));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.keys).toEqual(mine);

    const to = new FakeStore({
      [statsKey("emoji")]: JSON.stringify({ played: 1 }),
      bakidle_stats_v1_quote: "{}",
      "unrelated-app": "keep me",
    });
    importData(to, parsed.keys);
    // Replaced, not merged: the device's own progress and legacy leftovers go, other apps stay.
    expect(to.dump()).toEqual({ ...mine, "unrelated-app": "keep me" });
  });

  it("survives a code that was wrapped or padded on its way over", () => {
    const code = exportData(new FakeStore(mine));
    const mangled = `  ${code.slice(0, 20)}\n${code.slice(20, 60)}\r\n ${code.slice(60)}  `;
    expect(parseTransferCode(mangled)).toEqual({ ok: true, keys: mine });
  });

  it("summarises what a code holds before anything is replaced", () => {
    expect(summarize(mine)).toEqual({ played: 15, currentStreak: 5, maxStreak: 9 });
  });

  it("refuses anything that is not an intact code from this build", () => {
    const wrap = (payload: unknown) =>
      "BAKIDLE1:" + Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
    const rejects = [
      "",
      "hello",
      "BAKIDLE1:%%%not-base64%%%",
      exportData(new FakeStore(mine)).slice(0, 30),
      wrap({ v: 2, keys: {} }),
      wrap({ v: 1, keys: { evil_key: "{}" } }),
      wrap({ v: 1, keys: { [STREAK_KEY]: "not json" } }),
      wrap({ v: 1, keys: { [STREAK_KEY]: 5 } }),
      wrap({ v: 1, keys: {} }),
    ];
    for (const code of rejects) expect(parseTransferCode(code).ok, code).toBe(false);
  });
});
