import Logo from "./Logo";
import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <Logo />
        <p className={styles.note}>
          Made with butter, patience, and a lot of tasting along the way.
        </p>
        <p className={styles.copy}>© S Kitchen Diaries</p>
      </div>
    </footer>
  );
}
