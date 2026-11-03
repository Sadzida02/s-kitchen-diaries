const COLORS = ["#d9a45a", "#f0d6a2", "#7d55b0", "#dccaf0", "#ffffff", "#b9845a", "#54317f"];

type Piece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  angle: number;
  spin: number;
  color: string;
  round: boolean;
};

// A short burst of confetti over the whole screen, fired from both sides.
// It draws on its own canvas and removes itself when it is done.
export function fireConfetti(duration = 4200) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: "90",
  });
  const ratio = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(ratio, ratio);
  document.body.appendChild(canvas);

  const pieces: Piece[] = [];
  const spawn = (fromLeft: boolean, count: number) => {
    for (let i = 0; i < count; i++) {
      const power = 9 + Math.random() * 13;
      const spread = (Math.random() - 0.5) * 0.7;
      const direction = fromLeft ? 1 : -1;
      pieces.push({
        x: fromLeft ? -10 : width + 10,
        y: height * (0.55 + Math.random() * 0.25),
        vx: direction * power * Math.cos(0.9 + spread) * 0.9,
        vy: -power * Math.sin(0.9 + spread) * 1.15,
        size: 6 + Math.random() * 7,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.35,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        round: Math.random() < 0.25,
      });
    }
  };
  spawn(true, 90);
  spawn(false, 90);

  const start = performance.now();
  let frame = 0;

  const tick = (now: number) => {
    const elapsed = now - start;
    ctx.clearRect(0, 0, width, height);
    const fade = elapsed > duration - 800 ? Math.max(0, (duration - elapsed) / 800) : 1;
    ctx.globalAlpha = fade;

    for (const p of pieces) {
      p.vy += 0.32;
      p.vx *= 0.985;
      p.vy *= 0.992;
      p.x += p.vx;
      p.y += p.vy;
      p.angle += p.spin;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      if (p.round) {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }
      ctx.restore();
    }

    if (elapsed < duration) {
      frame = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(frame);
      canvas.remove();
    }
  };
  frame = requestAnimationFrame(tick);
}
