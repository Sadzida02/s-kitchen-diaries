import type { MetadataRoute } from "next";

// Tells search engines they may visit everything, and where the list of pages is.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://sweet-and-salty-diaries.vercel.app/sitemap.xml",
  };
}
