import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Tells search engines they may visit everything, and where the list of pages is.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
