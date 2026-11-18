// Reads the recipes from the Supabase database. Server code only.
// The list is kept in the server's memory for a while and refreshed right away when the admin
// dashboard saves something (it calls revalidateTag("recipes")).
import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import type { Locale } from "./i18n";
import type { Difficulty, Recipe, RecipeSection, Tag } from "./recipe-types";

export type { Recipe } from "./recipe-types";

type Translation = {
  lang: string;
  title: string;
  alt: string | null;
  intro: string;
  ingredient_groups: RecipeSection[];
  step_groups: RecipeSection[];
};

type Row = {
  slug: string;
  taste: Recipe["category"];
  tags: string[];
  difficulty: string;
  cover_image: string | null;
  added: string | null;
  podium: number | null;
  recipe_translations: Translation[];
  recipe_photos: { path: string; sort: number }[];
};

function toRecipe(row: Row, lang: Locale): Recipe | undefined {
  const english = row.recipe_translations.find((item) => item.lang === "en");
  const wanted = row.recipe_translations.find((item) => item.lang === lang) ?? english;
  if (!english || !wanted) return undefined;

  // whatever the Bosnian text leaves out stays in English
  const groups = (own: RecipeSection[], fallback: RecipeSection[]) => (own?.length ? own : fallback);
  const ingredientGroups = groups(wanted.ingredient_groups, english.ingredient_groups);
  const stepGroups = groups(wanted.step_groups, english.step_groups);
  const image = row.cover_image || "/recipes/placeholder.svg";

  return {
    slug: row.slug,
    title: wanted.title || english.title,
    category: row.taste,
    tags: row.tags as Tag[],
    difficulty: row.difficulty as Difficulty,
    image,
    alt: wanted.alt || wanted.title || english.title,
    note: wanted.intro || english.intro,
    ingredients: ingredientGroups.flatMap((group) => group.items),
    steps: stepGroups.flatMap((group) => group.items),
    ingredientGroups,
    stepGroups,
    gallery: [...row.recipe_photos]
      .sort((a, b) => a.sort - b.sort)
      .map((photo) => photo.path)
      .filter((src) => src !== image),
    podium: row.podium ?? undefined,
    added: row.added ?? undefined,
  };
}

// Newest first, then the ones without a date by name.
export async function getRecipes(lang: Locale = "en"): Promise<Recipe[]> {
  "use cache";
  cacheTag("recipes");
  cacheLife("hours");

  // the public (anon) key is enough: the database rules let everyone read published recipes
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
  const { data, error } = await supabase
    .from("recipes")
    .select("*, recipe_translations(*), recipe_photos(*)")
    .eq("published", true)
    .limit(1000);
  if (error) throw new Error(`Could not load the recipes: ${error.message}`);

  return (data as Row[])
    .map((row) => toRecipe(row, lang))
    .filter((recipe): recipe is Recipe => recipe !== undefined)
    .sort((a, b) => (b.added ?? "").localeCompare(a.added ?? "") || a.title.localeCompare(b.title, lang));
}

export async function getRecipe(slug: string, lang: Locale = "en"): Promise<Recipe | undefined> {
  return (await getRecipes(lang)).find((recipe) => recipe.slug === slug);
}

// the five podium places, in order
export async function getFeatured(lang: Locale = "en"): Promise<Recipe[]> {
  return (await getRecipes(lang))
    .filter((recipe) => recipe.podium)
    .sort((a, b) => (a.podium ?? 0) - (b.podium ?? 0))
    .slice(0, 5);
}

// The newest recipes by their `added` date (getRecipes already sorts that way).
// If fewer than `count` have a date, the rest are filled in from the other recipes.
export async function getLatest(count = 4, lang: Locale = "en"): Promise<Recipe[]> {
  const all = await getRecipes(lang);
  const dated = all.filter((recipe) => recipe.added);
  const undated = all.filter((recipe) => !recipe.added);
  return [...dated, ...undated].slice(0, count);
}

// recipes that share the most tags (and the same taste), best match first
export async function getRelated(recipe: Recipe, count = 4, lang: Locale = "en"): Promise<Recipe[]> {
  return (await getRecipes(lang))
    .filter((other) => other.slug !== recipe.slug)
    .map((other) => ({
      other,
      score:
        other.tags.filter((tag) => recipe.tags.includes(tag)).length * 2 +
        (other.category === recipe.category ? 1 : 0),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((item) => item.other);
}
