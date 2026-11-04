// Starts a new recipe file from the template.
//
//   npm run new-recipe -- "Pumpkin fall soup"
//
// Creates content/recipes/pumpkin-fall-soup.md and the photo folder
// public/recipes/pumpkin-fall-soup/ (put the photos there, or use `npm run images`).
import fs from "node:fs";
import path from "node:path";

const title = process.argv.slice(2).join(" ").trim();
if (!title) {
  console.error('Usage: npm run new-recipe -- "Name of the recipe"');
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .normalize("NFD")
  .replace(/[̀-ͯ]/g, "")
  .replace(/đ/g, "d")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");
if (!slug) {
  console.error("That name has no letters or numbers to make a file name from.");
  process.exit(1);
}

const file = path.join(process.cwd(), "content", "recipes", `${slug}.md`);
if (fs.existsSync(file)) {
  console.error(`content/recipes/${slug}.md already exists.`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const template = fs
  .readFileSync(path.join(process.cwd(), "content", "recipes", "_template.md"), "utf8")
  .replace("title: Name of the recipe", `title: ${title}`)
  .replace("added: 2026-11-04", `added: ${today}`)
  // the explanation comment at the end is only for the template
  .replace(/\n<!--[\s\S]*?-->\s*$/, "\n");

fs.writeFileSync(file, template, "utf8");
fs.mkdirSync(path.join(process.cwd(), "public", "recipes", slug), { recursive: true });
console.log(`Created content/recipes/${slug}.md and public/recipes/${slug}/`);
