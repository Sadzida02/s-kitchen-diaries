"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import styles from "./TypedQuote.module.css";

// Types the quote out letter by letter the first time it scrolls into view.
export default function TypedQuote({
  text,
  className,
  as: Tag = "p",
  delay = 0,
}: {
  text: string;
  className?: string;
  // the element to write the text in (a paragraph, or a heading like h1)
  as?: "p" | "h1" | "h2";
  // wait this many milliseconds after it comes into view before typing (so two lines can type one after the other)
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  const words = text.trim().split(/\s+/);
  const total = words.join(" ").length;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          if (delay > 0) timer = setTimeout(() => setStarted(true), delay);
          else setStarted(true);
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [delay]);

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
    <Tag ref={ref as never} className={className} aria-label={text}>
      {words.map((word, w) => (
        <Fragment key={w}>
          <span className={styles.word} aria-hidden="true">
            {word.split("").map((char) => {
              const i = index++;
              return (
                <span key={i} className={i < count ? styles.shown : styles.hidden}>
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
    </Tag>
  );
}
