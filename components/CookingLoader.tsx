"use client";

import { useParams } from "next/navigation";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n";
import Cooking from "./Cooking";

// For loading.tsx, which is a browser component here so it can read the language from the address.
export default function CookingLoader() {
  const { lang } = useParams<{ lang?: string }>();
  return <Cooking lang={isLocale(lang) ? lang : DEFAULT_LOCALE} />;
}
