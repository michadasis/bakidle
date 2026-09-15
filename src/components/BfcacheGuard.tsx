"use client";

import { useEffect } from "react";

/**
 * A browser can restore a page from the back-forward cache instead of doing a fresh load: the
 * already-rendered DOM comes back exactly as it was, including a finished round's win banner,
 * and this app's client state then updates on top of that stale snapshot rather than through a
 * real mount, leaving old and new content stacked instead of one replacing the other. A bfcache
 * restore fires `pageshow` with `persisted: true` - forcing a reload there replaces it with a
 * real navigation instead.
 */
export function BfcacheGuard() {
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);
  return null;
}
