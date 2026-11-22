import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/lib/dictionaries";
import { localePath } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import styles from "./Logo.module.css";

type LogoProps = {
  lang: Locale;
  variant?: "compact" | "stacked";
  // white lettering, for dark backgrounds
  light?: boolean;
  // the chef head next to the name
  head?: boolean;
  // 20% bigger (the footer)
  large?: boolean;
};

export default function Logo({ lang, variant = "compact", light = false, head = true, large = false }: LogoProps) {
  const home = localePath(lang, "/");
  const label = getDictionary(lang).site.homeAria;
  if (variant === "stacked") {
    return (
      <Link href={home} className={styles.stacked} aria-label={label}>
        <Image src="/images/chef/chef-head.png" alt="" width={168} height={168} className={styles.headLarge} />
        <span className={styles.stackedName}>Sweet &amp; Salty</span>
        <span className={styles.stackedSub}>DIARIES</span>
      </Link>
    );
  }

  return (
    <Link
      href={home}
      className={`${styles.compact} ${light ? styles.light : ""} ${large ? styles.large : ""}`}
      aria-label={label}
    >
      {head && (
        <Image src="/images/chef/chef-head.png" alt="" width={120} height={120} className={styles.head} />
      )}
      <span className={styles.name}>
        Sweet &amp; Salty
        <em>Diaries</em>
      </span>
    </Link>
  );
}
