import type { Metadata } from "next";
import Link from "next/link";
import RecipeCard from "@/components/RecipeCard";
import { categories, recipesFor } from "@/lib/recipes";
import styles from "./recipes.module.css";

export const metadata: Metadata = {
  title: "Recipes",
};

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { category } = await searchParams;
  const active = typeof category === "string" ? category : undefined;
  const current = categories.find((item) => item.slug === active);
  const list = recipesFor(current?.slug);

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <p className="kicker">From the kitchen</p>
          <h1>{current ? current.title : "All recipes"}</h1>
          <p>{current ? current.line : "Everything I have cooked and baked, ready to browse."}</p>
        </div>

        <nav className={styles.filters} aria-label="Filter recipes">
          <Link href="/recipes" className={`${styles.chip} ${!current ? styles.active : ""}`}>
            All
          </Link>
          {categories.map((item) => (
            <Link
              key={item.slug}
              href={`/recipes?category=${item.slug}`}
              className={`${styles.chip} ${current?.slug === item.slug ? styles.active : ""}`}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        {list.length > 0 ? (
          <div className={styles.grid}>
            {list.map((recipe) => (
              <RecipeCard key={recipe.slug} recipe={recipe} />
            ))}
          </div>
        ) : (
          <p className={styles.empty}>Nothing here yet. New recipes are on the way.</p>
        )}
      </div>
    </section>
  );
}
