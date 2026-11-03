import Link from "next/link";
import Logo from "./Logo";
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

export default function SiteHeader() {
  return (
    <header className={styles.header}>
      <nav className={styles.bar} aria-label="Main">
        <div className={styles.left}>
          <Link href="/#sweet-or-salty">
            <Icon>
              <path d="M3 11.5 12 4l9 7.5" />
              <path d="M5 10v10h14V10" />
              <path d="M10 20v-5h4v5" />
            </Icon>
            Home
          </Link>
          <Link href="/#favourites">
            <Icon>
              <path d="M12 20.5s-8-4.7-8-10.6A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 8 2.9c0 5.9-8 10.6-8 10.6Z" />
            </Icon>
            Favourites
          </Link>
        </div>
        <Logo />
        <div className={styles.right}>
          <Link href="/recipes">
            <Icon>
              <path d="M7 14a4 4 0 1 1 1.5-7.7A4.5 4.5 0 0 1 15.5 6 4 4 0 1 1 17 14" />
              <path d="M7 14v6h10v-6" />
              <path d="M7 17.5h10" />
            </Icon>
            Recipes
          </Link>
          <Link href="/about">
            <Icon>
              <circle cx="12" cy="12" r="9" />
              <path d="M8.5 14a4.5 4.5 0 0 0 7 0" />
              <path d="M9 9.5h.01M15 9.5h.01" />
            </Icon>
            About me
          </Link>
        </div>
      </nav>
    </header>
  );
}
