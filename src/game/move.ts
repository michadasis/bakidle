import {
  exportData,
  importData,
  isTransferableKey,
  parseTransferCode,
  summarize,
  type KeyValueStore,
} from "./transfer";

/**
 * TEMPORARY: one-time handoff of progress from bakidle.vercel.app to a future custom domain.
 * Delete this file, move.test.ts and DomainMove.tsx (and add a permanent redirect for the old
 * host) once the move is old enough that anyone still on the old host has already been carried
 * over. Pure by the same rule as the rest of src/game: no DOM here, the caller passes in
 * location and storage.
 */
export const MOVE_HASH = "#bakidle-move=";

function localTransferableKeys(store: KeyValueStore): Record<string, string> {
  const keys: Record<string, string> = {};
  for (let i = 0; i < store.length; i++) {
    const key = store.key(i);
    if (!key || !isTransferableKey(key)) continue;
    const value = store.getItem(key);
    if (value !== null) keys[key] = value;
  }
  return keys;
}

/**
 * The URL to send a visitor on the old host to, carrying their progress in the fragment if they
 * have any - the fragment never reaches a server, on the way there or once they land. Built from
 * the site's own origin plus the path being visited, never `new URL(path, base)`: resolving a
 * path like "//evil.example/x" against a base would leave the site instead of staying on it.
 */
export function handoffUrl(
  siteUrl: string,
  pathname: string,
  search: string,
  store: KeyValueStore | null,
): string {
  const u = new URL(siteUrl);
  u.pathname = pathname;
  u.search = search;
  if (store) {
    try {
      const keys = localTransferableKeys(store);
      if (Object.keys(keys).length > 0) u.hash = MOVE_HASH + encodeURIComponent(exportData(store));
    } catch {
      /* storage could not be read; hand off the plain url instead */
    }
  }
  return u.toString();
}

/**
 * Applies a handoff fragment on the new host. Only replaces local progress when the incoming
 * code actually has more to it than what is already here, the same "do not clobber a real
 * streak" rule Transfer my data follows - a visitor who already played on the new host before
 * the move finished should not lose that to an emptier or older code.
 */
export function takeHandoff(hash: string, store: KeyValueStore): boolean {
  if (!hash.startsWith(MOVE_HASH)) return false;

  let code: string;
  try {
    code = decodeURIComponent(hash.slice(MOVE_HASH.length));
  } catch {
    return false;
  }

  const parsed = parseTransferCode(code);
  if (!parsed.ok) return false;

  const local = localTransferableKeys(store);
  if (Object.keys(local).length > 0 && summarize(parsed.keys).played <= summarize(local).played) {
    return false;
  }

  importData(store, parsed.keys);
  return true;
}
