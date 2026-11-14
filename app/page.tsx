import Link from "next/link";
import CategoryRing from "@/components/CategoryRing";
import DishViewer from "@/components/DishViewer";
import SpoonCard from "@/components/SpoonCard";
import SharedMeals from "@/components/SharedMeals";
import Podium from "@/components/Podium";
import TypedQuote from "@/components/TypedQuote";
import { getFeatured, getLatest } from "@/lib/recipes";
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

// "2026-10-28" -> "28 Oct"
function shortDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

export default function HomePage() {
  return (
    <>
      <section id="home" className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div id="sweet-or-salty" className={styles.heroRing}>
            <CategoryRing />
          </div>

          <div className={styles.heroText}>
            <p className="kicker">Hi, I am Sadzida </p>
            <h1>and I love cooking.</h1>
            <p className={styles.lead}>
              Lots of experimenting, inventing and playing with ingredients in my kitchen.
              Sweet, salty, light, and  indulgent, all made to be shared...
            </p>
            <div className={styles.actions}>
              <Link href="/recipes" className="btn btn-outline">
                Browse all recipes
              </Link>
              <Link href="/about" className={`btn btn-outline ${styles.ghost}`}>
                My story
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="favourites" className="section">
        <div className="container">
          <div className="section-head">
            <p className="kicker">From the kitchen</p>
            <h2>Favourites</h2>
            <p>The bakes and dishes I make again and again.</p>
          </div>
          <Podium recipes={getFeatured()} />
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
            text="Bringing positivity to the world through delicious bites."
          />
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
            {getLatest(3).map((recipe, index) => (
              <SpoonCard
                key={recipe.slug}
                recipe={recipe}
                side={index % 2 === 0 ? "left" : "right"}
                label={recipe.added ? `Added ${shortDate(recipe.added)}` : undefined}
              />
            ))}
          </div>
        </div>
      </section>

      <section id="shared-meals" className={`section ${styles.factsBand}`}>
        <div className="container">
          <div className="section-head">
            <p className="kicker">Food tastes better together</p>
            <h2>Shared meals by the numbers</h2>
            <p>Hover over a card to see what eating together does for us.</p>
          </div>
          <SharedMeals />
        </div>
      </section>

      <section className={`section ${styles.afterFacts}`}>
        <DishViewer
          src="/images/salty-iftar.jpg"
          alt="An iftar table with sultan kebab, a pink salad, falafel with potatoes and chicken veggie soup"
          dishes={iftarDishes}
          reverse
          bubble
        >
          <p className="kicker">Whether it is gathering or just me</p>
          <h2>I enjoy in preparation.</h2>
          <p className={styles.aboutCopy}>
            This is my hobby, a creative outlet, and my favourite way to make people around me happy.
            I am far from a professional, but someone who has an eye for tastes and pretty plates. Hope you like my ideas...
          </p>
        </DishViewer>
      </section>
    </>
  );
}
