import Link from "next/link";
import Logo from "./Logo";
import styles from "./SiteHeader.module.css";

export default function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Logo />
        <nav className={styles.nav} aria-label="Main">
          <Link href="/#sweet-or-salty">Sweet or salty</Link>
          <Link href="/#favourites">Favourites</Link>
          <Link href="/recipes">Recipes</Link>
          <Link href="/about">About me</Link>
        </nav>
      </div>
    </header>
  );
}
