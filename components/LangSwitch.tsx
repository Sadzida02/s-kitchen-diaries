"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LANG_COOKIE } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

// The language toggle in the navbar: shows the language you can switch TO, keeps you on
// the same page (and filters) and remembers the choice for next time.
export default function LangSwitch({
  lang,
  code,
  label,
  className,
  children,
}: {
  lang: Locale;
  code: string;
  label: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const other: Locale = lang === "en" ? "bs" : "en";
  const href = pathname.replace(/^\/(en|bs)(?=\/|$)/, `/${other}`);

  return (
    <Link
      href={href}
      hrefLang={other}
      lang={other}
      className={className}
      aria-label={label}
      title={label}
      onClick={(event) => {
        event.preventDefault();
        document.cookie = `${LANG_COOKIE}=${other}; path=/; max-age=31536000; samesite=lax`;
        router.push(href + window.location.search + window.location.hash);
      }}
    >
      {children}
      {code}
    </Link>
  );
}
