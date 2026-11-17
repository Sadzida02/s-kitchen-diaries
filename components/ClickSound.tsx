"use client";

import { useEffect } from "react";
import { playCook, playPop } from "@/lib/sounds";

// One listener for the whole site: a little pop when a button or a link is clicked. An element can ask for
// something else with data-sound="cook" (a cooking sound) or data-sound="none" (it makes its own sound, or none).
export default function ClickSound() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const control = target?.closest("a[href], button, [role='button']");
      if (!control) return;
      const kind = control.closest("[data-sound]")?.getAttribute("data-sound");
      if (kind === "none") return;
      if (kind === "cook") playCook();
      else playPop();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
