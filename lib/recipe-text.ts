import type { RecipeSection } from "./recipe-types";

// The dashboard edits ingredient and step lists as plain text:
//   ## Ingredients for the cake      <- a heading starts a new group (optional)
//   - 200 g flour                    <- one line per item ("- ", "1. " at the start are ignored)
export function parseGroups(text: string): RecipeSection[] {
  const groups: RecipeSection[] = [];
  let current: RecipeSection | undefined;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const heading = line.match(/^##\s*(.+)$/);
    if (heading) {
      current = { title: heading[1].trim(), items: [] };
      groups.push(current);
      continue;
    }
    const item = line.replace(/^(?:[-*]|\d+[.)])\s+/, "").trim();
    if (!item) continue;
    if (!current) {
      current = { title: "", items: [] };
      groups.push(current);
    }
    current.items.push(item);
  }
  return groups.filter((group) => group.items.length > 0);
}

export function formatGroups(groups: RecipeSection[]): string {
  return groups
    .map((group) => [group.title ? `## ${group.title}` : "", ...group.items.map((item) => `- ${item}`)].filter(Boolean).join("\n"))
    .join("\n\n");
}

// "Chocolate Brownies!" -> "chocolate-brownies"
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
