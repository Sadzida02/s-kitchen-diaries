"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import styles from "./TypedQuote.module.css";

// Types the quote out letter by letter the first time it scrolls into view.
export default function TypedQuote({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  const words = text.trim().split(/\s+/);
  const total = words.join(" ").length;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = setInterval(() => {
      setCount((current) => {
        if (current >= total) {
          clearInterval(timer);
          return current;
        }
        return reduced ? total : current + 1;
      });
    }, 55);
    return () => clearInterval(timer);
  }, [started, total]);

  let index = 0;
  return (
    <p ref={ref} className={className} aria-label={text}>
      {words.map((word, w) => (
        <Fragment key={w}>
          <span className={styles.word} aria-hidden="true">
            {word.split("").map((char) => {
              const i = index++;
              return (
                <span key={i} className={i < count ? styles.shown : styles.hidden}>
                  {i === count && <span className={styles.caret} />}
                  {char}
                </span>
              );
            })}
          </span>
          {w < words.length - 1 && (
            <span className={index++ < count ? styles.shown : styles.hidden} aria-hidden="true">
              {" "}
            </span>
          )}
        </Fragment>
      ))}
      {count >= total && <span className={styles.endCaret} aria-hidden="true" />}
    </p>
  );
}
