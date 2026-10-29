import Link from "next/link";
import styles from "./Logo.module.css";

type LogoProps = {
  variant?: "compact" | "stacked";
};

export default function Logo({ variant = "compact" }: LogoProps) {
  if (variant === "stacked") {
    return (
      <Link href="/" className={styles.stacked} aria-label="S Kitchen Diaries home">
        <span className={styles.badgeLarge} aria-hidden="true">
          S
        </span>
        <span className={styles.stackedName}>S Kitchen</span>
        <span className={styles.stackedSub}>DIARIES</span>
      </Link>
    );
  }

  return (
    <Link href="/" className={styles.compact} aria-label="S Kitchen Diaries home">
      <span className={styles.badge} aria-hidden="true">
        S
      </span>
      <span className={styles.name}>
        S Kitchen <em>Diaries</em>
      </span>
    </Link>
  );
}
