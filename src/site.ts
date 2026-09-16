/**
 * One place the site's own address is built, so a future move to a real domain is one env var
 * rather than a hunt through every hardcoded "bakidle.vercel.app". Unset, everything falls back
 * to exactly what ships today.
 */
export const LEGACY_HOST = "bakidle.vercel.app";

export const SITE_URL = new URL(process.env.NEXT_PUBLIC_SITE_URL || `https://${LEGACY_HOST}`).origin;

export const SITE_HOST = new URL(SITE_URL).host;
