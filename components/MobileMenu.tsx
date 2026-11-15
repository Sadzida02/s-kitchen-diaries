"use client";

import { useEffect, useId, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./SiteHeader.module.css";

// The menu button for small screens (three lines). Pressing it drops the whole menu down;
// choosing a link, pressing Escape or going to another page closes it again.
export default function MobileMenu({
  openLabel,
  closeLabel,
  children,
}: {
  openLabel: string;
  closeLabel: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const pathname = usePathname();

  // a new page closes the menu
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className={styles.menuWrap}>
      <button
        type="button"
        className={styles.menuButton}
        aria-expanded={open}
        aria-controls={id}
        aria-label={open ? closeLabel : openLabel}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={styles.burger} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </button>
      <div
        id={id}
        className={styles.panel}
        hidden={!open}
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a")) setOpen(false);
        }}
      >
        {children}
      </div>
    </div>
  );
}
