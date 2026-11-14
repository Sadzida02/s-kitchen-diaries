// Turns a folder of recipe photos into recipe files for the website.
//
//   npm run import -- "<folder with all the photos>"            shows the groups it found (changes nothing)
//   npm run import -- "<folder with all the photos>" --write    creates the recipe files and shrinks the photos
//
// Photos of the same dish are grouped by their file name: the numbers at the end and
// the way the name is written are ignored, so "appleOats.jpg" and "appleOats2.JPG" become
// one recipe, "apple-oats". Photos with no real name (IMG_0493.jpg, 1000133530.JPG...)
// are listed separately so you can name them.
//
// For every group --write makes:
//   public/recipes/<slug>/cover.jpg, 01.jpg, 02.jpg   (shrunk to 1800 px)
//   content/recipes/<slug>.md                          (a draft: it is NOT shown on the site yet)
// A draft shows on the site once you delete its "draft: true" line. Existing recipes are never overwritten.
//
// Fix a grouping with scripts/recipe-groups.json, for example:
//   { "merge": { "mufins": "muffins", "ramstek": "ramsteak" },
//     "name":  { "IMG_0493.jpg": "kimbap" },
//     "cover": { "kiflice": "kiflice4.JPG" } }
// "merge" joins two groups, "name" gives an unnamed photo to a recipe, "cover" picks the
// cover photo of a recipe (by default the first one without a number at the end of its name).
//
// If a recipe already exists on the site, its file and cover stay as they are and the new
// photos are only added to its "More photos" gallery (running it again does not add them twice).
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const args = process.argv.slice(2);
const write = args.includes("--write");
const input = args.find((arg) => !arg.startsWith("--"));
if (!input || !fs.existsSync(input) || !fs.statSync(input).isDirectory()) {
  console.error('Usage: npm run import -- "<folder with all the photos>" [--write]');
  process.exit(1);
}

const root = process.cwd();
const overridesFile = path.join(root, "scripts", "recipe-groups.json");
const overrides = fs.existsSync(overridesFile) ? JSON.parse(fs.readFileSync(overridesFile, "utf8")) : {};
const merge = overrides.merge ?? {};
const nameFor = overrides.name ?? {};
const coverFor = overrides.cover ?? {};

const photos = fs
  .readdirSync(input)
  .filter((file) => /\.(jpe?g|png|webp|avif)$/i.test(file))
  .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));

// "Ašura" -> "asura", "Keks Kolač" -> "keks-kolac"
function plain(text) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d");
}

const unnamed = (base) => /^(IMG|PXL|DSC|PHOTO)[_-]?E?\d+$/i.test(base) || /^\d{6,}$/.test(base);

// "appleOats2" -> "apple-oats", "medenjak 4" -> "medenjak", "salty-wok" -> "wok"
function groupKey(file) {
  let base = path.parse(file).name.trim();
  if (unnamed(base)) return undefined;
  base = plain(base)
    .replace(/^(salty|sweet)[\s_-]+/i, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s*\(\d+\)\s*$/, "")
    .replace(/[\s_-]+/g, " ")
    .replace(/\s*\d+$/, "")
    .trim()
    .toLowerCase();
  const slug = base.replace(/\s+/g, "-");
  return merge[slug] ?? slug;
}

const groups = new Map();
const unsorted = [];
for (const file of photos) {
  const named = nameFor[file];
  const key = named ? (merge[named] ?? named) : groupKey(file);
  if (!key) unsorted.push(file);
  else groups.set(key, [...(groups.get(key) ?? []), file]);
}

// a first guess at sweet or salty from the name; you check it in the file afterwards
const SWEET = /cake|torta|tart|cookie|keks|brownie|muffin|mufin|oats|granola|baklav|halva|medenjak|crepe|pancake|palacinke|pavlov|date|datul|strudl|fritule|jabukovaca|asura|ummali|umm-ali|pudding|dessert|pastr|choco|raspberr|malin|jagod|strawberr|fruit|carsko|krempita|donut|waffle|jaffa|bride|mlijeko|kolac/;
const guessTaste = (slug) => (SWEET.test(slug) ? "sweet" : "salty");
const titleOf = (slug) => slug.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());

// the cover goes first: the one named in "cover", else a photo with no number at the end of its name
for (const [key, files] of groups) {
  const chosen = coverFor[key];
  files.sort((a, b) => {
    const rank = (file) => (file === chosen ? 0 : /\d$/.test(path.parse(file).name.trim()) ? 2 : 1);
    return rank(a) - rank(b) || a.localeCompare(b, "en", { numeric: true });
  });
}

const keys = [...groups.keys()].sort();
console.log(`\n${photos.length} photos -> ${keys.length} recipes, ${unsorted.length} photos without a name\n`);
for (const key of keys) {
  const files = groups.get(key);
  const existing = fs.existsSync(path.join(root, "content", "recipes", `${key}.md`));
  console.log(`${key.padEnd(28)} ${String(files.length).padStart(2)} photo${files.length === 1 ? " " : "s"}  ${existing ? "[already on the site] " : ""}${files.join(", ")}`);
}

if (unsorted.length) {
  console.log(`\nPhotos with no name (add them to "name" in scripts/recipe-groups.json):\n  ${unsorted.join("\n  ")}`);
}

// names that start with another name are often the same dish: "medenjak" and "medenjak-slice"
const similar = keys.flatMap((a) => keys.filter((b) => b !== a && b.startsWith(a + "-")).map((b) => `${b}  ->  ${a}`));
if (similar.length) {
  console.log(`\nMight be the same recipe (merge them in scripts/recipe-groups.json if so):\n  ${similar.join("\n  ")}`);
}

if (!write) {
  console.log("\nNothing was changed. Run again with --write to create the recipe files.");
  process.exit(0);
}

const sharp = createRequire(import.meta.url)("sharp");
let made = 0;
let extended = 0;
const shrink = (source, target) =>
  sharp(source)
    .rotate()
    .resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(target);

for (const key of keys) {
  const mdFile = path.join(root, "content", "recipes", `${key}.md`);
  const outDir = path.join(root, "public", "recipes", key);
  fs.mkdirSync(outDir, { recursive: true });

  // a recipe that is already on the site keeps its file and cover; the photos join its gallery
  if (fs.existsSync(mdFile)) {
    for (const file of groups.get(key)) {
      const target = path.join(outDir, `${plain(path.parse(file).name).toLowerCase().replace(/[^a-z0-9]+/g, "-")}.jpg`);
      if (!fs.existsSync(target)) await shrink(path.join(input, file), target);
    }
    extended++;
    continue;
  }

  for (const [index, file] of groups.get(key).entries()) {
    const target = index === 0 ? "cover.jpg" : `${String(index).padStart(2, "0")}.jpg`;
    await shrink(path.join(input, file), path.join(outDir, target));
  }
  const today = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(
    mdFile,
    [
      "---",
      `title: ${titleOf(key)}`,
      `taste: ${guessTaste(key)}`,
      "tags: []",
      "difficulty: easy",
      "image: cover.jpg",
      `added: ${today}`,
      "draft: true",
      "---",
      "Write a short description of the dish here.",
      "",
      "## Ingredients",
      "",
      "## Steps",
      "",
    ].join("\n"),
    "utf8",
  );
  made++;
}
console.log(`\nDone: ${made} recipe drafts created, ${extended} existing recipes got more photos. Open content/recipes, fill the drafts in and delete "draft: true" to publish each one.`);
