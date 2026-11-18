import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PhotoStack from "@/components/PhotoStack";
import RecipeCard from "@/components/RecipeCard";
import { getDictionary } from "@/lib/dictionaries";
import { LOCALES, isLocale, localePath, plural } from "@/lib/i18n";
import { getRecipe, getRecipes, getRelated } from "@/lib/recipes";
import styles from "./recipe.module.css";

// every recipe file becomes its own page when the site is built
export async function generateStaticParams() {
  const recipes = await getRecipes();
  return LOCALES.flatMap((lang) => recipes.map((recipe) => ({ lang, slug: recipe.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const recipe = await getRecipe(slug, lang);
  if (!recipe) return {};
  return {
    title: recipe.title,
    description: recipe.note,
    openGraph: { title: recipe.title, description: recipe.note, images: [recipe.image] },
  };
}

// a list that is just called "Ingredients" or "Steps" needs no extra title of its own
const showTitle = (title: string, kind: "ingredients" | "steps") =>
  !(kind === "ingredients"
    ? /^(ingredients?|sastojci)$/i
    : /^(steps?|method|instructions?|directions?|koraci|priprema|upute)$/i
  ).test(title.trim());

// which filter on the recipes page each tag opens (its name is in the dictionary)
const tagHref: Record<string, string> = {
  healthy: "/recipes?style=healthy",
  nosugar: "/recipes?style=nosugar",
  guilty: "/recipes?style=guilty",
  breakfast: "/recipes?meal=breakfast",
  lunch: "/recipes?meal=lunch",
  desserts: "/recipes?meal=desserts",
  traditional: "/recipes?origin=traditional",
  bosnian: "/recipes?origin=traditional",
  arabic: "/recipes?origin=middleeast",
  turkish: "/recipes?origin=middleeast",
  asian: "/recipes?origin=asian",
};

const levels = { easy: 1, medium: 2, hard: 3 } as const;

export default async function RecipePage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const recipe = await getRecipe(slug, lang);
  if (!recipe) notFound();
  const t = getDictionary(lang);
  const text = t.recipe;
  const to = (path: string) => localePath(lang, path);

  const related = await getRelated(recipe, 4, lang);
  const hasRecipe = recipe.ingredients.length > 0 || recipe.steps.length > 0;

  return (
    <article className="section">
      <div className="container">
        <Link href={to("/recipes")} className={styles.back}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
          {text.back}
        </Link>

        <div className={styles.top}>
          <div className={styles.intro}>
            <div className={styles.chips}>
              <span className={`${styles.chip} ${recipe.category === "sweet" ? styles.sweet : styles.salty}`}>
                {t.common[recipe.category]}
              </span>
              {recipe.difficulty && (
                <span className={styles.chip} aria-label={`${text.difficultyAria} ${t.difficulty[recipe.difficulty]}`}>
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
                  {t.difficulty[recipe.difficulty]}
                </span>
              )}
            </div>
            <h1>{recipe.title}</h1>
            {recipe.note && <p className={styles.lead}>{recipe.note}</p>}

            {recipe.tags.length > 0 && (
              <ul className={styles.tags} aria-label="Tags">
                {recipe.tags.map((tag) => (
                  <li key={tag}>
                    <Link href={to(tagHref[tag] ?? "/recipes")}>#{t.tags[tag] ?? tag}</Link>
                  </li>
                ))}
              </ul>
            )}

            {hasRecipe && (
              <ul className={styles.facts}>
                {recipe.ingredients.length > 0 && (
                  <li>
                    <strong>{recipe.ingredients.length}</strong> {plural(lang, recipe.ingredients.length, text.facts.ingredients)}
                  </li>
                )}
                {recipe.steps.length > 0 && (
                  <li>
                    <strong>{recipe.steps.length}</strong> {plural(lang, recipe.steps.length, text.facts.steps)}
                  </li>
                )}
                {recipe.gallery.length > 0 && (
                  <li>
                    <strong>{recipe.gallery.length + 1}</strong> {plural(lang, recipe.gallery.length + 1, text.facts.photos)}
                  </li>
                )}
              </ul>
            )}

            {hasRecipe && (
              <a href="#recipe" className={styles.jump}>
                {text.jump}
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 5v14M6 13l6 6 6-6" />
                </svg>
              </a>
            )}
          </div>

          <div className={styles.stage}>
            <PhotoStack
              lang={lang}
              photos={[recipe.image, ...recipe.gallery].map((src, index) => ({
                src,
                alt: index === 0 ? recipe.alt : `${recipe.title}, ${text.photoAlt} ${index + 1}`,
              }))}
            />
          </div>
        </div>

        {hasRecipe ? (
          <div id="recipe" className={styles.details}>
            {recipe.ingredientGroups.length > 0 && (
              <section className={styles.ingredients}>
                <h2>{text.ingredients}</h2>
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
                <h2>{text.steps}</h2>
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
          <p className={styles.soon}>{text.soon}</p>
        )}

        {related.length > 0 && (
          <section className={styles.related}>
            <h2>{text.related}</h2>
            <div className={styles.relatedGrid}>
              {related.map((item) => (
                <RecipeCard key={item.slug} lang={lang} recipe={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
