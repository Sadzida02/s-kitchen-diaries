import Link from "next/link";
import { getDictionary } from "@/lib/dictionaries";
import { localePath } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import Logo from "./Logo";
import styles from "./SiteFooter.module.css";

const EMAIL = "valjevac.sadzida002@gmail.com";
// put your Instagram username here (without the @)
const INSTAGRAM = "_sadzida_";

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
        <Logo lang={lang} light head={false} />
        <p className={styles.note}>
          {t.note}
        </p>

        <nav className={styles.quick} aria-label={t.quickLabel}>
          <Link href={localePath(lang, "/#favourites")}>{t.quick.favourites}</Link>
          <Link href={localePath(lang, "/#latest")}>{t.quick.latest}</Link>
          <Link href={localePath(lang, "/#spices")}>{t.quick.spices}</Link>
        </nav>

        <ul className={styles.contact}>
          <li>
            <a href={`mailto:${EMAIL}`}>
              <Icon>
                <rect x="3" y="5" width="18" height="14" rx="3" />
                <path d="m4 8 8 6 8-6" />
              </Icon>
              {EMAIL}
            </a>
          </li>
          <li>
            <a href={`https://www.instagram.com/${INSTAGRAM}/`} target="_blank" rel="noopener noreferrer">
              <Icon>
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <path d="M17.5 6.5h.01" />
              </Icon>
              @{INSTAGRAM}
            </a>
          </li>
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
      </div>
      <div className={styles.tools} aria-hidden="true" />
      <p className={styles.copy}>{t.copy}</p>
    </footer>
  );
}
