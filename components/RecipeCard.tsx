import Image from "next/image";
import type { Recipe } from "@/lib/recipes";
import styles from "./RecipeCard.module.css";

type RecipeCardProps = {
  recipe: Recipe;
  size?: "regular" | "champion";
  // only the photo, the name and the badge
  minimal?: boolean;
  badge?: { label: string; tone?: "gold" | "silver" | "bronze" | "plain" | "new" };
};

const categoryLabel = {
  sweet: "Sweet",
  salty: "Salty",
} as const;

export default function RecipeCard({ recipe, size = "regular", minimal = false, badge }: RecipeCardProps) {
  return (
    <article className={`${styles.card} ${size === "champion" ? styles.champion : ""} ${minimal ? styles.minimal : ""}`}>
      <div className={`arch ${styles.media}`}>
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
      </div>
      <div className={styles.body}>
        {!minimal && (
          <span className={`${styles.tag} ${styles[recipe.category]}`}>
            {categoryLabel[recipe.category]}
          </span>
        )}
        <h3>{recipe.title}</h3>
        {!minimal && <p className={styles.note}>{recipe.note}</p>}
      </div>
    </article>
  );
}
