"use client";

import { useEffect, useRef } from "react";

// A row that slides slowly from left to right on its own, forever, and that you can also
// scroll yourself (swipe, drag or use the wheel). It pauses while you touch or point at it and
// starts again a few seconds later. The row's content is shown twice, so the loop has no seam.
export default function AutoRow({
  className,
  speed = 28,
  children,
}: {
  className?: string;
  speed?: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const half = () => el.scrollWidth / 2;
    let frame = 0;
    let last = performance.now();
    let pausedUntil = 0;
    let hovering = false;
    // Browsers round the scroll position to whole pixels, so the real position is kept here
    // and only copied over; "lastSet" tells our own moves apart from the visitor's.
    let pos = 0;
    let lastSet = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // start in the middle so there is room to go either way
    pos = half();
    el.scrollLeft = pos;
    lastSet = el.scrollLeft;

    const wrap = () => {
      const h = half();
      if (h <= 0) return;
      if (pos <= 2) pos += h;
      else if (pos >= h + 2) pos -= h;
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (!reduced && !hovering && now > pausedUntil) {
        // sliding to the right means the scroll position goes down
        pos -= speed * dt;
        wrap();
        el.scrollLeft = pos;
        lastSet = el.scrollLeft;
      }
      frame = requestAnimationFrame(tick);
    };

    const hold = (ms: number) => {
      pausedUntil = performance.now() + ms;
    };
    const onScroll = () => {
      // a move we did ourselves stays within a pixel or two of what we set
      if (Math.abs(el.scrollLeft - lastSet) <= 2) return;
      pos = el.scrollLeft;
      hold(4000);
      wrap();
      if (Math.abs(pos - el.scrollLeft) > 1) {
        el.scrollLeft = pos;
        lastSet = el.scrollLeft;
      }
    };
    const onEnter = (event: PointerEvent) => {
      if (event.pointerType === "mouse") hovering = true;
    };
    const onLeave = (event: PointerEvent) => {
      if (event.pointerType === "mouse") hovering = false;
    };
    const onDown = () => hold(5000);

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("touchstart", onDown, { passive: true });
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("touchstart", onDown);
    };
  }, [speed]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
