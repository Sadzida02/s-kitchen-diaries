import Link from "next/link";
import CategoryRing from "@/components/CategoryRing";
import DishViewer from "@/components/DishViewer";
import HeroCollage from "@/components/HeroCollage";
import RecipeCard from "@/components/RecipeCard";
import Podium from "@/components/Podium";
import TypedQuote from "@/components/TypedQuote";
import { featuredRecipes, latestRecipes } from "@/lib/recipes";
import styles from "./page.module.css";

const iftarDishes = [
  { name: "Sultan kebab", areas: [{ left: 6, top: 36, width: 54, height: 28 }] },
  { name: "Barbie salad", areas: [{ left: 64, top: 66, width: 32, height: 21 }] },
  { name: "Falafel and potatoes", areas: [{ left: 25, top: 10, width: 40, height: 18 }] },
  {
    name: "Chicken veggie soup",
    areas: [
      { left: 4, top: 62, width: 48, height: 29 },
      { left: 0, top: 19, width: 30, height: 17 },
      { left: 69, top: 21, width: 31, height: 18 },
      { left: 84, top: 70, width: 16, height: 8 },
    ],
  },
];

export default function HomePage() {
  return (
    <>
      <section id="home" className={styles.hero}>
        <HeroCollage>
        <div className={styles.heroText}>
          <p className="kicker">Sweet & Salty Diaries</p>
          <h1>Come to get inspired.</h1>
          <p className={styles.lead}>
            Lots of experimenting, inventing and playing with ingredients in my kitchen.
            Sweet, salty, light, and  indulgent, all made to be shared...
          </p>
          <div className={styles.actions}>
            <Link href="/#sweet-or-salty" className="btn btn-primary">
              Come to the table
            </Link>
            <Link href="/about" className={`btn btn-outline ${styles.ghost}`}>
              My story
            </Link>
          </div>
        </div>
        </HeroCollage>
      </section>

      <section id="sweet-or-salty" className={`section ${styles.categories}`}>
        <div className="container">
          <CategoryRing />
        </div>
      </section>

      <section className={styles.quoteBand}>
        <div className={`container ${styles.quoteInner}`}>
          <span className={`${styles.mark} ${styles.markOpen}`} aria-hidden="true">
            &ldquo;
          </span>
          <span className={`${styles.mark} ${styles.markClose}`} aria-hidden="true">
            &rdquo;
          </span>
          <p className={styles.motto}>Motivation</p>
          <TypedQuote
            className={styles.quote}
            text="Bringing positivity to the world thrugh delicious bites."
          />
        </div>
      </section>

      <section id="favourites" className="section">
        <div className="container">
          <div className="section-head">
            <p className="kicker">From the kitchen</p>
            <h2>Favourites</h2>
            <p>The bakes and dishes I make again and again.</p>
          </div>
          <Podium recipes={featuredRecipes} />
        </div>
      </section>

      <section id="latest" className="section">
        <div className="container">
          <div className="section-head">
            <p className="kicker">Fresh from the kitchen</p>
            <h2>Latest additions</h2>
            <p>The newest recipes on the table.</p>
          </div>
          <div className={styles.latestGrid}>
            {latestRecipes.map((recipe) => (
              <RecipeCard key={recipe.slug} recipe={recipe} badge={{ label: "New", tone: "new" }} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <DishViewer
          src="/images/salty-iftar.jpg"
          alt="An iftar table with sultan kebab, a pink salad, falafel with potatoes and chicken veggie soup"
          dishes={iftarDishes}
          reverse
        >
          <p className="kicker">Hi, I am Sadzida</p>
          <h2>I love cooking, in free and busy times.</h2>
          <p className={styles.aboutCopy}>
            This is my hobby, a creative outlet, and my favourite way to make people around me happy.
            I am far from a professional, but someone who has an eye for tastes and pretty plates. Hope you like my ideas...
          </p>
          <div>
            <Link href="/about" className="btn btn-outline">
              About me
            </Link>
          </div>
        </DishViewer>
      </section>
    </>
  );
}
