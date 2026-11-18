// One-time copy of every recipe from content/recipes/*.md into the Supabase database.
// Run it with:   npx tsx --env-file=.env.local scripts/migrate-recipes-to-db.ts
// It is safe to run again: recipes are matched by their slug and updated, not duplicated.
// The photos stay in public/recipes/ (the database stores their web paths).
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { getRecipes } from "../lib/recipes-files";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in .env.local");

const supabase = createClient(url, key, { auth: { persistSession: false } });

function check<T>(label: string, result: { data: T; error: { message: string } | null }): T {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result.data;
}

async function main() {
  const english = getRecipes("en");
  const bosnian = new Map(getRecipes("bs").map((recipe) => [recipe.slug, recipe]));
  console.log(`Found ${english.length} recipes.`);

  const rows = english.map((recipe) => ({
    slug: recipe.slug,
    taste: recipe.category,
    tags: recipe.tags,
    difficulty: recipe.difficulty ?? "easy",
    cover_image: recipe.image,
    added: recipe.added ?? "2026-01-01",
    podium: recipe.podium ?? null,
    published: true,
  }));
  const saved = check(
    "recipes",
    await supabase.from("recipes").upsert(rows, { onConflict: "slug" }).select("id, slug"),
  );
  const idOf = new Map((saved ?? []).map((row) => [row.slug, row.id as string]));

  const translations = english.flatMap((recipe) => {
    const recipeId = idOf.get(recipe.slug)!;
    const make = (lang: "en" | "bs", source: typeof recipe) => ({
      recipe_id: recipeId,
      lang,
      title: source.title,
      alt: source.alt,
      intro: source.note,
      ingredient_groups: source.ingredientGroups,
      step_groups: source.stepGroups,
    });
    const list = [make("en", recipe)];
    // a Bosnian row only where a Bosnian file exists; the other recipes show English in Bosnian too
    if (fs.existsSync(path.join(process.cwd(), "content", "recipes", "bs", `${recipe.slug}.md`))) {
      list.push(make("bs", bosnian.get(recipe.slug) ?? recipe));
    }
    return list;
  });
  check("translations", await supabase.from("recipe_translations").upsert(translations, { onConflict: "recipe_id,lang" }));

  // the gallery photos: replace the old rows with the current ones
  const ids = [...idOf.values()];
  check("old photos", await supabase.from("recipe_photos").delete().in("recipe_id", ids));
  const photos = english.flatMap((recipe) =>
    recipe.gallery.map((src, index) => ({ recipe_id: idOf.get(recipe.slug)!, path: src, sort: index })),
  );
  if (photos.length) check("photos", await supabase.from("recipe_photos").insert(photos));

  console.log(
    `Done: ${rows.length} recipes, ${translations.filter((t) => t.lang === "bs").length} Bosnian translations, ${photos.length} gallery photos.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
