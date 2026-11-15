"use client";

import Image from "next/image";
import { useState } from "react";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";
import styles from "./PhotoStack.module.css";

type Photo = { src: string; alt: string };

// The recipe's photos as a pile: the cover lies on top and the others peek out
// from underneath. Clicking the top photo sends it to the back and shows the next.
export default function PhotoStack({ lang, photos }: { lang: Locale; photos: Photo[] }) {
  const t = getDictionary(lang);
  const [top, setTop] = useState(0);
  const count = photos.length;
  const next = () => setTop((value) => (value + 1) % count);

  return (
    <div className={styles.wrap}>
      <div className={styles.deck}>
        {photos.map((photo, index) => {
          const depth = (index - top + count) % count;
          const visible = depth < 3;
          return (
            <div
              key={photo.src}
              className={`${styles.card} ${depth === 0 ? styles.front : ""}`}
              style={{ "--depth": visible ? depth : 3 } as React.CSSProperties}
              aria-hidden={depth !== 0}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                priority={index === 0}
                sizes="(max-width: 900px) 100vw, 560px"
                className={styles.image}
              />
            </div>
          );
        })}
        {count > 1 && (
          <button
            type="button"
            className={styles.hit}
            onClick={next}
            aria-label={`${t.recipe.stackAria} (${top + 1} ${t.recipe.of} ${count})`}
          />
        )}
      </div>
      {count > 1 && (
        <p className={styles.hint} aria-hidden="true">
          <span>
            {top + 1} / {count}
          </span>{" "}
          {t.recipe.stackHint}
        </p>
      )}
    </div>
  );
}
