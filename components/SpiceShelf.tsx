"use client";

import { useState } from "react";
import { getDictionary } from "@/lib/dictionaries";
import { fill } from "@/lib/rich";
import type { Locale } from "@/lib/i18n";
import styles from "./SpiceShelf.module.css";

// What each jar holds, in the order of the shelf (the names and facts are in the dictionary).
// kind decides how the spice is drawn in the jar and what falls out when it is tipped.
type Kind = "powder" | "seeds" | "flakes" | "leaves" | "sticks" | "pods" | "fronds";
const SPICES: { id: string; kind: Kind; color: string; dark: string; light: string }[] = [
  { id: "garam", kind: "powder", color: "#8a4a22", dark: "#5e2f12", light: "#b9733d" },
  { id: "cumin", kind: "seeds", color: "#8d6a2e", dark: "#5f4519", light: "#b8903f" },
  { id: "oregano", kind: "flakes", color: "#5f6d2e", dark: "#3f4a1c", light: "#8a9a44" },
  { id: "curry", kind: "powder", color: "#e0a21c", dark: "#b97a0a", light: "#f3c75a" },
  { id: "sumac", kind: "powder", color: "#8c1d2e", dark: "#5d101c", light: "#b83a4c" },
  { id: "bay", kind: "leaves", color: "#788546", dark: "#52602b", light: "#a1ad66" },
  { id: "mint", kind: "leaves", color: "#3f9a63", dark: "#2a7447", light: "#6fc58a" },
  { id: "dill", kind: "fronds", color: "#6fae4f", dark: "#3f7a2e", light: "#a4d27a" },
  { id: "cinnamon", kind: "sticks", color: "#a9532a", dark: "#74351a", light: "#cf7a45" },
  { id: "cardamom", kind: "pods", color: "#9bb06a", dark: "#6a8140", light: "#c0d08e" },
];

// a small repeatable "random" so the drawings are the same on the server and in the browser
function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const round = (n: number) => Math.round(n * 10) / 10;

// the spice inside the jar, drawn between y 84 and 200 of a 120 x 202 picture
function Contents({ spice, seed }: { spice: (typeof SPICES)[number]; seed: number }) {
  const r = rng(seed);
  const { kind, color, dark, light } = spice;
  const bits: React.ReactNode[] = [];

  if (kind === "powder") {
    bits.push(<rect key="base" x="14" y="88" width="92" height="120" fill={color} />);
    bits.push(<path key="top" d="M14 92 Q60 78 106 92 L106 102 L14 102Z" fill={light} opacity="0.55" />);
    for (let i = 0; i < 140; i++) {
      bits.push(
        <circle key={i} cx={round(16 + r() * 88)} cy={round(90 + r() * 108)} r={round(0.5 + r() * 1.1)} fill={r() > 0.5 ? dark : light} opacity={round(0.35 + r() * 0.4)} />,
      );
    }
  } else if (kind === "seeds") {
    bits.push(<rect key="base" x="14" y="88" width="92" height="120" fill={dark} />);
    for (let i = 0; i < 130; i++) {
      const x = round(18 + r() * 84);
      const y = round(90 + r() * 108);
      bits.push(<ellipse key={i} cx={x} cy={y} rx="3" ry="1.2" fill={r() > 0.45 ? color : light} transform={`rotate(${Math.round(r() * 180)} ${x} ${y})`} />);
    }
  } else if (kind === "flakes") {
    bits.push(<rect key="base" x="14" y="88" width="92" height="120" fill={dark} />);
    for (let i = 0; i < 200; i++) {
      const x = round(16 + r() * 88);
      const y = round(90 + r() * 108);
      bits.push(<ellipse key={i} cx={x} cy={y} rx={round(1.4 + r() * 1.8)} ry={round(0.7 + r() * 1)} fill={r() > 0.5 ? color : light} transform={`rotate(${Math.round(r() * 180)} ${x} ${y})`} />);
    }
  } else if (kind === "leaves") {
    const big = spice.id === "bay";
    const count = big ? 12 : 22;
    const length = big ? 34 : 22;
    const width = big ? 9 : 8;
    for (let i = 0; i < count; i++) {
      const x = round(24 + r() * 72);
      const y = round(92 + r() * 102);
      const angle = Math.round(r() * 180 - 90);
      const tone = r() > 0.5 ? color : i % 2 ? dark : light;
      bits.push(
        <g key={i} transform={`translate(${x} ${y}) rotate(${angle})`}>
          <path d={`M${-length / 2} 0 C ${-length / 4} ${-width}, ${length / 4} ${-width}, ${length / 2} 0 C ${length / 4} ${width}, ${-length / 4} ${width}, ${-length / 2} 0Z`} fill={tone} stroke={dark} strokeWidth="0.6" />
          <path d={`M${-length / 2} 0 L${length / 2} 0`} stroke={dark} strokeWidth="0.7" opacity="0.7" />
        </g>,
      );
    }
  } else if (kind === "sticks") {
    for (let i = 0; i < 6; i++) {
      const x = round(24 + i * 13 + r() * 4);
      const tilt = round(-14 + r() * 28);
      bits.push(
        <g key={i} transform={`rotate(${tilt} ${x} 150)`}>
          <rect x={x - 5} y={round(84 + r() * 12)} width="10.5" height="120" rx="5" fill={i % 2 ? color : light} stroke={dark} strokeWidth="0.8" />
          <ellipse cx={x} cy={round(89 + r() * 10)} rx="4.6" ry="2.4" fill={dark} />
          <path d={`M${x - 1.5} 100 L${x - 1.5} 196M${x + 2.5} 104 L${x + 2.5} 190`} stroke={dark} strokeWidth="0.7" opacity="0.5" />
        </g>,
      );
    }
  } else if (kind === "fronds") {
    // feathery dill: thin stems with many tiny branches
    for (let i = 0; i < 8; i++) {
      const x0 = round(22 + i * 10 + r() * 6);
      const x1 = round(x0 + (r() * 24 - 12));
      const tone = i % 3 === 0 ? dark : i % 3 === 1 ? color : light;
      let d = `M${x0} 206 Q${round((x0 + x1) / 2 + 6)} 150 ${x1} 84`;
      for (let k = 0; k < 14; k++) {
        const t = k / 13;
        const px = round(x0 + (x1 - x0) * t + Math.sin(t * 3) * 3);
        const py = round(200 - t * 114);
        const len = round(6 + r() * 5);
        d += ` M${px} ${py} l${-len} ${round(-len * 0.7)} M${px} ${py} l${len} ${round(-len * 0.7)}`;
      }
      bits.push(<path key={i} d={d} stroke={tone} strokeWidth="1.1" strokeLinecap="round" fill="none" />);
    }
  } else {
    for (let i = 0; i < 34; i++) {
      const x = round(24 + r() * 72);
      const y = round(94 + r() * 100);
      bits.push(
        <g key={i} transform={`translate(${x} ${y}) rotate(${Math.round(r() * 180)})`}>
          <ellipse rx="5.2" ry="8" fill={r() > 0.5 ? color : light} stroke={dark} strokeWidth="0.8" />
          <path d="M0 -7.4 L0 7.4M-2.2 -6 L-2.2 6M2.2 -6 L2.2 6" stroke={dark} strokeWidth="0.6" opacity="0.55" />
        </g>,
      );
    }
  }
  return <>{bits}</>;
}

// a glass jar with a wooden lid and a paper label, drawn as one picture
function JarPicture({ spice, index, name }: { spice: (typeof SPICES)[number]; index: number; name: string }) {
  const lines = name.toUpperCase().split(" ");
  const clip = `jar-clip-${spice.id}`;
  const glass = `jar-glass-${spice.id}`;
  const wood = `jar-wood-${spice.id}`;
  return (
    <svg className={styles.picture} viewBox="0 0 120 202" aria-hidden="true">
      <defs>
        <linearGradient id={glass} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.14" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id={wood} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#d49a60" />
          <stop offset="1" stopColor="#a86a36" />
        </linearGradient>
        <clipPath id={clip}>
          <rect x="17" y="51" width="86" height="148" rx="15" />
        </clipPath>
      </defs>

      {/* the glass behind the spice */}
      <rect x="16" y="50" width="88" height="150" rx="16" fill="#eef4f4" fillOpacity="0.55" />

      {/* the spice; it slides toward the lid when the jar is tipped */}
      <g clipPath={`url(#${clip})`}>
        <g className={styles.contents}>
          <Contents spice={spice} seed={index * 97 + 13} />
        </g>
      </g>

      {/* glass in front, with its shine */}
      <rect x="16" y="50" width="88" height="150" rx="16" fill={`url(#${glass})`} stroke="#8fa3a8" strokeOpacity="0.55" strokeWidth="1.4" />
      <rect x="22" y="62" width="5" height="112" rx="2.5" fill="#fff" opacity="0.55" />
      <rect x="95" y="70" width="3" height="60" rx="1.5" fill="#fff" opacity="0.4" />
      <rect x="27" y="40" width="66" height="12" rx="3" fill="#eef4f4" fillOpacity="0.7" stroke="#8fa3a8" strokeOpacity="0.5" strokeWidth="1" />

      {/* the label */}
      <rect x="25" y="96" width="70" height="62" rx="4" fill="#fbf6ea" stroke="#e3d6bb" strokeWidth="1" />
      <path d="M40 106 H80" stroke="#b9a37a" strokeWidth="0.8" />
      {lines.length === 1 ? (
        <text x="60" y="132" textAnchor="middle" className={styles.labelText} fontSize={name.length > 7 ? 10.5 : 12.5}>
          {lines[0]}
        </text>
      ) : (
        <text textAnchor="middle" className={styles.labelText} fontSize="10.5">
          <tspan x="60" y="127">{lines[0]}</tspan>
          <tspan x="60" y="141">{lines.slice(1).join(" ")}</tspan>
        </text>
      )}
      <path d="M40 150 H80" stroke="#b9a37a" strokeWidth="0.8" />

      {/* the wooden lid */}
      <rect x="20" y="2" width="80" height="40" rx="9" fill={`url(#${wood})`} />
      <path d="M26 11 Q60 7 94 11M24 19 Q60 15 96 19M26 27 Q60 23 94 27M28 34 Q60 31 92 34" stroke="#7e4d24" strokeWidth="0.9" fill="none" opacity="0.35" />
      <rect x="20" y="34" width="80" height="8" rx="4" fill="#8b5527" opacity="0.5" />
      <rect x="26" y="5" width="68" height="4" rx="2" fill="#fff" opacity="0.3" />
    </svg>
  );
}

// bits of spice that fall out of the tipped jar
function Spill({ spice }: { spice: (typeof SPICES)[number] }) {
  const r = rng(spice.id.length * 31 + spice.id.charCodeAt(0));
  return (
    <span className={styles.spill} aria-hidden="true" data-kind={spice.kind}>
      {Array.from({ length: 16 }, (_, i) => (
        <i
          key={i}
          style={
            {
              "--dx": `${Math.round(r() * 44 - 22)}px`,
              "--delay": `${round(r() * 1.1)}s`,
              "--dur": `${round(0.7 + r() * 0.6)}s`,
              "--rot": `${Math.round(r() * 360)}deg`,
              background: i % 3 === 0 ? spice.light : i % 3 === 1 ? spice.color : spice.dark,
            } as React.CSSProperties
          }
        />
      ))}
    </span>
  );
}

export default function SpiceShelf({ lang }: { lang: Locale }) {
  const t = getDictionary(lang).spices;
  // the jar being tipped right now (mouse over it, or tapped), and the one the note is about
  const [active, setActive] = useState<number | null>(null);
  const [shown, setShown] = useState<number | null>(null);

  const choose = (index: number | null) => {
    setActive(index);
    if (index !== null) setShown(index);
  };

  const note = shown === null ? null : t.items[shown];

  return (
    <div className={styles.wrap}>
      <div className={styles.shelf} onPointerLeave={(event) => event.pointerType === "mouse" && choose(null)}>
        {SPICES.map((spice, index) => {
          const name = t.items[index].name;
          const on = active === index;
          return (
            <div key={spice.id} className={`${styles.slot} ${on ? styles.on : ""}`}>
              <button
                type="button"
                className={styles.jar}
                aria-pressed={on}
                aria-label={fill(t.jarAria, { name })}
                onPointerEnter={(event) => event.pointerType === "mouse" && choose(index)}
                onFocus={() => choose(index)}
                onBlur={() => setActive((current) => (current === index ? null : current))}
                onClick={(event) => {
                  // a mouse already did this by hovering; a finger or the keyboard toggles it
                  if ((event.nativeEvent as PointerEvent).pointerType !== "mouse") choose(on ? null : index);
                }}
              >
                <span className={styles.tilt}>
                  <JarPicture spice={spice} index={index} name={name} />
                </span>
              </button>
              <Spill spice={spice} />
              <span className={styles.pile} style={{ background: spice.color }} aria-hidden="true" />
            </div>
          );
        })}
      </div>

      <div
        className={styles.note}
        role="status"
        aria-live="polite"
        style={{ "--i": shown ?? 0, "--n": SPICES.length } as React.CSSProperties}
      >
        {note ? (
          <div key={shown} className={styles.noteBody}>
            <h3>{note.name}</h3>
            <p>{note.fact}</p>
            <p className={styles.uses}>
              <strong>{t.tryIn}:</strong> {note.uses}
            </p>
          </div>
        ) : (
          <p className={styles.hint}>{t.hint}</p>
        )}
      </div>
    </div>
  );
}
