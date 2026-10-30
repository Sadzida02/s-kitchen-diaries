"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./BookPreview.module.css";

// Pages of the handwritten recipe book, in the order they turn. After the last
// page the book starts again from the first one.
const pages = [
  { src: "/images/book/page-02.jpg", title: "Orange cake" },
  { src: "/images/book/page-03.jpg", title: "Mamin rolat sa jabukama" },
  { src: "/images/book/page-04.jpg", title: "Tetkine štrudle s bestiljem" },
  { src: "/images/book/page-05.jpg", title: "Lejlin carrot cake" },
  { src: "/images/book/page-06.jpg", title: "Arapska riža" },
  { src: "/images/book/page-07.jpg", title: "Tiramisu s jagodama" },
  { src: "/images/book/page-08.jpg", title: "Čokoladni mafini" },
  { src: "/images/book/page-01.jpg", title: "Palačinke od hurmi" },
  { src: "/images/book/page-09.jpg", title: "Kvrguša" },
  { src: "/images/book/page-10.jpg", title: "Mamin omlet" },
  { src: "/images/book/page-11.jpg", title: "Butter chicken" },
  { src: "/images/book/page-12.jpg", title: "Arapski kuglof" },
  { src: "/images/book/page-13.jpg", title: "Lemon loaf" },
  { src: "/images/book/page-14.jpg", title: "Fatteh eggplant" },
  { src: "/images/book/page-15.jpg", title: "Italijanske kalcone" },
];

const COUNT = pages.length;

// Dragging up by this fraction of the book's height turns one page.
const DRAG_PER_PAGE = 0.7;
const FLIP_MS = 650;

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const mod = (n: number) => ((n % COUNT) + COUNT) % COUNT;

export default function BookPreview() {
  const book = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startY: number; startPos: number; moved: boolean } | null>(null);
  const posRef = useRef(0);
  const frame = useRef(0);
  // `position` is the number of pages turned so far; it keeps counting up (or
  // down), and the page shown is that number modulo the page count.
  const [position, setPosition] = useState(0);

  const setPos = (value: number) => {
    posRef.current = value;
    setPosition(value);
  };

  const stopAnimation = () => {
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = 0;
  };

  const animateTo = (target: number) => {
    stopAnimation();
    const from = posRef.current;
    if (from === target) return;
    const duration = FLIP_MS * Math.min(1, Math.max(0.45, Math.abs(target - from)));
    const start = performance.now();
    const step = (now: number) => {
      const progress = clamp((now - start) / duration);
      setPos(from + (target - from) * easeInOut(progress));
      frame.current = progress < 1 ? requestAnimationFrame(step) : 0;
    };
    frame.current = requestAnimationFrame(step);
  };

  useEffect(() => stopAnimation, []);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // capture is only a nicety: the drag still works without it
    }
    stopAnimation();
    drag.current = { startY: event.clientY, startPos: posRef.current, moved: false };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state) return;
    const height = book.current?.offsetHeight ?? 600;
    const dy = state.startY - event.clientY;
    if (Math.abs(dy) > 6) state.moved = true;
    if (state.moved) setPos(state.startPos + dy / (height * DRAG_PER_PAGE));
  };

  const onPointerUp = () => {
    const state = drag.current;
    drag.current = null;
    if (!state) return;
    const from = Math.round(state.startPos);
    if (!state.moved) {
      // a plain tap or click turns to the next page
      animateTo(from + 1);
      return;
    }
    const travelled = posRef.current - state.startPos;
    animateTo(travelled > 0.2 ? from + 1 : travelled < -0.2 ? from - 1 : from);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const from = Math.round(posRef.current);
    if (event.key === "ArrowUp" || event.key === "ArrowRight") {
      event.preventDefault();
      animateTo(from + 1);
    } else if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
      event.preventDefault();
      animateTo(from - 1);
    }
  };

  const base = Math.floor(position);
  const frac = position - base;
  const shown = mod(Math.round(position));

  return (
    <div className={styles.wrap}>
      <div
        ref={book}
        className={styles.book}
        tabIndex={0}
        role="group"
        aria-label={`Recipe notebook, page ${shown + 1} of ${COUNT}. Use the arrow keys to turn pages.`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      >
        {pages.map((page, i) => {
          // d = how many pages this one sits below the page being turned
          const d = mod(i - base);
          const t = d === 0 ? frac : 0;
          const lift = Math.sin(t * Math.PI);
          const opacity = t < 0.5 ? 1 : clamp(1 - (t - 0.5) / 0.4);
          // the page underneath gets a shadow while the one above turns
          const cast = d === 1 ? lift * 0.75 : 0;
          return (
            <div
              key={page.src}
              className={styles.page}
              style={{
                zIndex: COUNT - d,
                transform: `translateZ(${lift * 60}px) rotateX(${t * 180}deg)`,
                opacity,
                visibility: d <= 2 ? "visible" : "hidden",
              }}
            >
              <div className={styles.front}>
                <Image
                  src={page.src}
                  alt={`Handwritten recipe page: ${page.title}`}
                  fill
                  draggable={false}
                  sizes="(max-width: 700px) 88vw, 460px"
                  className={styles.photo}
                />
                <span className={styles.cast} style={{ opacity: cast }} />
                <span className={styles.sheen} style={{ opacity: lift * 0.9 }} />
              </div>
              <div className={styles.back} />
            </div>
          );
        })}
      </div>

      <p className={styles.caption}>
        <span className={styles.count}>
          {shown + 1} / {COUNT}
        </span>
        {pages[shown].title}
      </p>
      <p className={styles.note}>
        <span aria-hidden="true">☝</span> Drag or swipe a page upwards to turn it, drag down to go
        back. A tap turns it too.
      </p>
    </div>
  );
}
