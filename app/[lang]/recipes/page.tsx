import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Cooking from "@/components/Cooking";
import FilterIcon from "@/components/FilterIcon";
import GridSwitch from "@/components/GridSwitch";
import RecipeCard from "@/components/RecipeCard";
import { getDictionary } from "@/lib/dictionaries";
import { filterGroups, filterRecipes, selectionFromParams } from "@/lib/filters";
import { isLocale, localePath, plural } from "@/lib/i18n";
import { fill, rich } from "@/lib/rich";
import type { Locale } from "@/lib/i18n";
import type { FilterKey, FilterSelection } from "@/lib/filters";
import { getRecipes } from "@/lib/recipes";
import styles from "./recipes.module.css";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: getDictionary(lang).recipesPage.metaTitle };
}

// the link for an option: pressing the chosen option again clears it, and the
// other groups keep what they have
function hrefFor(lang: Locale, selection: FilterSelection, key: FilterKey, slug: string, q: string) {
  const next: Record<string, string> = { ...selection };
  if (next[key] === slug) delete next[key];
  else next[key] = slug;
  if (q) next.q = q;
  const query = new URLSearchParams(next).toString();
  return localePath(lang, query ? `/recipes?${query}` : "/recipes");
}

// the same filters without the search words
function withoutSearch(lang: Locale, selection: FilterSelection) {
  const query = new URLSearchParams(selection as Record<string, string>).toString();
  return localePath(lang, query ? `/recipes?${query}` : "/recipes");
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

// The filters live in the address, which is only known per visit, so this part
// is rendered inside <Suspense> below.
async function RecipesContent({ lang, searchParams }: { lang: Locale; searchParams: SearchParams }) {
  const t = getDictionary(lang);
  const text = t.recipesPage;
  const params = await searchParams;
  const selection = selectionFromParams(params);
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 80) : "";
  const filtered = Object.keys(selection).length > 0 || q !== "";
  const all = getRecipes(lang);
  const list = filterRecipes(all, selection, q);

  const search = (
    <form className={styles.search} action={localePath(lang, "/recipes")} role="search">
      <svg className={styles.searchIcon} viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4.5 4.5" />
      </svg>
      {/* the chosen filters stay when you search */}
      {Object.entries(selection).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      <input type="search" name="q" defaultValue={q} placeholder={text.placeholder} aria-label={text.searchAria} />
      {q && (
        <Link href={withoutSearch(lang, selection)} className={styles.clear}>
          {text.clear}
        </Link>
      )}
      <button type="submit" className={styles.searchButton}>
        {text.search}
      </button>
    </form>
  );

  return (
    <section className="section">
      <div className={`container ${styles.wide}`}>
        <div className="section-head">
          {/* how many recipes there are (or how many match the filters) */}
          <h1 className={styles.count} aria-live="polite">
            {rich(
              fill(filtered ? text.titleFiltered : text.titleAll, {
                x: list.length,
                n: all.length,
                word: plural(lang, all.length, text.forms),
              }),
            )}
          </h1>
        </div>

        <div className={styles.layout}>
          <nav className={styles.sidebar} aria-label={text.filterAria}>
            <Link href={localePath(lang, "/recipes")} className={`${styles.chip} ${!filtered ? styles.active : ""}`}>
              <FilterIcon name="all" />
              {t.common.allRecipes}
            </Link>

            {filterGroups.map((group) => (
              <div key={group.key} className={styles.group}>
                <h2 className={styles.groupTitle}>{t.filters.groups[group.key]}</h2>
                <div className={styles.options}>
                  {group.options.map((option) => {
                    const on = selection[group.key] === option.slug;
                    return (
                      <Link
                        key={option.slug}
                        href={hrefFor(lang, selection, group.key, option.slug, q)}
                        className={`${styles.chip} ${on ? styles.active : ""}`}
                        aria-current={on ? "true" : undefined}
                      >
                        <FilterIcon name={option.slug} />
                        {t.filters.options[option.slug as keyof typeof t.filters.options]}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className={styles.results}>
            <GridSwitch
              lang={lang}
              toolbar={search}
              empty={
                list.length === 0 ? (
                  <p className={styles.empty}>{text.empty}</p>
                ) : undefined
              }
            >
              {list.map((recipe) => (
                <RecipeCard key={recipe.slug} lang={lang} recipe={recipe} />
              ))}
            </GridSwitch>
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function RecipesPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: SearchParams;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <Suspense fallback={<Cooking lang={lang} />}>
      <RecipesContent lang={lang} searchParams={searchParams} />
    </Suspense>
  );
}
