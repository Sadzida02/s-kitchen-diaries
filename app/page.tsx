import Image from "next/image";
import Link from "next/link";
import CategoryTile from "@/components/CategoryTile";
import RecipeCard from "@/components/RecipeCard";
import { featuredRecipes } from "@/lib/recipes";
import styles from "./page.module.css";

export default function HomePage() {
  const [first, ...rest] = featuredRecipes;

  return (
    <>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroText}>
            <p className="kicker">S Kitchen Diaries</p>
            <h1>Come to the table.</h1>
            <p className={styles.lead}>
              Bosnian roots, a Turkish spoon, an Arabic spice, and a few of my own experiments.
              Sweet, salty, light, and very indulgent, all made to be shared.
            </p>
            <div className={styles.actions}>
              <Link href="/#sweet-or-salty" className="btn btn-primary">
                Come to the table
              </Link>
              <Link href="/about" className="btn btn-outline">
                My story
              </Link>
            </div>
          </div>

          <div className={styles.heroMedia}>
            <div className={`arch ${styles.heroArch}`}>
              <Image
                src="/images/hero-table.jpg"
                alt="A table set with many dishes, bowls, and cutlery, shared by family"
                fill
                priority
                sizes="(max-width: 900px) 100vw, 560px"
                className={styles.heroPhoto}
              />
            </div>
            <div className={styles.heroDot}>
              <Image
                src="/images/sweet-dates.jpg"
                alt="Chocolate dates with pistachio"
                fill
                sizes="180px"
                className={styles.heroPhoto}
              />
            </div>
          </div>
        </div>
      </section>

      <section id="sweet-or-salty" className={`section ${styles.categories}`}>
        <div className="container">
          <div className="section-head">
            <h2>Sweet or salty?</h2>
            <p>Browse the way you eat: start with dessert, or go straight for the main plate.</p>
          </div>
          <div className={styles.categoryGrid}>
            <CategoryTile
              href="/recipes?category=sweet"
              title="Sweet"
              line="Something sweet for the end of the table."
              image="/images/sweet-mini-pavlova.jpg"
              alt="Mini pavlovas topped with cream and berries"
              tone="sweet"
            />
            <CategoryTile
              href="/recipes?category=salty"
              title="Salty"
              line="Something savoury for the middle of it."
              image="/images/salty-pizza.jpg"
              alt="Homemade pizza with fresh toppings"
              tone="salty"
            />
          </div>
        </div>
      </section>

      <section className={styles.quoteBand}>
        <div className={`container ${styles.quoteInner}`}>
          <p className={styles.quote}>
            Food tastes better when it is made with someone in mind.
          </p>
        </div>
      </section>

      <section id="favourites" className="section">
        <div className="container">
          <div className="section-head">
            <p className="kicker">From the kitchen</p>
            <h2>Favourites</h2>
            <p>The bakes and dishes I make again and again.</p>
          </div>
          <div className={styles.favGrid}>
            {first && <RecipeCard recipe={first} size="large" />}
            {rest.map((recipe) => (
              <RecipeCard key={recipe.slug} recipe={recipe} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.aboutTeaser}`}>
          <div className={`arch ${styles.aboutArch}`}>
            <Image
              src="/images/table-spread.jpg"
              alt="A spread of baked goods, dishes, and tea on a table"
              fill
              sizes="(max-width: 900px) 100vw, 480px"
              className={styles.heroPhoto}
            />
          </div>
          <div className={styles.aboutText}>
            <p className="kicker">Hi, I am the one cooking</p>
            <h2>I love cooking, I just do not do it professionally.</h2>
            <p>
              This is a hobby, a creative outlet, and my favourite way to make people around me happy.
              Read my story, and the honest note I keep at the top of it.
            </p>
            <div>
              <Link href="/about" className="btn btn-outline">
                About me
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
