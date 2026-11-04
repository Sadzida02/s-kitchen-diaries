// Reads the recipes from content/recipes/*.md (one file per recipe) at build
// time. Server code only: it uses the file system, so browser components must
// import types from ./recipe-types and the filters from ./filters instead.
import fs from "node:fs";
import path from "node:path";
import { DIFFICULTIES, TAGS, TASTES } from "./recipe-types";
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

// the text before the first "## " heading, then the "## Ingredients" and "## Steps" lists
function parseBody(body: string) {
  const sections: Record<string, string[]> = { intro: [] };
  let current = "intro";
  for (const line of body.replace(/<!--[\s\S]*?-->/g, "").split(/\r?\n/)) {
    const heading = line.match(/^##\s+(.+?)\s*$/);
    if (heading) {
      current = heading[1].toLowerCase();
      sections[current] = [];
    } else {
      sections[current].push(line);
    }
  }
  const items = (lines: string[] = []) =>
    lines.map((line) => line.replace(/^\s*(?:[-*]|\d+[.)])\s+/, "").trim()).filter(Boolean);
  return {
    note: sections.intro.join(" ").replace(/\s+/g, " ").trim(),
    ingredients: items(sections.ingredients),
    steps: items(sections.steps),
  };
}

function asString(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value.join(", ") : (value ?? "");
}

function loadRecipe(file: string): Recipe {
  const slug = file.replace(/\.md$/, "");
  const fail = (message: string): never => {
    throw new Error(`content/recipes/${file}: ${message}`);
  };

  const { data, body } = parseFrontMatter(fs.readFileSync(path.join(RECIPES_DIR, file), "utf8"));
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

  // an image name lives in public/recipes/<slug>/; a path starting with / is used as it is
  const imageName = asString(data.image);
  if (!imageName) fail('missing "image:" in the front matter');
  const image = imageName.startsWith("/") ? imageName : `/recipes/${slug}/${imageName}`;
  if (!fs.existsSync(path.join(process.cwd(), "public", image))) {
    fail(`the photo "${image}" was not found in the public folder`);
  }

  // every other photo in the recipe's folder is part of its gallery
  const folder = path.join(PHOTOS_DIR, slug);
  const gallery = fs.existsSync(folder)
    ? fs
        .readdirSync(folder)
        .filter((name) => IMAGE_FILE.test(name) && `/recipes/${slug}/${name}` !== image)
        .sort()
        .map((name) => `/recipes/${slug}/${name}`)
    : [];

  const podium = data.podium ? Number(data.podium) : undefined;
  if (podium !== undefined && !(podium >= 1 && podium <= 5)) fail("podium must be a number from 1 to 5");

  const parsed = parseBody(body);
  return {
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
    gallery,
    podium,
    added: asString(data.added) || undefined,
  };
}

let cached: Recipe[] | undefined;

// Newest first, then the ones without a date by name. While developing the files
// are read again every time, so a new recipe shows up without restarting.
export function getRecipes(): Recipe[] {
  if (cached) return cached;
  const list = fs
    .readdirSync(RECIPES_DIR)
    .filter((file) => file.endsWith(".md") && !file.startsWith("_"))
    .map(loadRecipe)
    .sort((a, b) => (b.added ?? "").localeCompare(a.added ?? "") || a.title.localeCompare(b.title));
  if (process.env.NODE_ENV === "production") cached = list;
  return list;
}

export function getRecipe(slug: string): Recipe | undefined {
  return getRecipes().find((recipe) => recipe.slug === slug);
}

// the five podium places, in order
export function getFeatured(): Recipe[] {
  return getRecipes()
    .filter((recipe) => recipe.podium)
    .sort((a, b) => (a.podium ?? 0) - (b.podium ?? 0))
    .slice(0, 5);
}

export function getLatest(count = 4): Recipe[] {
  return getRecipes()
    .filter((recipe) => recipe.added)
    .slice(0, count);
}

// recipes that share the most tags (and the same taste), best match first
export function getRelated(recipe: Recipe, count = 4): Recipe[] {
  return getRecipes()
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
