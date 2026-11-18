import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n";
import { getRecipes } from "@/lib/recipes";

const SITE = "https://sweet-and-salty-diaries.vercel.app";

// The list of every page, in both languages, that you hand to Google (sitemap.xml).
// Each page also says where its other-language version is.
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/recipes", "/about", "/privacy", "/terms", ...getRecipes().map((recipe) => `/recipes/${recipe.slug}`)];

  return paths.flatMap((path) =>
    LOCALES.map((lang) => ({
      url: `${SITE}/${lang}${path}`,
      lastModified: new Date(),
      changeFrequency: path.startsWith("/recipes/") ? ("monthly" as const) : ("weekly" as const),
      priority: path === "" ? 1 : path.startsWith("/recipes/") ? 0.6 : 0.8,
      alternates: {
        languages: Object.fromEntries(LOCALES.map((other) => [other, `${SITE}/${other}${path}`])),
      },
    })),
  );
}
