import { describe, expect, it } from "vitest";
import { STREAK_KEY, statsKey } from "@/game/storage";
import { PLAYER_KEY } from "@/game/solved";
import type { KeyValueStore } from "@/game/transfer";
import { MOVE_HASH, handoffUrl, takeHandoff } from "@/game/move";

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

const SITE = "https://new.example";

const someProgress = {
  [statsKey("classic")]: JSON.stringify({ played: 4, wins: 3 }),
  [STREAK_KEY]: JSON.stringify({ currentStreak: 2, maxStreak: 4 }),
};

const moreProgress = {
  [statsKey("classic")]: JSON.stringify({ played: 9, wins: 7 }),
  [statsKey("quote")]: JSON.stringify({ played: 2, wins: 1 }),
  [STREAK_KEY]: JSON.stringify({ currentStreak: 6, maxStreak: 6 }),
};

describe("handoffUrl", () => {
  const plain = `${SITE}/classic?foo=bar`;

  it("stays a plain url for a store with no progress", () => {
    expect(handoffUrl(SITE, "/classic", "?foo=bar", new FakeStore())).toBe(plain);
  });

  it("stays a plain url for a null store", () => {
    expect(handoffUrl(SITE, "/classic", "?foo=bar", null)).toBe(plain);
  });

  it("stays a plain url for a store holding only the solved-counter id", () => {
    const store = new FakeStore({ [PLAYER_KEY]: "3fa94c0e1b2d7a8e9f0c1d2e" });
    expect(handoffUrl(SITE, "/classic", "?foo=bar", store)).toBe(plain);
  });

  it("stays a plain url when storage cannot be read", () => {
    const store: KeyValueStore = {
      get length(): number {
        throw new Error("blocked");
      },
      key: () => null,
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
    expect(handoffUrl(SITE, "/classic", "?foo=bar", store)).toBe(plain);
  });

  it("keeps the site's own host even for a protocol-relative path", () => {
    const result = handoffUrl(SITE, "//evil.example/x", "", new FakeStore(someProgress));
    expect(new URL(result).host).toBe(new URL(SITE).host);
  });

  it("appends the code for a store that has progress", () => {
    const store = new FakeStore(someProgress);
    const result = handoffUrl(SITE, "/", "", store);
    expect(result.startsWith(`${SITE}/${MOVE_HASH}`)).toBe(true);
  });
});

describe("takeHandoff", () => {
  it("carries progress across and keeps the receiving browser's own id, not the sender's", () => {
    const from = new FakeStore({ ...someProgress, [PLAYER_KEY]: "3fa94c0e1b2d7a8e9f0c1d2e" });
    const url = handoffUrl(SITE, "/", "", from);
    const hash = url.slice(url.indexOf("#"));

    const to = new FakeStore({ [PLAYER_KEY]: "aaaaaaaaaaaaaaaaaaaaaaaa" });
    expect(takeHandoff(hash, to)).toBe(true);
    expect(to.dump()).toEqual({ ...someProgress, [PLAYER_KEY]: "aaaaaaaaaaaaaaaaaaaaaaaa" });
  });

  it("keeps local progress when it is equal to the incoming code", () => {
    const from = new FakeStore(someProgress);
    const url = handoffUrl(SITE, "/", "", from);
    const hash = url.slice(url.indexOf("#"));

    const to = new FakeStore(someProgress);
    expect(takeHandoff(hash, to)).toBe(false);
    expect(to.dump()).toEqual(someProgress);
  });

  it("keeps local progress when it is ahead of the incoming code", () => {
    const from = new FakeStore(someProgress);
    const url = handoffUrl(SITE, "/", "", from);
    const hash = url.slice(url.indexOf("#"));

    const to = new FakeStore(moreProgress);
    expect(takeHandoff(hash, to)).toBe(false);
    expect(to.dump()).toEqual(moreProgress);
  });

  it("replaces local progress when it is behind the incoming code", () => {
    const from = new FakeStore(moreProgress);
    const url = handoffUrl(SITE, "/", "", from);
    const hash = url.slice(url.indexOf("#"));

    const to = new FakeStore(someProgress);
    expect(takeHandoff(hash, to)).toBe(true);
    expect(to.dump()).toEqual(moreProgress);
  });

  it("rejects anything that isn't a real handoff and leaves the store untouched", () => {
    const rejects = ["", "#", "#classic", MOVE_HASH, `${MOVE_HASH}%E0%A4%A`, `${MOVE_HASH}not-a-code`];
    for (const hash of rejects) {
      const store = new FakeStore(someProgress);
      expect(takeHandoff(hash, store), hash).toBe(false);
      expect(store.dump()).toEqual(someProgress);
    }
  });
});
