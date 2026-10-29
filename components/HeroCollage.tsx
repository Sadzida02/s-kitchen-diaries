"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./HeroCollage.module.css";

// Add more photos here. Four show at once on wide screens (two on phones),
// and the arrows scroll through the rest, looping forever.
const photos = [
  { src: "/images/sweet-dates.jpg", alt: "Dark chocolate dates topped with chopped pistachios" },
  { src: "/images/salty-kiflice.jpg", alt: "Golden kiflice rolls on a plate" },
  { src: "/images/sweet-cinnamon-rolls.jpg", alt: "A tray of cinnamon rolls with white icing and sea salt" },
  { src: "/images/salty-steak.jpg", alt: "Seared steak on a white plate with golden rice" },
  { src: "/images/sweet-halva.jpg", alt: "Homemade pizza with melted cheese and fresh toppings" },
  { src: "/images/sweet-mini-pavlova.jpg", alt: "Mini pavlovas piped with cream and berries" },
  { src: "/images/sweet-umm-ali.jpg", alt: "Two poke bowls with fresh vegetables" },
  { src: "/images/sweet-fruit-pastries.jpg", alt: "Chocolate cake sliced into wedges and topped with chopped nuts" },
  { src: "/images/sweet-cookies.jpg", alt: "Chocolate cake sliced into wedges and topped with chopped nuts" },
  { src: "/images/salty-pizza.jpg", alt: "Homemade pizza with melted cheese and fresh toppings" },
];

const COPIES = [0, 1, 2];

export default function HeroCollage() {
  const total = photos.length;
  const [visible, setVisible] = useState(4);
  // The strip holds three copies of the photos and starts in the middle one,
  // so it can keep sliding either way; after each slide it quietly jumps back
  // into the middle copy.
  const [index, setIndex] = useState(total);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 700px)");
    const update = () => setVisible(query.matches ? 4 : 2);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (animate) return;
    const frame = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(frame);
  }, [animate]);

  useEffect(() => {
    if (index >= total && index < total * 2) return;
    const timer = setTimeout(() => {
      setAnimate(false);
      setIndex((((index % total) + total) % total) + total);
    }, 650);
    return () => clearTimeout(timer);
  }, [index, total]);

  const go = (step: number) => {
    setAnimate(true);
    setIndex((current) => current + step);
  };

  return (
    <>
      <div className={styles.collage}>
        <div
          className={`${styles.track} ${animate ? "" : styles.still}`}
          style={{ ["--visible" as string]: visible, ["--index" as string]: index }}
        >
          {COPIES.map((copy) =>
            photos.map((photo, i) => (
              <div key={`${copy}-${photo.src}`} className={styles.cell} aria-hidden={copy !== 1}>
                <div className={styles.tile} style={{ ["--n" as string]: i % 4 }}>
                  <Image
                    src={photo.src}
                    alt={copy === 1 ? photo.alt : ""}
                    fill
                    priority={copy === 1 && i < 4}
                    sizes="(max-width: 700px) 50vw, 25vw"
                    className={styles.photo}
                  />
                </div>
              </div>
            )),
          )}
        </div>
      </div>

      <button type="button" className={`${styles.arrow} ${styles.prev}`} onClick={() => go(-1)} aria-label="Previous photos">
        ‹
      </button>
      <button type="button" className={`${styles.arrow} ${styles.next}`} onClick={() => go(1)} aria-label="Next photos">
        ›
      </button>
    </>
  );
}
