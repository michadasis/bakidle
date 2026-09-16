/**
 * Native `Element.scrollIntoView({behavior:"smooth"})` hands the animation entirely to the
 * browser: duration and easing aren't configurable, they differ noticeably between Chrome,
 * Firefox and Safari, and the perceived speed swings wildly with distance (the same duration
 * covers a short hop and the full page). This drives the scroll by hand instead, so the win
 * banner lands the same way everywhere: quick to start, gentle to settle, never rushed and
 * never draggy regardless of how far down the page it is.
 */

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

const MIN_DURATION = 350;
const MAX_DURATION = 900;
/** Milliseconds per pixel of travel, before clamping - tuned so a typical reveal-to-banner
 *  hop (roughly half a screen) lands near the middle of the duration range. */
const MS_PER_PIXEL = 0.5;

/**
 * Scrolls so `target`'s center lands at the viewport's center, eased and distance-proportional.
 * Always animates, deliberately ignoring prefers-reduced-motion: the one-time reveal scroll is
 * brief and small, and jumping straight to the banner read as broken rather than considerate.
 * Safe to call again mid-scroll: a fresh call cancels whatever animation was already running.
 */
export function smoothScrollToCenter(target: Element): void {
  const startY = window.scrollY;
  const rect = target.getBoundingClientRect();
  const targetY = startY + rect.top + rect.height / 2 - window.innerHeight / 2;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const endY = Math.max(0, Math.min(targetY, maxScroll));
  const distance = endY - startY;

  if (Math.abs(distance) < 1) return;

  if (activeFrame !== null) cancelAnimationFrame(activeFrame);

  const duration = Math.min(MAX_DURATION, Math.max(MIN_DURATION, Math.abs(distance) * MS_PER_PIXEL));
  const start = performance.now();

  function step(now: number) {
    const elapsed = now - start;
    const t = Math.min(1, elapsed / duration);
    window.scrollTo(0, startY + distance * easeInOutCubic(t));
    activeFrame = t < 1 ? requestAnimationFrame(step) : null;
  }

  activeFrame = requestAnimationFrame(step);
}

let activeFrame: number | null = null;
