"use client";

import { useRef, useState } from "react";
import Image from "next/image";
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
  // a dish can show up in more than one place on the photo
  areas: Area[];
};

type DishViewerProps = {
  src: string;
  alt: string;
  dishes: Dish[];
  // put the photo on the left and the text on the right
  reverse?: boolean;
  priority?: boolean;
  // the intro text that sits above the list
  children: React.ReactNode;
};

const ZOOM = 2.6;
const LENS = 170;

// A photo with a magnifier that follows the cursor, a label for the dish
// under it, and a list of the dishes beside it. Hovering a name in the list
// highlights that dish on the photo.
export default function DishViewer({
  src,
  alt,
  dishes,
  reverse = false,
  priority = false,
  children,
}: DishViewerProps) {
  const frame = useRef<HTMLDivElement>(null);
  const [lens, setLens] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [listActive, setListActive] = useState<number | null>(null);

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
    <div className={`container ${styles.layout} ${reverse ? styles.reverse : ""}`}>
      <div className={styles.text}>{children}</div>
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
          sizes="(max-width: 900px) 100vw, 460px"
          className={styles.photo}
        />

        {dishes.map((dish, index) =>
          dish.areas.map((area, n) => (
            <span
              key={`${dish.name}-${n}`}
              className={`${styles.spot} ${active === index ? styles.spotOn : ""}`}
              style={{
                left: `${area.left}%`,
                top: `${area.top}%`,
                width: `${area.width}%`,
                height: `${area.height}%`,
              }}
            />
          )),
        )}

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

      <div className={styles.list}>
        <p className={styles.listTitle}>On the table</p>
        <ul>
          {dishes.map((dish, index) => (
            <li key={dish.name}>
              <button
                type="button"
                className={active === index ? styles.on : ""}
                onMouseEnter={() => setListActive(index)}
                onMouseLeave={() => setListActive(null)}
                onFocus={() => setListActive(index)}
                onBlur={() => setListActive(null)}
              >
                <span className={styles.dot} aria-hidden="true" />
                {dish.name}
              </button>
            </li>
          ))}
        </ul>
        <p className={styles.hint}>Move over the photo to look closer.</p>
      </div>
    </div>
  );
}
