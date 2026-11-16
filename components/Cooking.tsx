import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";
import WhiskIcon from "./WhiskIcon";
import styles from "./Cooking.module.css";

// What shows while a page is loading: a whisk stirring and the words "Wait, something is cooking".
export default function Cooking({ lang }: { lang: Locale }) {
  const text = getDictionary(lang).common.loading;
  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <span className={styles.stage} aria-hidden="true">
        <i className={styles.steam} />
        <i className={styles.steam} />
        <i className={styles.steam} />
        <WhiskIcon className={styles.whisk} />
        <span className={styles.bowl} />
      </span>
      <p className={styles.text}>{text}</p>
    </div>
  );
}
