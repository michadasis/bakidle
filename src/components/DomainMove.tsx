"use client";

import { useLayoutEffect } from "react";
import { LEGACY_HOST, SITE_URL } from "@/site";
import { MOVE_HASH, handoffUrl, takeHandoff } from "@/game/move";

/**
 * TEMPORARY: carries progress from bakidle.vercel.app to a future custom domain the first time
 * a returning visitor lands on the old host. Runs in a layout effect, before Game, ModeList and
 * ArchiveList read storage in their own effects, so nothing renders from the old host's data
 * that a real handoff is about to replace. Delete this alongside move.ts and move.test.ts once
 * the move is old enough that no one still arrives on the old host, and add a permanent redirect
 * for it instead.
 */
export function DomainMove() {
  useLayoutEffect(() => {
    const newHostname = new URL(SITE_URL).hostname;
    if (location.hostname === LEGACY_HOST && newHostname !== location.hostname) {
      let store: Storage | null = null;
      try {
        store = localStorage;
      } catch {
        store = null;
      }
      location.replace(handoffUrl(SITE_URL, location.pathname, location.search, store));
      return;
    }
    if (location.hash.startsWith(MOVE_HASH)) {
      try {
        takeHandoff(location.hash, localStorage);
      } catch {
        /* no storage available; nothing to take */
      }
      // Full reload, not history.replaceState: Next's router keeps its own copy of the url,
      // hash included, and can write the stale hash right back.
      location.replace(location.href.split("#")[0]);
    }
  }, []);
  return null;
}
