"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_SETTINGS, type Settings } from "./settings";
import { readJson, SETTINGS_KEY, writeJson } from "./storage";

/**
 * Settings live outside React because several unrelated components care about them and every
 * one of them must re-render together when a switch flips. useSyncExternalStore over a tiny
 * store does that without pulling in a state library, and it gives a server snapshot for free,
 * which matters because localStorage cannot be read while rendering on the server.
 */
type Listener = () => void;

let current: Settings = DEFAULT_SETTINGS;
let hydrated = false;
const listeners = new Set<Listener>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Reads storage once, on the client, after mount. */
export function hydrateSettings(): void {
  if (hydrated) return;
  hydrated = true;
  current = { ...DEFAULT_SETTINGS, ...readJson<Partial<Settings>>(SETTINGS_KEY, {}) };
  emit();
}

export function getSettings(): Settings {
  return current;
}

/** The server always sees defaults, which keeps the first paint deterministic. */
function getServerSettings(): Settings {
  return DEFAULT_SETTINGS;
}

export function setSetting<K extends keyof Settings>(key: K, value: Settings[K]): void {
  current = { ...current, [key]: value };
  writeJson(SETTINGS_KEY, current);
  emit();
}

export function useSettings(): Settings {
  return useSyncExternalStore(subscribe, getSettings, getServerSettings);
}

/** True once the client has read storage, so views can avoid rendering stale defaults. */
export function isHydrated(): boolean {
  return hydrated;
}
