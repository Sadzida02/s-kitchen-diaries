"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./BookPreview.module.css";

// Pages of the handwritten recipe book, in the order they turn.
const pages = [
  { src: "/images/book/page-01.jpg", title: "Palačinke od hurmi" },
  { src: "/images/book/page-02.jpg", title: "Orange cake" },
  { src: "/images/book/page-03.jpg", title: "Mamin rolat sa jabukama" },
  { src: "/images/book/page-04.jpg", title: "Tetkine štrudle s bestiljem" },
  { src: "/images/book/page-05.jpg", title: "Lejlin carrot cake" },
  { src: "/images/book/page-06.jpg", title: "Arapska riža" },
  { src: "/images/book/page-07.jpg", title: "Tiramisu s jagodama" },
  { src: "/images/book/page-08.jpg", title: "Čokoladni mafini" },
  { src: "/images/book/page-09.jpg", title: "Kvrguša" },
  { src: "/images/book/page-10.jpg", title: "Mamin omlet" },
  { src: "/images/book/page-11.jpg", title: "Butter chicken" },
  { src: "/images/book/page-12.jpg", title: "Arapski kuglof" },
  { src: "/images/book/page-13.jpg", title: "Lemon loaf" },
  { src: "/images/book/page-14.jpg", title: "Fatteh eggplant" },
  { src: "/images/book/page-15.jpg", title: "Italijanske kalcone" },
];

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

// Dragging up by this fraction of the book's height turns one page.
const DRAG_PER_PAGE = 0.7;

export default function BookPreview() {
  const book = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startY: number; startPos: number; moved: boolean } | null>(null);
  const [position, setPosition] = useState(0);
  const [dragging, setDragging] = useState(false);

  const turns = pages.length - 1;
  const current = Math.round(position);

  const goTo = (page: number) => setPosition(clamp(page, 0, turns));

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { startY: event.clientY, startPos: position, moved: false };
    setDragging(true);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state) return;
    const height = book.current?.offsetHeight ?? 600;
    const dy = state.startY - event.clientY;
    if (Math.abs(dy) > 6) state.moved = true;
    setPosition(clamp(state.startPos + dy / (height * DRAG_PER_PAGE), 0, turns));
  };

  const onPointerUp = () => {
    const state = drag.current;
    drag.current = null;
    setDragging(false);
    if (!state) return;
    if (!state.moved) {
      // a plain tap or click goes to the next page
      goTo(Math.round(state.startPos) + 1);
      return;
    }
    const from = Math.round(state.startPos);
    const travelled = position - state.startPos;
    goTo(travelled > 0.2 ? from + 1 : travelled < -0.2 ? from - 1 : from);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowUp" || event.key === "ArrowRight") {
      event.preventDefault();
      goTo(current + 1);
    } else if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(current - 1);
    }
  };

  return (
    <div className={styles.wrap}>
      <div
        ref={book}
        className={`${styles.book} ${dragging ? styles.dragging : ""}`}
        tabIndex={0}
        role="group"
        aria-label={`Recipe notebook, page ${current + 1} of ${pages.length}. Use the arrow keys to turn pages.`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      >
        {pages.map((page, i) => {
          const t = i < turns ? clamp(position - i) : 0;
          const near = i >= Math.floor(position) - 1 && i <= Math.floor(position) + 3;
          return (
            <div
              key={page.src}
              className={styles.page}
              style={{
                zIndex: pages.length - i,
                transform: `rotateX(${t * 180}deg)`,
                visibility: near ? "visible" : "hidden",
              }}
            >
              <Image
                src={page.src}
                alt={`Handwritten recipe page: ${page.title}`}
                fill
                draggable={false}
                sizes="(max-width: 700px) 88vw, 460px"
                className={styles.photo}
              />
              <span className={styles.shade} style={{ opacity: Math.sin(t * Math.PI) * 0.55 }} />
            </div>
          );
        })}
      </div>

      <p className={styles.caption}>
        <span className={styles.count}>
          {current + 1} / {pages.length}
        </span>
        {pages[current].title}
      </p>
      <p className={styles.note}>
        <span aria-hidden="true">☝</span> Drag or swipe a page upwards to turn it, drag down to go
        back. A tap turns it too.
      </p>
    </div>
  );
}
