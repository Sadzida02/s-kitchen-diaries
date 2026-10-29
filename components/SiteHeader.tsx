"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import styles from "./SiteHeader.module.css";

export default function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const clear = pathname === "/" && !scrolled;

  return (
    <header className={`${styles.header} ${clear ? styles.clear : ""}`}>
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
