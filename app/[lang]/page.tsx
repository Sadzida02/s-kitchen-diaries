import Link from "next/link";
import { notFound } from "next/navigation";
import CategoryRing from "@/components/CategoryRing";
import FilterIcon from "@/components/FilterIcon";
import DishViewer from "@/components/DishViewer";
import SpoonCard from "@/components/SpoonCard";
import SharedMeals from "@/components/SharedMeals";
import SpiceShelf from "@/components/SpiceShelf";
import Podium from "@/components/Podium";
import TypedQuote from "@/components/TypedQuote";
import { getDictionary } from "@/lib/dictionaries";
import { categories } from "@/lib/filters";
import { isLocale, localePath } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { getFeatured, getLatest } from "@/lib/recipes";
import styles from "./page.module.css";

// where each dish is on the photo (the names come from the dictionary, in the same order)
const iftarAreas = [
  [{ left: 6, top: 36, width: 54, height: 28 }],
  [{ left: 64, top: 66, width: 32, height: 21 }],
  [{ left: 25, top: 10, width: 40, height: 18 }],
  [
    { left: 4, top: 62, width: 48, height: 29 },
    { left: 0, top: 19, width: 30, height: 17 },
    { left: 69, top: 21, width: 31, height: 18 },
    { left: 84, top: 70, width: 16, height: 8 },
  ],
];

// "2026-10-28" -> "28 Oct" / "28. okt"
function shortDate(iso: string, lang: Locale) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(lang === "bs" ? "bs" : "en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const to = (path: string) => localePath(lang, path);
  const iftarDishes = t.home.dish.dishes.map((name, index) => ({ name, areas: iftarAreas[index] }));

  return (
    <>
      <section id="home" className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div id="sweet-or-salty" className={styles.heroRing}>
            <CategoryRing lang={lang} />
          </div>

          <div className={styles.heroText}>
            {/* the two headings type themselves, the small one first and then the big one */}
            <TypedQuote as="p" className="kicker" text={t.home.heroKicker} />
            <TypedQuote as="h1" delay={1500} text={t.home.heroTitle} />
            <p className={styles.lead}>{t.home.heroLead}</p>
            <div className={styles.actions}>
              <Link href={to("/recipes")} className="btn btn-outline">
                {t.home.browse}
              </Link>
              <Link href={to("/about")} className={`btn btn-outline ${styles.ghost}`}>
                {t.home.story}
              </Link>
            </div>
          </div>

          {/* phones only: simple links instead of the wheel */}
          <nav className={styles.mobileCats} aria-label={t.home.pickerLabel}>
            <h2>{t.home.pickerTitle}</h2>
            <div className={styles.bigPair}>
              <Link href={to("/recipes?category=sweet")} className={styles.pickSweet}>
                <FilterIcon name="sweet" />
                {t.home.sweet}
              </Link>
              <Link href={to("/recipes?category=salty")} className={styles.pickSalty}>
                <FilterIcon name="salty" />
                {t.home.savory}
              </Link>
            </div>
            <p>{t.home.orLook}</p>
            <div className={styles.moreCats}>
              {categories
                .filter((category) => category.slug !== "sweet" && category.slug !== "salty")
                .map((category) => (
                  <Link key={category.slug} href={to(`/recipes?category=${category.slug}`)}>
                    <FilterIcon name={category.slug === "turkish" ? "middleeast" : category.slug} />
                    {t.categories[category.slug as keyof typeof t.categories].title}
                  </Link>
                ))}
            </div>
          </nav>
        </div>
      </section>

      <section id="favourites" className={`section ${styles.favourites}`}>
        <div className="container">
          <div className="section-head">
            <p className="kicker">{t.home.fav.kicker}</p>
            <h2>{t.home.fav.title}</h2>
            <p>{t.home.fav.text}</p>
          </div>
          <Podium lang={lang} recipes={getFeatured(lang)} />
        </div>
      </section>

      <section className={styles.quoteBand}>
        <div className={`container ${styles.quoteInner}`}>
          <p className={styles.motto}>{t.home.quote.motto}</p>
          <TypedQuote className={styles.quote} text={t.home.quote.text} />
        </div>
      </section>

      <section id="latest" className={`section ${styles.latest}`}>
        <div className="container">
          <div className="section-head">
            <p className="kicker">{t.home.latest.kicker}</p>
            <h2>{t.home.latest.title}</h2>
          </div>
          <div className={styles.latestGrid}>
            {getLatest(3, lang).map((recipe, index) => (
              <SpoonCard
                key={recipe.slug}
                lang={lang}
                recipe={recipe}
                side={index % 2 === 0 ? "left" : "right"}
                label={recipe.added ? `${t.home.latest.added} ${shortDate(recipe.added, lang)}` : undefined}
                fresh
              />
            ))}
          </div>
          {/* a single line of kitchen tools, drawn in one stroke, 50px under the spoons */}
          <div className={styles.toolLine} aria-hidden="true" />
        </div>
      </section>

      <section id="shared-meals" className={`section ${styles.factsBand}`}>
        <div className="container">
          <SharedMeals lang={lang} />
        </div>
      </section>

      <section id="spices" className={`section ${styles.spiceBand}`}>
        <div className="container">
          <div className="section-head">
            <p className="kicker">{t.spices.kicker}</p>
            <h2>{t.spices.title}</h2>
          </div>
          <SpiceShelf lang={lang} />
        </div>
      </section>

      <section className={`section ${styles.afterFacts}`}>
        <DishViewer lang={lang} src="/images/salty-iftar.jpg" alt={t.home.dish.alt} dishes={iftarDishes} reverse bubble>
          <p className="kicker">{t.home.dish.kicker}</p>
          <h2>{t.home.dish.title}</h2>
          <p className={styles.aboutCopy}>{t.home.dish.copy}</p>
        </DishViewer>
      </section>
    </>
  );
}
