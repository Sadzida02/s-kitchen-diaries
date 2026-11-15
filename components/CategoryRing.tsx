"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { categories } from "@/lib/filters";
import { fill } from "@/lib/rich";
import { getDictionary } from "@/lib/dictionaries";
import { localePath } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import styles from "./CategoryRing.module.css";

// A big wheel of category circles that rises out of the bottom-left corner, so
// only a quarter of it shows. Pressing a circle turns the wheel until that
// circle is the one in the middle of the quarter; pressing the middle one opens
// its recipes. Scrolling the page also spins the wheel, one full turn over the
// height of the wheel. On phones it is a plain grid of links instead.
export default function CategoryRing({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  const link = (path: string) => localePath(lang, path);
  // the circles, with their names, lines and photo descriptions in the current language
  const items = categories.map((category) => ({
    ...category,
    ...t.categories[category.slug as keyof typeof t.categories],
  }));
  const count = items.length;
  // counts every step the wheel has turned, so it always takes the short way
  const [turn, setTurn] = useState(0);
  // how many whole steps the scroll has spun it, to know which circle is in the middle
  const [spinSteps, setSpinSteps] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const active = (((turn + spinSteps) % count) + count) % count;
  const current = items[active];

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const still =
        !window.matchMedia("(min-width: 721px)").matches ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const progress = still ? 0 : Math.min(Math.max(window.scrollY / (el.offsetHeight || 600), 0), 1);
      const degrees = progress * 360;
      el.style.setProperty("--spin", `${degrees}deg`);
      setSpinSteps(Math.round(degrees / 45));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  function onPress(event: React.MouseEvent, index: number) {
    if (!window.matchMedia("(min-width: 721px)").matches) return;
    let step = (index - active + count) % count;
    if (step > count / 2) step -= count;
    if (step === 0) return;
    event.preventDefault();
    setTurn(turn + step);
  }

  return (
    <div ref={stageRef} className={styles.stage} style={{ ["--turn" as string]: turn }}>
      <div className={styles.centre}>
        <h2>
          <span>{t.ring.sweetOr}</span> <span>{t.ring.salty}</span>
        </h2>
        <p>{t.ring.pick}</p>
        <Link href={link(`/recipes?category=${current.slug}`)} className={`btn btn-outline ${styles.cta}`}>
          {fill(t.ring.see, { title: current.title })}
        </Link>
      </div>

      <div className={styles.wheel}>
        <div className={styles.spin}>
        {items.map((category, index) => (
          <div key={category.slug} className={styles.slot} style={{ ["--i" as string]: index }}>
            <Link
              href={link(`/recipes?category=${category.slug}`)}
              aria-label={category.title}
              onClick={(event) => onPress(event, index)}
              className={`${styles.tile} ${index % 2 ? styles.gold : styles.lilac} ${index === active ? styles.active : ""}`}
            >
              <span className={styles.upright}>
              <span className={styles.badge}>
                <span className={styles.circle}>
                  <span className={styles.photoWrap}>
                    <Image
                      src={category.image}
                      alt={category.alt}
                      fill
                      sizes="(max-width: 720px) 34vw, min(30vw, 480px)"
                      quality={90}
                      className={styles.photo}
                    />
                  </span>
                </span>
                {/* the name curves around the bottom of the photo */}
                <svg className={styles.label} viewBox="0 0 140 140" aria-hidden="true">
                  <defs>
                    <path id={`arc-${category.slug}`} d="M 70 16 A 54 54 0 0 1 70 124" />
                    <path id={`arc-low-${category.slug}`} d="M 9 70 A 61 61 0 0 0 131 70" />
                  </defs>
                  <text className={styles.labelRight}>
                    <textPath href={`#arc-${category.slug}`} startOffset="50%" textAnchor="middle">
                      {category.title}
                    </textPath>
                  </text>
                  <text className={styles.labelBottom}>
                    <textPath href={`#arc-low-${category.slug}`} startOffset="50%" textAnchor="middle">
                      {category.title}
                    </textPath>
                  </text>
                </svg>
              </span>
              </span>
            </Link>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
