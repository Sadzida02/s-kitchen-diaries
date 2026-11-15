import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/lib/dictionaries";
import { localePath } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import type { Recipe } from "@/lib/recipe-types";
import styles from "./SpoonCard.module.css";

type SpoonCardProps = {
  lang: Locale;
  recipe: Recipe;
  // which end the bowl (the photo) is on
  side: "left" | "right";
  // small line above the description, e.g. "Added 4 Nov"
  label?: string;
  // a small "New" sticker on the bowl
  fresh?: boolean;
};

// A recipe drawn as a white spoon lying on its side: the photo in the bowl, the
// name and an arrow along the handle, and the date curved around the bowl. The whole
// spoon is a link to the recipe and grows a little when you point at it.
export default function SpoonCard({ lang, recipe, side, label, fresh }: SpoonCardProps) {
  const t = getDictionary(lang);
  const href = localePath(lang, `/recipes/${recipe.slug}`);
  return (
    <article className={`${styles.item} ${side === "right" ? styles.right : ""}`}>
      <Link href={href} className={styles.spoon} aria-label={recipe.title}>
        {/* the silhouette: an oval bowl, a narrow neck and a handle that widens to a round end */}
        <svg className={styles.shape} viewBox="0 0 660 220" aria-hidden="true">
          <ellipse cx="135" cy="110" rx="135" ry="110" />
          <path d="M 252 70 C 268 90 276 96 300 96 L 635 81 A 29 29 0 0 1 635 139 L 300 124 C 276 124 268 130 252 150 Z" />
        </svg>
        <span className={styles.bowl}>
          <Image
            src={recipe.image}
            alt={recipe.alt}
            fill
            sizes="(max-width: 700px) 70vw, 260px"
            className={styles.photo}
          />
        </span>
        <span className={styles.name}>
          {recipe.title}
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
        {fresh && <span className={styles.sticker}>{t.home.latest.new}</span>}
        {/* The date curves around the bowl, outside its white rim. Phones show the spoon
            unmirrored, so there the date must sit on the left like the bowl does. */}
        {label && (
          <svg className={styles.date} viewBox="0 0 660 220" aria-label={label} role="img">
            <defs>
              <path id={`date-l-${recipe.slug}`} d="M -22 110 A 157 126 0 0 1 292 110" />
              <path id={`date-r-${recipe.slug}`} d="M 368 110 A 157 126 0 0 1 682 110" />
            </defs>
            <text className={styles.dateLeft}>
              <textPath href={`#date-l-${recipe.slug}`} startOffset="50%" textAnchor="middle">
                {label}
              </textPath>
            </text>
            <text className={styles.dateRight}>
              <textPath href={`#date-r-${recipe.slug}`} startOffset="50%" textAnchor="middle">
                {label}
              </textPath>
            </text>
          </svg>
        )}
      </Link>

      {/* what the dish is, beside the handle */}
      <Link href={href} className={styles.info} tabIndex={-1} aria-hidden="true">
        <span className={styles.chips}>
          <span className={`${styles.chip} ${recipe.category === "sweet" ? styles.sweet : styles.salty}`}>
            {t.common[recipe.category]}
          </span>
          {recipe.difficulty && <span className={styles.chip}>{t.difficulty[recipe.difficulty]}</span>}
        </span>
        {recipe.note && <span className={styles.note}>{recipe.note}</span>}
      </Link>
    </article>
  );
}
