// The filters on the recipes page and the circles on the home page. No server
// code in here, so browser components can import it too.
import type { Recipe, Tag, FilterSlug } from "./recipe-types";

export type CategoryInfo = {
  slug: FilterSlug;
  title: string;
  line: string;
  image: string;
  alt: string;
};

// The circles on the home page; each one links to the recipes page filtered by it.
export const categories: CategoryInfo[] = [
  { slug: "sweet", title: "Sweet", line: "Something sweet for the end of the table.", image: "/images/sweet-cinnamon-rolls.jpg", alt: "A tray of cinnamon rolls with white icing" },
  { slug: "salty", title: "Savory", line: "Something savoury for the middle of it.", image: "/images/salty-pizza.jpg", alt: "Homemade pizza with fresh toppings" },
  { slug: "traditional", title: "Traditional", line: "Dishes from home and from the old recipe notebook.", image: "/images/kiflice.jpg", alt: "A tray of baked kiflice" },
  { slug: "healthy", title: "Healthy", line: "Fresh, light, and colourful.", image: "/images/salty-avo-toast.JPG", alt: "Strawberry dessert in glasses with tulips" },
  { slug: "desserts", title: "Desserts", line: "Cakes, creams, and every little sweet bite.", image: "/images/sweet-mini-pavlova.jpg", alt: "Mini pavlovas topped with cream and berries" },
  { slug: "turkish", title: "Turkish", line: "A Turkish spoon in my kitchen.", image: "/images/salty-pide.jpg", alt: "Halva in a small dish" },
  { slug: "asian", title: "Asian", line: "Fresh bowls and bold flavours.", image: "/images/salty-poke-bowl.jpg", alt: "Poke bowls with fresh vegetables" },
  { slug: "guilty", title: "Guilty pleasures", line: "Worth every single bite.", image: "/images/sweet-cookies.jpg", alt: "Round cookies with sesame and seeds" },
];

// ---------------------------------------------------------------------------
// Filters on the recipes page, in the order they show up. You can pick one
// option in each group and the groups combine: for example "Sweet" + "Breakfast".
// A recipe belongs to an option through its taste or its tags:
//   type    -> taste ("sweet" or "salty")
//   style   -> tags "healthy", "nosugar", "guilty"
//   meal    -> tags "breakfast", "lunch", "desserts"
//   origin  -> "traditional" (tags traditional or bosnian), "middleeast" (tags
//              arabic or turkish), "asian" (tag asian) and "others" (none of those)
// ---------------------------------------------------------------------------
export type FilterKey = "type" | "style" | "meal" | "origin";

export type FilterOption = { slug: string; title: string };

export type FilterGroup = {
  key: FilterKey;
  title: string;
  options: FilterOption[];
};

export const filterGroups: FilterGroup[] = [
  {
    key: "type",
    title: "Taste",
    options: [
      { slug: "sweet", title: "Sweet" },
      { slug: "salty", title: "Salty" },
    ],
  },
  {
    key: "style",
    title: "Style",
    options: [
      { slug: "healthy", title: "Healthy" },
      { slug: "nosugar", title: "No sugar" },
      { slug: "guilty", title: "Guilty pleasures" },
    ],
  },
  {
    key: "meal",
    title: "Meal",
    options: [
      { slug: "breakfast", title: "Breakfast" },
      { slug: "lunch", title: "Lunch" },
      { slug: "desserts", title: "Desserts" },
    ],
  },
  {
    key: "origin",
    title: "Cuisines",
    options: [
      { slug: "traditional", title: "Traditional" },
      { slug: "middleeast", title: "Middle East" },
      { slug: "asian", title: "Asian" },
      { slug: "others", title: "Others" },
    ],
  },
];

export type FilterSelection = Partial<Record<FilterKey, string>>;

const MIDDLE_EAST_TAGS: Tag[] = ["arabic", "turkish"];
const TRADITIONAL_TAGS: Tag[] = ["traditional", "bosnian"];

function matchesOption(recipe: Recipe, key: FilterKey, slug: string): boolean {
  const tags = recipe.tags;
  if (key === "type") return recipe.category === slug;
  if (key === "style" || key === "meal") return (tags as string[]).includes(slug);
  if (slug === "traditional") return tags.some((tag) => TRADITIONAL_TAGS.includes(tag));
  if (slug === "middleeast") return tags.some((tag) => MIDDLE_EAST_TAGS.includes(tag));
  if (slug === "asian") return tags.includes("asian");
  // "others": not traditional, not Middle East, not Asian
  return !tags.some(
    (tag) => TRADITIONAL_TAGS.includes(tag) || MIDDLE_EAST_TAGS.includes(tag) || tag === "asian",
  );
}

// Every word typed in the search has to show up somewhere in the recipe's title,
// note, category or tags.
function matchesQuery(recipe: Recipe, query: string): boolean {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const text = [recipe.title, recipe.note, recipe.category, ...recipe.tags].join(" ").toLowerCase();
  return words.every((word) => text.includes(word));
}

export function filterRecipes(all: Recipe[], selection: FilterSelection, query = ""): Recipe[] {
  return all.filter(
    (recipe) =>
      matchesQuery(recipe, query) &&
      filterGroups.every((group) => {
        const slug = selection[group.key];
        return !slug || matchesOption(recipe, group.key, slug);
      }),
  );
}

// The circles on the home page link to /recipes?category=<slug>; this turns that
// link into the right filter.
const legacyCategory: Record<string, [FilterKey, string]> = {
  sweet: ["type", "sweet"],
  salty: ["type", "salty"],
  healthy: ["style", "healthy"],
  guilty: ["style", "guilty"],
  desserts: ["meal", "desserts"],
  traditional: ["origin", "traditional"],
  turkish: ["origin", "middleeast"],
  asian: ["origin", "asian"],
};

export function selectionFromParams(params: Record<string, string | string[] | undefined>): FilterSelection {
  const selection: FilterSelection = {};
  for (const group of filterGroups) {
    const value = params[group.key];
    if (typeof value === "string" && group.options.some((option) => option.slug === value)) {
      selection[group.key] = value;
    }
  }
  const legacy = typeof params.category === "string" ? legacyCategory[params.category] : undefined;
  if (legacy && !selection[legacy[0]]) selection[legacy[0]] = legacy[1];
  return selection;
}
