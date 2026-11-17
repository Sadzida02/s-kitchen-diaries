"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { rich } from "@/lib/rich";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";
import styles from "./SharedMeals.module.css";

// the numbers; the words under them are in the dictionary
const STATS = [
  { to: 16.1, decimals: 1 },
  { to: 24, decimals: 0 },
  { to: 20, decimals: 0 },
];

// counts from 0 up to the number the first time it is on screen
function CountUp({ to, decimals = 0, comma = false }: { to: number; decimals?: number; comma?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(to);

  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / 1600, 1);
          setValue(to * (1 - Math.pow(1 - t, 3)));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [to]);

  const shown = value.toFixed(decimals);
  return <span ref={ref}>{comma ? shown.replace(".", ",") : shown}%</span>;
}

// One thought about eating together, with the numbers behind it, as wide as the navbar.
function Together({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  const words = t.sharedMeals;
  return (
    <div className={styles.together}>
      <span className={styles.heart} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20.500s-8-4.800-8-10.500A4.500 4.500 0 0 1 12 7.300 4.500 4.500 0 0 1 20 10c0 5.700-8 10.500-8 10.500z" />
        </svg>
      </span>
      <p className={styles.statement}>
        {rich(words.statement)}
      </p>
      <a
        className={styles.statementSource}
        href="https://www.nationalgeographic.com/health/article/communal-dining-loneliness-epidemic"
        target="_blank"
        rel="noopener noreferrer"
      >
        {words.source}
      </a>

      <ul className={styles.stats}>
        {STATS.map((stat, index) => (
          <li key={stat.to}>
            <p className={styles.statNumber}>
              <CountUp to={stat.to} decimals={stat.decimals} comma={lang === "bs"} />
            </p>
            <p className={styles.statCaption}>{words.stats[index].caption}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Pointing at the word makes the plus disappear and the two halves come together
// as "companion". Touch screens have no hover, so there a tap does the same.
function Companion({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  const word = t.sharedMeals.word;
  const [joined, setJoined] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  // On phones and tablets nobody can hover, so while the word is on screen it joins and splits again by itself.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const touchy = window.matchMedia("(hover: none), (max-width: 1099px)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!touchy || reduced) return;
    let start: ReturnType<typeof setTimeout> | undefined;
    let loop: ReturnType<typeof setInterval> | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        clearTimeout(start);
        clearInterval(loop);
        if (entry.isIntersecting) {
          start = setTimeout(() => {
            setJoined(true);
            loop = setInterval(() => setJoined((value) => !value), 2800);
          }, 1200);
        } else {
          setJoined(false);
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      clearTimeout(start);
      clearInterval(loop);
    };
  }, []);

  return (
    <div ref={box} className={styles.word}>
      <Image
        src="/images/seeded-loaf.webp"
        alt={word.loafAlt}
        width={1000}
        height={925}
        sizes="(max-width: 1000px) 260px, 340px"
        className={styles.loaf}
      />
      <div className={styles.wordBody}>
        <p className={styles.wordKicker}>{word.kicker}</p>
        <button
          type="button"
          className={`${styles.mix} ${joined ? styles.joined : ""}`}
          aria-label={word.aria}
          onClick={(event) => {
            // A mouse already joins the word by hovering. A finger (or the keyboard) has no
            // hover, so there a tap switches it on and off.
            const pointer = (event.nativeEvent as PointerEvent).pointerType;
            if (pointer !== "mouse") setJoined((value) => !value);
          }}
        >
          <span className={styles.half}>com</span>
          <span className={styles.plus} aria-hidden="true">+</span>
          <span className={styles.half}>panis</span>
          <span className={styles.whole} aria-hidden="true">{word.joined}</span>
        </button>
        <p className={styles.wordText}>{rich(word.text)}</p>
      </div>
    </div>
  );
}

export default function SharedMeals({ lang }: { lang: Locale }) {
  return (
    <>
      <Together lang={lang} />
      <Companion lang={lang} />
    </>
  );
}
