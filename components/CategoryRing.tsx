"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { categories } from "@/lib/filters";
import styles from "./CategoryRing.module.css";

// A big wheel of category circles that rises out of the bottom-left corner, so
// only a quarter of it shows. Pressing a circle turns the wheel until that
// circle is the one in the middle of the quarter; pressing the middle one opens
// its recipes. Scrolling the page also spins the wheel, one full turn over the
// height of the wheel. On phones it is a plain grid of links instead.
export default function CategoryRing() {
  const count = categories.length;
  // counts every step the wheel has turned, so it always takes the short way
  const [turn, setTurn] = useState(0);
  // how many whole steps the scroll has spun it, to know which circle is in the middle
  const [spinSteps, setSpinSteps] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const active = (((turn + spinSteps) % count) + count) % count;
  const current = categories[active];

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
          <span>Sweet or</span> <span>salty?</span>
        </h2>
        <p>Pick a circle and see what is cooking.</p>
        <Link href={`/recipes?category=${current.slug}`} className={`btn btn-outline ${styles.cta}`}>
          See {current.title} recipes
        </Link>
      </div>

      <div className={styles.wheel}>
        <div className={styles.spin}>
        {categories.map((category, index) => (
          <div key={category.slug} className={styles.slot} style={{ ["--i" as string]: index }}>
            <Link
              href={`/recipes?category=${category.slug}`}
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
                      sizes="280px"
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
