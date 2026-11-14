// Shrinks the photos of a recipe and puts them where the site looks for them.
//
//   npm run images -- <folder with the photos, or one photo> <recipe-slug> [--cover file.jpg]
//
// The photos can be anywhere on your computer (Desktop, Downloads...); the
// shrunk copies are written into the project for you.
// Examples: npm run images -- C:/Users/me/Desktop/soup pumpkin-soup
//           npm run images -- C:/Users/me/Desktop/IMG_1234.JPG pumpkin-soup
//
// Every photo in the folder is resized to at most 1800 px, saved as a light
// JPEG and written to public/recipes/<recipe-slug>/. The first photo (or the one
// named with --cover) becomes cover.jpg; the others are numbered 01.jpg, 02.jpg...
// and show up in the recipe's photo gallery. (sharp comes along with Next.js.)
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const args = process.argv.slice(2);
const coverIndex = args.indexOf("--cover");
const coverName = coverIndex >= 0 ? args[coverIndex + 1] : undefined;
const positional = args.filter((arg, i) => !arg.startsWith("--") && (coverIndex < 0 || i !== coverIndex + 1));
const [input, slug] = positional;

if (!input || !slug) {
  console.error("Usage: npm run images -- <folder with the photos, or one photo> <recipe-slug> [--cover file.jpg]");
  process.exit(1);
}
if (!fs.existsSync(input)) {
  console.error(`"${input}" was not found.`);
  process.exit(1);
}

// the first argument can be a folder of photos or one single photo
const isFile = fs.statSync(input).isFile();
const folder = isFile ? path.dirname(input) : input;
const files = isFile
  ? [path.basename(input)]
  : fs
      .readdirSync(input)
      .filter((name) => /\.(jpe?g|png|webp|avif|heic)$/i.test(name))
      .sort();
if (files.length === 0) {
  console.error("No photos found in that folder.");
  process.exit(1);
}
if (coverName && !files.includes(coverName)) {
  console.error(`The cover "${coverName}" is not in that folder.`);
  process.exit(1);
}

const outDir = path.join(process.cwd(), "public", "recipes", slug);
fs.mkdirSync(outDir, { recursive: true });

// the cover first, then the rest in name order
const ordered = coverName ? [coverName, ...files.filter((name) => name !== coverName)] : files;

let number = 0;
for (const [index, name] of ordered.entries()) {
  const target = index === 0 ? "cover.jpg" : `${String(++number).padStart(2, "0")}.jpg`;
  const source = path.join(folder, name);
  await sharp(source)
    .rotate() // follow the phone's orientation
    .resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(outDir, target));
  const before = Math.round(fs.statSync(source).size / 1024);
  const after = Math.round(fs.statSync(path.join(outDir, target)).size / 1024);
  console.log(`${name} -> public/recipes/${slug}/${target}   ${before} KB -> ${after} KB`);
}
console.log(`\nDone. In content/recipes/${slug}.md use:  image: cover.jpg`);
