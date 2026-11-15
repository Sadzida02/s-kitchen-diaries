import type { Locale } from "../i18n";
import { bs } from "./bs";
import { en } from "./en";

export type { Dictionary } from "./en";

const dictionaries = { en, bs };

export function getDictionary(lang: Locale) {
  return dictionaries[lang];
}
