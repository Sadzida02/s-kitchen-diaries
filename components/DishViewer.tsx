"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getDictionary } from "@/lib/dictionaries";
import { localePath } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import styles from "./DishViewer.module.css";

type Area = {
  // position and size on the photo, in percent
  left: number;
  top: number;
  width: number;
  height: number;
};

type Dish = {
  name: string;
  // the address of its recipe (the part after /recipes/), if the dish has a recipe on the site
  slug?: string;
  // a dish can show up in more than one place on the photo
  areas: Area[];
};

type DishViewerProps = {
  lang: Locale;
  src: string;
  alt: string;
  dishes: Dish[];
  // put the photo on the left and the text on the right
  reverse?: boolean;
  priority?: boolean;
  // a big pill-shaped photo on a brown backdrop
  bubble?: boolean;
  // the intro text that sits above the list
  children: React.ReactNode;
};

const ZOOM = 2.6;
const LENS = 170;

// A photo with a magnifier that follows the cursor, a label for the dish
// under it, and a list of the dishes beside it. Hovering a name in the list
// highlights that dish on the photo.
export default function DishViewer({
  lang,
  src,
  alt,
  dishes,
  reverse = false,
  priority = false,
  bubble = false,
  children,
}: DishViewerProps) {
  const t = getDictionary(lang);
  const router = useRouter();
  const frame = useRef<HTMLDivElement>(null);
  const [lens, setLens] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [listActive, setListActive] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = frame.current?.getBoundingClientRect();
    if (!rect) return;
    setLens({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      w: rect.width,
      h: rect.height,
    });
  };

  const percentX = lens ? (lens.x / lens.w) * 100 : -1;
  const percentY = lens ? (lens.y / lens.h) * 100 : -1;
  const overIndex = lens
    ? dishes.findIndex((dish) =>
        dish.areas.some(
          (area) =>
            percentX >= area.left &&
            percentX <= area.left + area.width &&
            percentY >= area.top &&
            percentY <= area.top + area.height,
        ),
      )
    : -1;
  const active = overIndex >= 0 ? overIndex : listActive;

  return (
    <div
      className={`container ${styles.layout} ${reverse ? styles.reverse : ""} ${bubble ? styles.bubble : ""}`}
    >
      <div className={styles.text}>
        {children}
      <div className={`${styles.list} ${open ? styles.listOpen : ""}`}>
        <button
          type="button"
          className={styles.listTitle}
          aria-expanded={open}
          aria-controls="dish-menu"
          onClick={() => setOpen((value) => !value)}
        >
          {t.dishViewer.menu}
          <svg className={styles.chevron} viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        <div className={styles.panel} id="dish-menu">
          <div className={styles.panelInner}>
            <ul>
              {dishes.map((dish, index) => (
                <li key={dish.name}>
                  <button
                    type="button"
                    className={active === index ? styles.on : ""}
                    tabIndex={open ? 0 : -1}
                    onMouseEnter={() => setListActive(index)}
                    onMouseLeave={() => setListActive(null)}
                    onFocus={() => setListActive(index)}
                    onBlur={() => setListActive(null)}
                    onClick={() => dish.slug && router.push(localePath(lang, `/recipes/${dish.slug}`))}
                    data-link={dish.slug ? "" : undefined}
                  >
                    <span className={styles.dish}>{dish.name}</span>
                    <span className={styles.leader} aria-hidden="true" />
                    <span className={styles.number} aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <p className={styles.hint}>{t.dishViewer.hint}</p>
          </div>
        </div>
      </div>
      </div>
      <div className={styles.stage}>
      <div
        ref={frame}
        className={styles.frame}
        onPointerMove={move}
        onPointerDown={move}
        onPointerLeave={() => setLens(null)}
        onPointerUp={(event) => event.pointerType === "touch" && setLens(null)}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(max-width: 900px) 100vw, 720px"
          quality={90}
          className={styles.photo}
        />

        {lens && (
          <span
            className={styles.lens}
            style={{
              width: LENS,
              height: LENS,
              left: lens.x - LENS / 2,
              top: lens.y - LENS / 2,
              backgroundImage: `url(${src})`,
              backgroundSize: `${lens.w * ZOOM}px ${lens.h * ZOOM}px`,
              backgroundPosition: `${LENS / 2 - lens.x * ZOOM}px ${LENS / 2 - lens.y * ZOOM}px`,
            }}
          >
            {overIndex >= 0 && <span className={styles.tag}>{dishes[overIndex].name}</span>}
          </span>
        )}
      </div>

      </div>

    </div>
  );
}
