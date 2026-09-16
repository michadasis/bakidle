import type { MetadataRoute } from "next";
import { SITE_URL } from "@/site";

// Required by output: "export" - built once at build time, not per request.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
