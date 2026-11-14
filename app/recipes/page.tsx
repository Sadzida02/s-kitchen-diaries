import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import FilterIcon from "@/components/FilterIcon";
import GridSwitch from "@/components/GridSwitch";
import RecipeCard from "@/components/RecipeCard";
import { filterGroups, filterRecipes, selectionFromParams } from "@/lib/filters";
import type { FilterKey, FilterSelection } from "@/lib/filters";
import { getRecipes } from "@/lib/recipes";
import styles from "./recipes.module.css";

export const metadata: Metadata = {
  title: "Recipes",
};

// the link for an option: pressing the chosen option again clears it, and the
// other groups keep what they have
function hrefFor(selection: FilterSelection, key: FilterKey, slug: string, q: string) {
  const next: Record<string, string> = { ...selection };
  if (next[key] === slug) delete next[key];
  else next[key] = slug;
  if (q) next.q = q;
  const query = new URLSearchParams(next).toString();
  return query ? `/recipes?${query}` : "/recipes";
}

// the same filters without the search words
function withoutSearch(selection: FilterSelection) {
  const query = new URLSearchParams(selection as Record<string, string>).toString();
  return query ? `/recipes?${query}` : "/recipes";
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

// The filters live in the address, which is only known per visit, so this part
// is rendered inside <Suspense> below.
async function RecipesContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const selection = selectionFromParams(params);
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 80) : "";
  const filtered = Object.keys(selection).length > 0 || q !== "";
  const all = getRecipes();
  const list = filterRecipes(all, selection, q);

  const search = (
    <form className={styles.search} action="/recipes" role="search">
      <svg className={styles.searchIcon} viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4.5 4.5" />
      </svg>
      {/* the chosen filters stay when you search */}
      {Object.entries(selection).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      <input type="search" name="q" defaultValue={q} placeholder="Search by keywords, e.g. chocolate, soup, Bosnian" aria-label="Search recipes" />
      {q && (
        <Link href={withoutSearch(selection)} className={styles.clear}>
          Clear
        </Link>
      )}
      <button type="submit" className={styles.searchButton}>
        Search
      </button>
    </form>
  );

  return (
    <section className="section">
      <div className={`container ${styles.wide}`}>
        <div className="section-head">
          <p className="kicker">From the kitchen</p>
          <h1>{filtered ? "Recipes" : "All recipes"}</h1>
          <p className={styles.count} aria-live="polite">
            {filtered ? (
              <>
                Showing <strong>{list.length}</strong> of <strong>{all.length}</strong> recipes
              </>
            ) : (
              <>
                <strong>{all.length}</strong> recipes, everything I have cooked and baked.
              </>
            )}
          </p>
        </div>

        <div className={styles.layout}>
          <nav className={styles.sidebar} aria-label="Filter recipes">
            <Link href="/recipes" className={`${styles.chip} ${!filtered ? styles.active : ""}`}>
              <FilterIcon name="all" />
              All recipes
            </Link>

            {filterGroups.map((group) => (
              <div key={group.key} className={styles.group}>
                <h2 className={styles.groupTitle}>{group.title}</h2>
                <div className={styles.options}>
                  {group.options.map((option) => {
                    const on = selection[group.key] === option.slug;
                    return (
                      <Link
                        key={option.slug}
                        href={hrefFor(selection, group.key, option.slug, q)}
                        className={`${styles.chip} ${on ? styles.active : ""}`}
                        aria-current={on ? "true" : undefined}
                      >
                        <FilterIcon name={option.slug} />
                        {option.title}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className={styles.results}>
            <GridSwitch
              toolbar={search}
              empty={
                list.length === 0 ? (
                  <p className={styles.empty}>Nothing matches these filters yet. Try removing one.</p>
                ) : undefined
              }
            >
              {list.map((recipe) => (
                <RecipeCard key={recipe.slug} recipe={recipe} />
              ))}
            </GridSwitch>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function RecipesPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<section className="section" aria-busy="true" />}>
      <RecipesContent searchParams={searchParams} />
    </Suspense>
  );
}
