import Link from "next/link";
import { getDictionary } from "@/lib/dictionaries";
import { localePath } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import Flag from "./Flag";
import LangSwitch from "./LangSwitch";
import AuthLink from "./AuthLink";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import styles from "./SiteHeader.module.css";

// small line icons shown before each menu option; they take their colour from
// the .icon class in SiteHeader.module.css
function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const icons = {
  home: (
    <Icon>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-5h4v5" />
    </Icon>
  ),
  favourites: (
    <Icon>
      <path d="M12 20.5s-8-4.7-8-10.6A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 8 2.9c0 5.9-8 10.6-8 10.6Z" />
    </Icon>
  ),
  recipes: (
    <Icon>
      <path d="M7 14a4 4 0 1 1 1.5-7.7A4.5 4.5 0 0 1 15.5 6 4 4 0 1 1 17 14" />
      <path d="M7 14v6h10v-6" />
      <path d="M7 17.5h10" />
    </Icon>
  ),
  login: (
    <Icon>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
    </Icon>
  ),
  about: (
    <Icon>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 14a4.5 4.5 0 0 0 7 0" />
      <path d="M9 9.5h.01M15 9.5h.01" />
    </Icon>
  ),
};

export default function SiteHeader({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  const to = (path: string) => localePath(lang, path);
  const other: Locale = lang === "en" ? "bs" : "en";

  // the same four links and the language toggle, in the bar (wide screens) and in the menu (phones)
  const links = {
    home: (
      <Link href={to("/#sweet-or-salty")}>
        {icons.home}
        {t.nav.home}
      </Link>
    ),
    favourites: (
      <Link href={to("/#favourites")}>
        {icons.favourites}
        {t.nav.favourites}
      </Link>
    ),
    recipes: (
      <Link href={to("/recipes")}>
        {icons.recipes}
        {t.nav.recipes}
      </Link>
    ),
    about: (
      <Link href={to("/about")} className={styles.cta}>
        {icons.about}
        {t.nav.about}
      </Link>
    ),
    login: (
      <AuthLink href={to("/login")} profileHref={to("/profile")} loginLabel={t.auth.nav} accountLabel={t.auth.navAccount}>
        {icons.login}
      </AuthLink>
    ),
    switch: (
      <LangSwitch lang={lang} code={t.nav.switchCode} label={t.nav.switchLabel} className={styles.switch}>
        <Flag lang={other} className={styles.flag} />
      </LangSwitch>
    ),
  };

  return (
    <header className={styles.header}>
      <nav className={styles.bar} aria-label={t.nav.label}>
        <div className={styles.left}>
          {links.home}
          {links.recipes}
        </div>
        <Logo lang={lang} />
        <div className={styles.right}>
          {links.about}
          {links.login}
          {links.switch}
        </div>

        {/* phones: a three-line button that opens the whole menu */}
        <MobileMenu openLabel={t.nav.openMenu} closeLabel={t.nav.closeMenu}>
          {links.home}
          {links.recipes}
          {links.about}
          {links.login}
          {links.switch}
        </MobileMenu>
      </nav>
    </header>
  );
}
