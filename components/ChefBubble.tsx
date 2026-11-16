"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./ChefBubble.module.css";

// The chef figurine. Pressing it makes a small speech bubble float up beside it; pressing
// it again (or anywhere else, or Escape) puts the bubble away.
export default function ChefBubble({
  src,
  alt,
  width,
  height,
  sizes,
  imageClassName,
  buttonLabel,
  bubble,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  imageClassName?: string;
  buttonLabel: string;
  bubble: string;
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    const onPointer = (event: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div ref={wrap} className={styles.wrap}>
      <button type="button" className={styles.button} aria-expanded={open} aria-label={buttonLabel} onClick={() => setOpen((value) => !value)}>
        <Image src={src} alt={alt} width={width} height={height} sizes={sizes} quality={90} className={imageClassName} />
      </button>

      {open ? (
        <p className={styles.bubble} role="status">
          {bubble}
        </p>
      ) : (
        // three little dots, a hint that the figurine has something to say
        <span className={styles.nudge} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      )}
    </div>
  );
}
