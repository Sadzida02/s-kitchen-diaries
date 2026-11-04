import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import RecipeCard from "@/components/RecipeCard";
import { getRecipe, getRecipes, getRelated } from "@/lib/recipes";
import styles from "./recipe.module.css";

// every recipe file becomes its own page when the site is built
export function generateStaticParams() {
  return getRecipes().map((recipe) => ({ slug: recipe.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const recipe = getRecipe(slug);
  if (!recipe) return {};
  return {
    title: recipe.title,
    description: recipe.note,
    openGraph: { title: recipe.title, description: recipe.note, images: [recipe.image] },
  };
}

const tasteLabel = { sweet: "Sweet", salty: "Salty" } as const;
const levels = { easy: 1, medium: 2, hard: 3 } as const;

export default async function RecipePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const recipe = getRecipe(slug);
  if (!recipe) notFound();

  const related = getRelated(recipe);
  const hasRecipe = recipe.ingredients.length > 0 || recipe.steps.length > 0;

  return (
    <article className="section">
      <div className="container">
        <Link href="/recipes" className={styles.back}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
          All recipes
        </Link>

        <div className={styles.top}>
          <div className={styles.intro}>
            <div className={styles.chips}>
              <span className={`${styles.chip} ${recipe.category === "sweet" ? styles.sweet : styles.salty}`}>
                {tasteLabel[recipe.category]}
              </span>
              {recipe.difficulty && (
                <span className={styles.chip} aria-label={`Difficulty: ${recipe.difficulty}`}>
                  <span className={styles.hats} aria-hidden="true">
                    {[1, 2, 3].map((n) => (
                      <svg
                        key={n}
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill={n <= levels[recipe.difficulty!] ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity={n <= levels[recipe.difficulty!] ? 1 : 0.35}
                      >
                        <path d="M7 14a4 4 0 1 1 1.5-7.7A4.5 4.5 0 0 1 15.5 6 4 4 0 1 1 17 14" />
                        <path d="M7 14v6h10v-6" />
                      </svg>
                    ))}
                  </span>
                  {recipe.difficulty}
                </span>
              )}
            </div>
            <h1>{recipe.title}</h1>
            {recipe.note && <p className={styles.lead}>{recipe.note}</p>}
          </div>

          <div className={styles.stage}>
            <div className={styles.photo}>
              <Image
                src={recipe.image}
                alt={recipe.alt}
                fill
                priority
                sizes="(max-width: 900px) 100vw, 560px"
                className={styles.cover}
              />
            </div>
          </div>
        </div>

        {hasRecipe ? (
          <div className={styles.details}>
            {recipe.ingredients.length > 0 && (
              <section className={styles.ingredients}>
                <h2>Ingredients</h2>
                <ul>
                  {recipe.ingredients.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>
            )}
            {recipe.steps.length > 0 && (
              <section className={styles.steps}>
                <h2>Steps</h2>
                <ol>
                  {recipe.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </section>
            )}
          </div>
        ) : (
          <p className={styles.soon}>The full recipe is on its way. Come back soon!</p>
        )}

        {recipe.gallery.length > 0 && (
          <section className={styles.gallerySection}>
            <h2>More photos</h2>
            <div className={styles.gallery}>
              {recipe.gallery.map((src, index) => (
                <div key={src} className={styles.galleryItem}>
                  <Image
                    src={src}
                    alt={`${recipe.title}, photo ${index + 2}`}
                    fill
                    sizes="(max-width: 700px) 50vw, 300px"
                    className={styles.cover}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section className={styles.related}>
            <h2>You might also like</h2>
            <div className={styles.relatedGrid}>
              {related.map((item) => (
                <RecipeCard key={item.slug} recipe={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
