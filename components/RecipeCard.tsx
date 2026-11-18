"use client";

import Image from "next/image";
import Link from "next/link";
import type { Recipe } from "@/lib/recipe-types";
import { getDictionary } from "@/lib/dictionaries";
import { localePath } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { LikeHeart } from "./LikeHeart";
import styles from "./RecipeCard.module.css";

type RecipeCardProps = {
  lang: Locale;
  recipe: Recipe;
  size?: "regular" | "champion";
  // only the photo, the name and the badge
  minimal?: boolean;
  // pill-shaped photo
  capsule?: boolean;
  // five little stars under the name, like a rating
  stars?: boolean;
  badge?: { label: string; tone?: "gold" | "silver" | "bronze" | "plain" | "new" };
};

export default function RecipeCard({ lang, recipe, size = "regular", minimal = false, capsule = false, stars = false, badge }: RecipeCardProps) {
  const t = getDictionary(lang);
  const href = localePath(lang, `/recipes/${recipe.slug}`);
  return (
    <article className={`${styles.card} ${size === "champion" ? styles.champion : ""} ${minimal ? styles.minimal : ""} ${capsule ? styles.capsule : ""}`}>
      {!minimal && <LikeHeart recipeId={recipe.id} lang={lang} />}
      <Link href={href} className={`arch ${styles.media}`} aria-label={recipe.title}>
        <Image
          src={recipe.image}
          alt={recipe.alt}
          fill
          sizes="(max-width: 700px) 100vw, 380px"
          className={styles.photo}
        />
        {badge && (
          <span className={`${styles.badge} ${styles[badge.tone ?? "plain"]}`}>{badge.label}</span>
        )}
      </Link>
      <div className={styles.body}>
        {!minimal && (
          <span className={`${styles.tag} ${styles[recipe.category]}`}>
            {t.common[recipe.category]}
          </span>
        )}
        <h3>
          <Link href={href} className={styles.titleLink}>
            {recipe.title}
          </Link>
        </h3>
        {stars && (
          <span className={styles.stars} role="img" aria-label={t.common.stars}>
            {[0, 1, 2, 3, 4].map((n) => (
              <svg key={n} viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path d="m12 2.6 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9z" />
              </svg>
            ))}
          </span>
        )}
        {!minimal && <p className={styles.note}>{recipe.note}</p>}
        {!minimal && (
          <Link href={href} className={styles.tryIt} data-sound="cook">
            {/* the words and the arrow; pointing at the button hides them and shows a whisk in a bowl */}
            <span className={styles.tryLabel}>
              {t.common.tryIt}
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
            <span className={styles.doodle} aria-hidden="true" />
          </Link>
        )}
      </div>
    </article>
  );
}
