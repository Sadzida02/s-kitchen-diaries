import Link from "next/link";
import { getDictionary } from "@/lib/dictionaries";
import { localePath } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import Logo from "./Logo";
import SoundToggle from "./SoundToggle";
import styles from "./SiteFooter.module.css";


function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      width="22"
      height="22"
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

export default function SiteFooter({ lang }: { lang: Locale }) {
  const t = getDictionary(lang).footer;
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>

        <div className={styles.linksRow}>
          <Logo lang={lang} light large head={false} />
          <nav className={styles.quick} aria-label={t.quickLabel}>
            <Link href={localePath(lang, "/#favourites")}>
              {t.quick.favourites}
            </Link>
            <Link href={localePath(lang, "/#latest")}>{t.quick.latest}</Link>
            <Link href={localePath(lang, "/#spices")}>{t.quick.spices}</Link>
          </nav>
        </div>

        <ul className={styles.contact}>
          <li>
            <span>
              <Icon>
                <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
                <circle cx="12" cy="9.5" r="2.5" />
              </Icon>
              {t.location}
            </span>
          </li>
        </ul>

        <p className={styles.note}>{t.note}</p>
      </div>
      <div className={styles.tools} aria-hidden="true" />
      <div className={styles.copy}>
        <p>{t.copy}</p>
        <nav className={styles.legal} aria-label={t.privacy}>
          <Link href={localePath(lang, "/privacy")}>{t.privacy}</Link>
          <Link href={localePath(lang, "/terms")}>{t.terms}</Link>
        </nav>
        <SoundToggle onLabel={t.soundOn} offLabel={t.soundOff} />
      </div>
    </footer>
  );
}
