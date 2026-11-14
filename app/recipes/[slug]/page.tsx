import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PhotoStack from "@/components/PhotoStack";
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
// a list that is just called "Ingredients" or "Steps" needs no extra title of its own
const showTitle = (title: string, kind: "ingredients" | "steps") =>
  !(kind === "ingredients" ? /^ingredients?$/i : /^(steps?|method|instructions?|directions?)$/i).test(title.trim());

// how each tag is written, and which filter on the recipes page it opens
const tagInfo: Record<string, { label: string; href: string }> = {
  healthy: { label: "Healthy", href: "/recipes?style=healthy" },
  nosugar: { label: "No sugar", href: "/recipes?style=nosugar" },
  guilty: { label: "Guilty pleasure", href: "/recipes?style=guilty" },
  breakfast: { label: "Breakfast", href: "/recipes?meal=breakfast" },
  lunch: { label: "Lunch", href: "/recipes?meal=lunch" },
  desserts: { label: "Dessert", href: "/recipes?meal=desserts" },
  traditional: { label: "Traditional", href: "/recipes?origin=traditional" },
  bosnian: { label: "Bosnian", href: "/recipes?origin=traditional" },
  arabic: { label: "Arabic", href: "/recipes?origin=middleeast" },
  turkish: { label: "Turkish", href: "/recipes?origin=middleeast" },
  asian: { label: "Asian", href: "/recipes?origin=asian" },
};

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

            {recipe.tags.length > 0 && (
              <ul className={styles.tags} aria-label="Tags">
                {recipe.tags.map((tag) => (
                  <li key={tag}>
                    <Link href={tagInfo[tag]?.href ?? "/recipes"}>#{tagInfo[tag]?.label ?? tag}</Link>
                  </li>
                ))}
              </ul>
            )}

            {hasRecipe && (
              <ul className={styles.facts}>
                {recipe.ingredients.length > 0 && (
                  <li>
                    <strong>{recipe.ingredients.length}</strong> ingredients
                  </li>
                )}
                {recipe.steps.length > 0 && (
                  <li>
                    <strong>{recipe.steps.length}</strong> steps
                  </li>
                )}
                {recipe.gallery.length > 0 && (
                  <li>
                    <strong>{recipe.gallery.length + 1}</strong> photos
                  </li>
                )}
              </ul>
            )}

            {hasRecipe && (
              <a href="#recipe" className={styles.jump}>
                Jump to the recipe
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 5v14M6 13l6 6 6-6" />
                </svg>
              </a>
            )}
          </div>

          <div className={styles.stage}>
            <PhotoStack
              photos={[recipe.image, ...recipe.gallery].map((src, index) => ({
                src,
                alt: index === 0 ? recipe.alt : `${recipe.title}, photo ${index + 1}`,
              }))}
            />
          </div>
        </div>

        {hasRecipe ? (
          <div id="recipe" className={styles.details}>
            {recipe.ingredientGroups.length > 0 && (
              <section className={styles.ingredients}>
                <h2>Ingredients</h2>
                {recipe.ingredientGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className={styles.group}>
                    {showTitle(group.title, "ingredients") && <h3>{group.title}</h3>}
                    <ul>
                      {group.items.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>
            )}
            {recipe.stepGroups.length > 0 && (
              <section className={styles.steps}>
                <h2>Steps</h2>
                {recipe.stepGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className={styles.group}>
                    {showTitle(group.title, "steps") && <h3>{group.title}</h3>}
                    <ol>
                      {group.items.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>
                ))}
              </section>
            )}
          </div>
        ) : (
          <p className={styles.soon}>The full recipe is on its way. Come back soon!</p>
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
