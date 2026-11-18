// Types and the allowed words for recipes. This file has no server code, so
// both the recipe loader (lib/recipes.ts) and the browser components can use it.

export const TASTES = ["sweet", "salty"] as const;
export type Category = (typeof TASTES)[number];

export const TAGS = [
  "breakfast",
  "lunch",
  "healthy",
  "nosugar",
  "bosnian",
  "turkish",
  "arabic",
  "traditional",
  "desserts",
  "asian",
  "guilty",
] as const;
export type Tag = (typeof TAGS)[number];

export const DIFFICULTIES = ["easy", "medium", "hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export type FilterSlug = Category | Tag;

export type RecipeSection = { title: string; items: string[] };

export type Recipe = {
  // the id in the database (likes, comments and photos are attached to it)
  id: string;
  slug: string;
  title: string;
  // sweet or salty (the "taste" line in the recipe file)
  category: Category;
  tags: Tag[];
  difficulty?: Difficulty;
  // cover photo, as a web path
  image: string;
  alt: string;
  // the short description shown on cards and at the top of the recipe page
  note: string;
  ingredients: string[];
  steps: string[];
  // the same lists split by their headings, e.g. "Ingredients for the cake" and "Ingredients for the cream"
  ingredientGroups: RecipeSection[];
  stepGroups: RecipeSection[];
  // the other photos of the dish
  gallery: string[];
  // place on the Favourites podium, 1 to 5
  podium?: number;
  // ISO date the recipe went online; the newest ones feed "Latest additions"
  added?: string;
};
