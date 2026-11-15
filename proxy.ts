import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEFAULT_LOCALE, LANG_COOKIE, LOCALES, isLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

// Visitors who open an address without a language (like /recipes) are sent to
// /en/recipes or /bs/recipes: the language they chose with the toggle last time,
// otherwise the one their browser asks for.
function pickLocale(request: NextRequest): Locale {
  const saved = request.cookies.get(LANG_COOKIE)?.value;
  if (isLocale(saved)) return saved;

  const header = request.headers.get("accept-language") ?? "";
  for (const part of header.split(",")) {
    const code = part.split(";")[0].trim().toLowerCase().split("-")[0];
    if (code === "bs" || code === "hr" || code === "sr") return "bs";
    if (isLocale(code)) return code;
  }
  return DEFAULT_LOCALE;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // leave Next's own files, API routes and anything with a file extension (images, icons) alone
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || /\.[a-z0-9]+$/i.test(pathname)) return;

  const hasLocale = LOCALES.some((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));
  if (hasLocale) return;

  request.nextUrl.pathname = `/${pickLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}
