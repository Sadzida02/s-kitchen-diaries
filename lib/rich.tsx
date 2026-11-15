import { Fragment } from "react";

// Turns a translated string with a little markup into React nodes:
// **word** becomes bold and *word* becomes italic. {name} values can be filled in first
// with fill(). Works in server and browser components.
export function rich(text: string, classes: { strong?: string; em?: string } = {}) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className={classes.strong}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={index} className={classes.em}>
          {part.slice(1, -1)}
        </em>
      );
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

// "See {title} recipes" + { title: "Sweet" } -> "See Sweet recipes"
export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
}
