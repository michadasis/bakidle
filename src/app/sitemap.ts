import type { MetadataRoute } from "next";
import { GAME_MODES } from "@/game/modes";

const SITE = "https://bakidle.vercel.app";

// Required by output: "export" - the sitemap is built once at build time, not per request.
export const dynamic = "force-static";

/**
 * Generated from the mode list, so adding a mode cannot leave the sitemap behind the way the
 * hand-maintained sitemap.xml did.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE}/`, changeFrequency: "daily", priority: 1 },
    ...GAME_MODES.map((m) => ({
      url: `${SITE}/${m.id}`,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    { url: `${SITE}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
