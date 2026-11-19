"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import styles from "./KeepAwake.module.css";

type WakeLockSentinelLike = { release: () => Promise<void>; addEventListener: (type: "release", listener: () => void) => void };

const supported = () => typeof navigator !== "undefined" && "wakeLock" in navigator;
const subscribe = () => () => {};

// A switch that keeps the phone or tablet screen on while you cook (the browser's Screen Wake Lock).
// It switches itself off when you leave the page, and is hidden in browsers that cannot do it.
export default function KeepAwake({ label, hint }: { label: string; hint: string }) {
  const canDo = useSyncExternalStore(subscribe, supported, () => false);
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!on) return;
    let lock: WakeLockSentinelLike | null = null;
    let stopped = false;

    const take = async () => {
      try {
        const next = await (navigator as unknown as { wakeLock: { request: (type: "screen") => Promise<WakeLockSentinelLike> } }).wakeLock.request("screen");
        if (stopped) {
          void next.release();
          return;
        }
        lock = next;
      } catch {
        // the browser said no (for example the battery is very low): the switch goes back off
        if (!stopped) setOn(false);
      }
    };
    // the browser lets go of the lock whenever the tab is hidden, so take it again when you come back
    const again = () => {
      if (document.visibilityState === "visible") void take();
    };

    void take();
    document.addEventListener("visibilitychange", again);
    return () => {
      stopped = true;
      document.removeEventListener("visibilitychange", again);
      void lock?.release();
    };
  }, [on]);

  if (!canDo) return null;

  return (
    <button type="button" role="switch" aria-checked={on} className={`${styles.switch} ${on ? styles.on : ""}`} onClick={() => setOn((value) => !value)} title={hint}>
      <span className={styles.track} aria-hidden="true">
        <span className={styles.knob} />
      </span>
      {label}
    </button>
  );
}
