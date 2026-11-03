import Image from "next/image";
import Link from "next/link";
import styles from "./Logo.module.css";

type LogoProps = {
  variant?: "compact" | "stacked";
};

export default function Logo({ variant = "compact" }: LogoProps) {
  if (variant === "stacked") {
    return (
      <Link href="/" className={styles.stacked} aria-label="Sweet & Salty Diaries home">
        <Image src="/images/chef/chef-head.png" alt="" width={84} height={84} className={styles.headLarge} />
        <span className={styles.stackedName}>Sweet &amp; Salty</span>
        <span className={styles.stackedSub}>DIARIES</span>
      </Link>
    );
  }

  return (
    <Link href="/" className={styles.compact} aria-label="Sweet & Salty Diaries home">
      <Image src="/images/chef/chef-head.png" alt="" width={60} height={60} className={styles.head} />
      <span className={styles.name}>
        Sweet &amp; Salty
        <em>Diaries</em>
      </span>
    </Link>
  );
}
