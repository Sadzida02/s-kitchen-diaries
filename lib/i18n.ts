// Languages of the site. No server code in here, so browser components can use it too.
export const LOCALES = ["en", "bs"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LANG_COOKIE = "lang";

export function isLocale(value: string | undefined): value is Locale {
  return (LOCALES as readonly string[]).includes(value ?? "");
}

// "/recipes?style=healthy" -> "/bs/recipes?style=healthy", "/#favourites" -> "/bs#favourites", "/" -> "/bs"
export function localePath(lang: Locale, path: string): string {
  if (path === "/") return `/${lang}`;
  if (path.startsWith("/#") || path.startsWith("/?")) return `/${lang}${path.slice(1)}`;
  return `/${lang}${path}`;
}

// Picks the right word form for a number. A list of three forms is
// [one, few, many] (Bosnian: 1 recept, 2 recepta, 5 recepata); a list of two is [one, other].
export function plural(lang: Locale, n: number, forms: readonly string[]): string {
  if (lang === "bs" && forms.length === 3) {
    const last = n % 10;
    const lastTwo = n % 100;
    if (last === 1 && lastTwo !== 11) return forms[0];
    if (last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) return forms[1];
    return forms[2];
  }
  return n === 1 ? forms[0] : (forms[1] ?? forms[0]);
}
