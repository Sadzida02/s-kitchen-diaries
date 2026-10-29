import Image from "next/image";
import type { Recipe } from "@/lib/recipes";
import styles from "./RecipeCard.module.css";

type RecipeCardProps = {
  recipe: Recipe;
  size?: "regular" | "large";
};

const categoryLabel = {
  sweet: "Sweet",
  salty: "Salty",
} as const;

export default function RecipeCard({ recipe, size = "regular" }: RecipeCardProps) {
  return (
    <article className={`${styles.card} ${size === "large" ? styles.large : ""}`}>
      <div className={`arch ${styles.media}`}>
        <Image
          src={recipe.image}
          alt={recipe.alt}
          fill
          sizes="(max-width: 700px) 100vw, 380px"
          className={styles.photo}
        />
      </div>
      <div className={styles.body}>
        <span className={`${styles.tag} ${styles[recipe.category]}`}>
          {categoryLabel[recipe.category]}
        </span>
        <h3>{recipe.title}</h3>
        <p className={styles.note}>{recipe.note}</p>
      </div>
    </article>
  );
}
