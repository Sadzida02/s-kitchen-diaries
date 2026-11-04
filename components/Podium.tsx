"use client";

import { useEffect, useRef, useState } from "react";
import RecipeCard from "./RecipeCard";
import { fireConfetti } from "@/lib/confetti";
import type { Recipe } from "@/lib/recipe-types";
import styles from "./Podium.module.css";

const places = [
  { label: "1st place", tone: "gold" },
  { label: "2nd place", tone: "silver" },
  { label: "3rd place", tone: "bronze" },
  { label: "4th place", tone: "plain" },
  { label: "5th place", tone: "plain" },
] as const;

// The first recipe wins; the order of `recipes` is the order of the podium.
// When it scrolls into view the steps rise and confetti goes off.
export default function Podium({ recipes }: { recipes: Recipe[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          fireConfetti();
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -30% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`${styles.podium} ${seen ? styles.seen : ""}`}>
      {recipes.slice(0, 5).map((recipe, index) => {
        const place = places[index];
        return (
          <div key={recipe.slug} className={`${styles.item} ${styles[`place${index + 1}`]}`}>
            <div className={styles.card}>
              <RecipeCard
                recipe={recipe}
                size={index === 0 ? "champion" : "regular"}
                minimal
                capsule
                stars
              />
            </div>
            <div className={`${styles.step} ${styles[place.tone]}`} aria-hidden="true">
              <span>{index + 1}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
