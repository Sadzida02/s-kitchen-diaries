// Reads the recipes from content/recipes/*.md (one file per recipe) at build
// time. Server code only: it uses the file system, so browser components must
// import types from ./recipe-types and the filters from ./filters instead.
import fs from "node:fs";
import path from "node:path";
import { DIFFICULTIES, TAGS, TASTES } from "./recipe-types";
import type { Locale } from "./i18n";
import type { Difficulty, Recipe, Tag } from "./recipe-types";

export type { Recipe } from "./recipe-types";

const RECIPES_DIR = path.join(process.cwd(), "content", "recipes");
const PHOTOS_DIR = path.join(process.cwd(), "public", "recipes");
const IMAGE_FILE = /\.(jpe?g|png|webp|avif)$/i;

// "key: value" lines between two --- lines; a value like [a, b] is a list
function parseFrontMatter(text: string): { data: Record<string, string | string[]>; body: string } {
  const match = text.replace(/^﻿/, "").match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: text };
  const data: Record<string, string | string[]> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const found = line.match(/^([A-Za-z][\w-]*)\s*:\s*(.*)$/);
    if (!found) continue;
    const value = found[2].trim();
    if (value.startsWith("[") && value.endsWith("]")) {
      data[found[1]] = value
        .slice(1, -1)
        .split(",")
        .map((item) => item.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else {
      data[found[1]] = value.replace(/^["']|["']$/g, "");
    }
  }
  return { data, body: match[2] };
}

// The text before the first "## " heading is the description. Every "## " heading that
// starts with "Ingredient" begins a list of ingredients and every one that starts with
// "Step", "Method", "Instructions" or "Directions" begins a list of steps, so a recipe can
// have several of each ("## Ingredients for the cake", "## Ingredients for the cream").
function parseBody(body: string) {
  const intro: string[] = [];
  const groups: { title: string; kind: "ingredients" | "steps" | "other"; lines: string[] }[] = [];
  let current: (typeof groups)[number] | undefined;
  for (const line of body.replace(/<!--[\s\S]*?-->/g, "").split(/\r?\n/)) {
    const heading = line.match(/^##\s+(.+?)\s*$/);
    if (heading) {
      const title = heading[1];
      // English and Bosnian headings ("Ingredients for the cake", "Sastojci za tijesto", "Koraci", "Priprema")
      const kind = /^(ingredient|sastoj)/i.test(title)
        ? "ingredients"
        : /^(steps?|method|instructions?|directions?|korak|koraci|priprema|upute|način)/i.test(title)
          ? "steps"
          : "other";
      // A heading that is neither, like "## For the rice" or "## Za dekoraciju", continues
      // the kind of list above it: after the ingredients it is more ingredients.
      const inherited = kind === "other" ? (current?.kind ?? "other") : kind;
      current = { title, kind: inherited, lines: [] };
      groups.push(current);
    } else if (current) {
      current.lines.push(line);
    } else {
      intro.push(line);
    }
  }
  const items = (lines: string[]) =>
    lines.map((line) => line.replace(/^\s*(?:[-*]|\d+[.)])\s+/, "").trim()).filter(Boolean);
  const sections = (kind: "ingredients" | "steps") =>
    groups
      .filter((group) => group.kind === kind)
      .map((group) => ({ title: group.title, items: items(group.lines) }))
      .filter((group) => group.items.length > 0);
  const ingredientGroups = sections("ingredients");
  const stepGroups = sections("steps");
  return {
    note: intro.join(" ").replace(/\s+/g, " ").trim(),
    ingredientGroups,
    stepGroups,
    ingredients: ingredientGroups.flatMap((group) => group.items),
    steps: stepGroups.flatMap((group) => group.items),
  };
}

function asString(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value.join(", ") : (value ?? "");
}

function loadRecipe(file: string, lang: Locale = "en"): Recipe | undefined {
  const slug = file.replace(/\.md$/, "");
  const fail = (message: string): never => {
    throw new Error(`content/recipes/${file}: ${message}`);
  };

  const { data, body } = parseFrontMatter(fs.readFileSync(path.join(RECIPES_DIR, file), "utf8"));
  // a recipe marked "draft: true" is not on the site yet (npm run import creates drafts)
  if (asString(data.draft).toLowerCase() === "true") return undefined;
  const title = asString(data.title);
  if (!title) fail('missing "title:" in the front matter');

  const taste = asString(data.taste);
  if (!(TASTES as readonly string[]).includes(taste)) {
    fail(`taste must be one of: ${TASTES.join(", ")} (found "${taste}")`);
  }

  const rawTags = Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [];
  for (const tag of rawTags) {
    if (!(TAGS as readonly string[]).includes(tag)) {
      fail(`unknown tag "${tag}". Allowed tags: ${TAGS.join(", ")}`);
    }
  }

  const difficulty = asString(data.difficulty);
  if (difficulty && !(DIFFICULTIES as readonly string[]).includes(difficulty)) {
    fail(`difficulty must be one of: ${DIFFICULTIES.join(", ")} (found "${difficulty}")`);
  }

  // The cover is a file name inside public/recipes/<slug>/, or a path starting with /.
  // If that file is missing the page still works: the first photo in the recipe's
  // folder is used, or a plain placeholder, and a warning shows in the terminal.
  const folder = path.join(PHOTOS_DIR, slug);
  const inFolder = fs.existsSync(folder)
    ? fs.readdirSync(folder).filter((name) => IMAGE_FILE.test(name)).sort()
    : [];
  const web = (name: string) => `/recipes/${slug}/${encodeURIComponent(name)}`;

  const imageName = asString(data.image);
  let image = imageName.startsWith("/") ? imageName : imageName ? web(imageName) : "";
  if (!image || !fs.existsSync(path.join(process.cwd(), "public", decodeURIComponent(image)))) {
    const fallback = inFolder[0] ? web(inFolder[0]) : "/recipes/placeholder.svg";
    console.warn(
      `[recipes] content/recipes/${file}: the photo "${imageName || "(none)"}" was not found in public/recipes/${slug}/. ` +
        (inFolder[0] ? `Using "${inFolder[0]}" for now.` : "Showing a placeholder until you add a photo."),
    );
    image = fallback;
  }

  // every other photo in the recipe's folder is part of its gallery
  const gallery = inFolder.map(web).filter((src) => src !== image);

  const podium = data.podium ? Number(data.podium) : undefined;
  if (podium !== undefined && !(podium >= 1 && podium <= 5)) fail("podium must be a number from 1 to 5");

  const parsed = parseBody(body);
  const recipe: Recipe = {
    slug,
    title,
    category: taste as Recipe["category"],
    tags: rawTags as Tag[],
    difficulty: (difficulty || undefined) as Difficulty | undefined,
    image,
    alt: asString(data.alt) || title,
    note: parsed.note,
    ingredients: parsed.ingredients,
    steps: parsed.steps,
    ingredientGroups: parsed.ingredientGroups,
    stepGroups: parsed.stepGroups,
    gallery,
    podium,
    added: asString(data.added) || undefined,
  };
  return lang === "bs" ? withBosnian(recipe, file) : recipe;
}

// A Bosnian recipe is an extra file content/recipes/bs/<same name>.md with only the words:
// a title (and alt) in the front matter, then the description and the ingredient and
// step lists. Whatever it leaves out (or if there is no such file) stays in English.
function withBosnian(recipe: Recipe, file: string): Recipe {
  const bsFile = path.join(RECIPES_DIR, "bs", file);
  if (!fs.existsSync(bsFile)) return recipe;
  const { data, body } = parseFrontMatter(fs.readFileSync(bsFile, "utf8"));
  const parsed = parseBody(body);
  const title = asString(data.title) || recipe.title;
  const has = (list: unknown[]) => list.length > 0;
  return {
    ...recipe,
    title,
    alt: asString(data.alt) || title,
    note: parsed.note || recipe.note,
    ingredients: has(parsed.ingredients) ? parsed.ingredients : recipe.ingredients,
    steps: has(parsed.steps) ? parsed.steps : recipe.steps,
    ingredientGroups: has(parsed.ingredientGroups) ? parsed.ingredientGroups : recipe.ingredientGroups,
    stepGroups: has(parsed.stepGroups) ? parsed.stepGroups : recipe.stepGroups,
  };
}

const cached: Partial<Record<Locale, Recipe[]>> = {};

// Newest first, then the ones without a date by name. While developing the files
// are read again every time, so a new recipe shows up without restarting.
export function getRecipes(lang: Locale = "en"): Recipe[] {
  if (cached[lang]) return cached[lang];
  const list = fs
    .readdirSync(RECIPES_DIR)
    .filter((file) => file.endsWith(".md") && !file.startsWith("_"))
    .map((file) => loadRecipe(file, lang))
    .filter((recipe): recipe is Recipe => recipe !== undefined)
    .sort((a, b) => (b.added ?? "").localeCompare(a.added ?? "") || a.title.localeCompare(b.title, lang));
  if (process.env.NODE_ENV === "production") cached[lang] = list;
  return list;
}

export function getRecipe(slug: string, lang: Locale = "en"): Recipe | undefined {
  return getRecipes(lang).find((recipe) => recipe.slug === slug);
}

// the five podium places, in order
export function getFeatured(lang: Locale = "en"): Recipe[] {
  return getRecipes(lang)
    .filter((recipe) => recipe.podium)
    .sort((a, b) => (a.podium ?? 0) - (b.podium ?? 0))
    .slice(0, 5);
}

// The newest recipes by their `added` date (getRecipes already sorts that way).
// If fewer than `count` have a date, the rest are filled in from the other recipes.
export function getLatest(count = 4, lang: Locale = "en"): Recipe[] {
  const all = getRecipes(lang);
  const dated = all.filter((recipe) => recipe.added);
  const undated = all.filter((recipe) => !recipe.added);
  return [...dated, ...undated].slice(0, count);
}

// recipes that share the most tags (and the same taste), best match first
export function getRelated(recipe: Recipe, count = 4, lang: Locale = "en"): Recipe[] {
  return getRecipes(lang)
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
