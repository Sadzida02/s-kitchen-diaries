"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./SharedMeals.module.css";

type IconName = "words" | "apple" | "clock" | "hourglass" | "heart" | "cap";

type Fact = {
  title: string;
  icon: IconName;
  // a number that counts up when the card scrolls into view, or a short big word
  count?: { to: number; decimals?: number; suffix: string };
  big?: string;
  caption: string;
  points: string[];
  source: { label: string; href: string };
};

// little line drawings for the top of each panel
const ICONS: Record<IconName, React.ReactNode> = {
  words: (
    <>
      <path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-6l-4 3.5V17H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
      <path d="M8 9.5h8M8 12.5h5" />
    </>
  ),
  apple: (
    <>
      <path d="M12 8c-2.2-2-6.5-1-6.5 4 0 4 2.2 8 4.5 8 1 0 1.3-.6 2-.6s1 .6 2 .6c2.300 0 4.500-4 4.500-8 0-5-4.300-6-6.500-4z" />
      <path d="M12 8c0-2.200 1-3.500 3-4.500" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.500l3.500 2" />
    </>
  ),
  hourglass: (
    <>
      <path d="M6.500 3h11M6.500 21h11" />
      <path d="M8 3c0 5.500 4 5.500 4 9s-4 3.500-4 9M16 3c0 5.500-4 5.500-4 9s4 3.500 4 9" />
    </>
  ),
  heart: <path d="M12 20.500s-8-4.800-8-10.500A4.500 4.500 0 0 1 12 7.300 4.500 4.500 0 0 1 20 10c0 5.700-8 10.500-8 10.500z" />,
  cap: (
    <>
      <path d="M2 9l10-5 10 5-10 5z" />
      <path d="M6 11.200V16c3 2.600 9 2.600 12 0v-4.800M22 9v6" />
    </>
  ),
};

const FACTS: Fact[] = [
  {
    title: "Words that bind",
    icon: "words",
    count: { to: 20, suffix: "%" },
    caption: "less likely to develop unhealthy eating patterns",
    points: [
      "Dinner-table talk helps children pick up new words and good table manners.",
      "Better vocabulary is linked to doing better at school.",
      "That 20% is for young children who share at least three meals a week.",
    ],
    source: {
      label: "University of Michigan School of Public Health",
      href: "https://sph.umich.edu/pursuit/2019posts/breaking-bread-promoting-wellness.html",
    },
  },
  {
    title: "Healthier plates",
    icon: "apple",
    count: { to: 24, suffix: "%" },
    caption: "more likely to eat healthy foods",
    points: [
      "Families who share at least three meals a week make healthy eating more likely, and keep it up.",
      "Try “get to three”: three shared meals or snacks a week, with at least one grown-up there.",
    ],
    source: {
      label: "University of Michigan School of Public Health",
      href: "https://sph.umich.edu/pursuit/2019posts/breaking-bread-promoting-wellness.html",
    },
  },
  {
    title: "A healthy weight, later",
    icon: "clock",
    big: "10 years later",
    caption: "lower odds of weight problems",
    points: [
      "Teens who often ate family meals had lower odds of obesity a decade later.",
      "Researchers suggest gathering for at least one or two meals a week.",
    ],
    source: { label: "Trinity Health", href: "https://www.trinityhealth.org/?p=21428" },
  },
  {
    title: "Slow down, savour",
    icon: "hourglass",
    big: "Slower bites",
    caption: "more time to notice you are full",
    points: [
      "At shared meals people eat more slowly and talk more.",
      "That gives the body time to digest and to notice fullness, which helps prevent overeating.",
    ],
    source: { label: "Trinity Health", href: "https://www.trinityhealth.org/?p=21428" },
  },
  {
    title: "Table for older adults",
    icon: "heart",
    big: "Less lonely",
    caption: "communal meals may ease sadness",
    points: [
      "Research suggests eating together may lower feelings of loneliness, sadness and distress in older adults.",
      "Reported by National Geographic from a study in Frontiers in Public Health.",
    ],
    source: {
      label: "National Geographic",
      href: "https://www.nationalgeographic.com/health/article/communal-dining-loneliness-epidemic",
    },
  },
  {
    title: "Students and loneliness",
    icon: "cap",
    count: { to: 16.1, decimals: 1, suffix: "%" },
    caption: "of students felt severely lonely",
    points: [
      "A small preliminary study (a preprint, not yet peer reviewed) used the UCLA loneliness scale.",
      "Its authors link loneliness to how students eat socially and how they feel at mealtimes.",
    ],
    source: { label: "Preprints.org abstract", href: "https://www.preprints.org/manuscript/202603.2194/v1" },
  },
];

// counts from 0 up to the number the first time it is on screen
function CountUp({ to, decimals = 0, suffix }: { to: number; decimals?: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(to);

  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / 1400, 1);
          setValue(to * (1 - Math.pow(1 - t, 3)));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [to]);

  return (
    <span ref={ref}>
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}

// One panel of the row. It shows the title and the number; when it is hovered (or
// focused, or tapped on a phone) it widens and the details slide open.
function Panel({
  fact,
  active,
  onActivate,
  onDeactivate,
}: {
  fact: Fact;
  active: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
}) {
  return (
    <article
      className={`${styles.panel} ${active ? styles.active : ""}`}
      tabIndex={0}
      onMouseEnter={onActivate}
      onMouseLeave={onDeactivate}
      onFocus={onActivate}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onDeactivate();
      }}
      onClick={onActivate}
    >
      <div className={styles.cap} aria-hidden="true">
        <span className={styles.badge}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {ICONS[fact.icon]}
          </svg>
        </span>
      </div>
      <h3>{fact.title}</h3>
      <p className={styles.big}>{fact.count ? <CountUp {...fact.count} /> : fact.big}</p>
      <p className={styles.caption}>{fact.caption}</p>

      <div className={styles.more} inert={!active}>
        <div className={styles.moreInner}>
          <ul className={styles.points}>
            {fact.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <a className={styles.source} href={fact.source.href} target="_blank" rel="noopener noreferrer">
            Source: {fact.source.label}
          </a>
        </div>
      </div>

      <span className={styles.toggle} aria-hidden="true" />
    </article>
  );
}

// the two halves of the word come together when you tap them
function Companion() {
  const [joined, setJoined] = useState(false);
  return (
    <div className={styles.word}>
      <Image
        src="/images/seeded-loaf.webp"
        alt="A seeded loaf of bread in its baking tin"
        width={1000}
        height={925}
        sizes="(max-width: 1000px) 260px, 340px"
        className={styles.loaf}
      />
      <div className={styles.wordBody}>
        <p className={styles.wordKicker}>A word with deep roots</p>
        <button
          type="button"
          className={`${styles.mix} ${joined ? styles.joined : ""}`}
          aria-pressed={joined}
          aria-label="com plus panis. Tap to put the word together"
          onClick={() => setJoined((value) => !value)}
        >
          <span className={styles.half}>com</span>
          <span className={styles.plus} aria-hidden="true">+</span>
          <span className={styles.half}>panis</span>
          <span className={styles.whole} aria-hidden="true">companion</span>
        </button>
        <p className={styles.wordText}>
          <strong>Companion</strong> comes from the Latin <em>cum panis</em>, which means &ldquo;with bread&rdquo;: a companion is
          someone you share your bread with. The French <em>copain</em> and the Italian <em>compagno</em> grew from the same roots.
        </p>
      </div>
    </div>
  );
}

export default function SharedMeals() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <div className={styles.row} onMouseLeave={() => setOpen(null)}>
        {FACTS.map((fact, index) => (
          <Panel
            key={fact.title}
            fact={fact}
            active={open === index}
            onActivate={() => setOpen(index)}
            onDeactivate={() => setOpen((current) => (current === index ? null : current))}
          />
        ))}
      </div>
      <Companion />
    </>
  );
}
