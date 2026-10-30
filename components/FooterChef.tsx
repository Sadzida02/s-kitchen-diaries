"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./FooterChef.module.css";

const lines = [
  "Something delicious is in sight, right?",
  "Hi, welcome to my kitchen!",
  "Come hungry, leave happy.",
  "Taste as you go, always.",
  "Psst… start with the orange cake.",
];

export default function FooterChef({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  const [line, setLine] = useState(0);
  const [waving, setWaving] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const greet = () => {
    setLine((current) => (current + 1) % lines.length);
    setWaving(true);
  };

  return (
    <div ref={ref} className={`${styles.wrap} ${seen ? styles.seen : ""}`}>
      <div className={styles.content}>{children}</div>
      <div className={styles.chef}>
        <p className={styles.bubble} aria-live="polite">
          {lines[line]}
        </p>
      <button
        type="button"
        className={styles.figure}
        onClick={greet}
        onMouseEnter={() => setWaving(true)}
        onMouseLeave={() => setWaving(false)}
        onFocus={() => setWaving(true)}
        onBlur={() => setWaving(false)}
        aria-label="Say hi to the little chef"
      >
        <span className={styles.bob}>
          <Image
            src="/images/chef/chef-cone.webp"
            alt=""
            width={362}
            height={720}
            sizes="110px"
            className={`${styles.pose} ${styles.cone} ${waving ? styles.hidden : ""}`}
          />
          <Image
            src="/images/chef/chef-whisk.webp"
            alt=""
            width={530}
            height={720}
            sizes="160px"
            className={`${styles.pose} ${styles.whisk} ${waving ? "" : styles.hidden}`}
          />
        </span>
        </button>
      </div>
    </div>
  );
}
