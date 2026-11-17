"use client";

import { useSyncExternalStore } from "react";
import { playPop, setSounds, soundsOn } from "@/lib/sounds";
import styles from "./SiteFooter.module.css";

function subscribe(onChange: () => void) {
  window.addEventListener("sounds-change", onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener("sounds-change", onChange);
    window.removeEventListener("storage", onChange);
  };
}

// The speaker button in the footer: turns the small sounds on or off.
export default function SoundToggle({ onLabel, offLabel }: { onLabel: string; offLabel: string }) {
  const on = useSyncExternalStore(subscribe, soundsOn, () => true);

  return (
    <button
      type="button"
      className={styles.sound}
      data-sound="none"
      aria-pressed={on}
      aria-label={on ? onLabel : offLabel}
      title={on ? onLabel : offLabel}
      onClick={() => {
        setSounds(!on);
        if (!on) playPop();
      }}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" />
        {on ? <path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" /> : <path d="m16 9.5 5 5M21 9.5l-5 5" />}
      </svg>
      <span>{on ? onLabel : offLabel}</span>
    </button>
  );
}
