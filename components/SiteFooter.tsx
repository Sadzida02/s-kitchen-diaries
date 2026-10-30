import FooterChef from "./FooterChef";
import Logo from "./Logo";
import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <FooterChef>
        <div className={`container ${styles.inner}`}>
          <Logo />
          <p className={styles.note}>
            Made with trials, worries, patience, and a lot of love along the way.
          </p>
          <p className={styles.copy}>©2026 Sweet & Salty Diaries by Sadžida Valjevac</p>
        </div>
      </FooterChef>
    </footer>
  );
}
