"use client";

import { useSyncExternalStore } from "react";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";
import styles from "./GridSwitch.module.css";

const OPTIONS = [2, 3, 4, 5];
const KEY = "recipe-columns";

// the saved choice lives in this browser; the page re-reads it when it changes
function subscribe(onChange: () => void) {
  window.addEventListener(KEY, onChange);
  return () => window.removeEventListener(KEY, onChange);
}

function readChoice(): number {
  try {
    const saved = Number(localStorage.getItem(KEY));
    return OPTIONS.includes(saved) ? saved : 3;
  } catch {
    return 3;
  }
}

type GridSwitchProps = {
  lang: Locale;
  // the search box: it sits on the same row as the buttons that pick the row size
  toolbar?: React.ReactNode;
  // shown instead of the grid when there are no cards
  empty?: React.ReactNode;
  children: React.ReactNode;
};

// Wraps the recipe cards and lets you choose how many fit in a row (2 to 5).
// The choice is remembered in this browser. On small screens the page decides.
export default function GridSwitch({ lang, toolbar, empty, children }: GridSwitchProps) {
  const t = getDictionary(lang);
  const cols = useSyncExternalStore(subscribe, readChoice, () => 3);

  const choose = (value: number) => {
    try {
      localStorage.setItem(KEY, String(value));
    } catch {}
    window.dispatchEvent(new Event(KEY));
  };

  return (
    <div className={styles.wrap} style={{ ["--cols" as string]: cols }}>
      <div className={styles.bar}>
        {toolbar && <div className={styles.toolbar}>{toolbar}</div>}
        <div className={styles.switch} role="group" aria-label={t.recipesPage.perRowAria}>
          <span>{t.recipesPage.perRow}</span>
          {OPTIONS.map((value) => (
            <button
              key={value}
              type="button"
              className={`${styles.option} ${cols === value ? styles.on : ""}`}
              aria-pressed={cols === value}
              onClick={() => choose(value)}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      {empty ?? <div className={styles.grid}>{children}</div>}
    </div>
  );
}
