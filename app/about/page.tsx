import type { Metadata } from "next";
import Image from "next/image";
import BookPreview from "@/components/BookPreview";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About me",
  description: "Why this kitchen exists, and an honest note about what I am and am not.",
};

type Source = {
  name: string;
  platform: "Instagram" | "YouTube";
  // Paste the page's link here to make the card clickable.
  href?: string;
};

const people = [
  { name: "My mom", line: "Recipes from home that I keep coming back to." },
  { name: "My aunt", line: "Family dishes I love to recreate in my own way." },
  { name: "My cousin", line: "Always something good to try and cook together." },
  { name: "My friends", line: "The ones who share the same passion for the kitchen." },
];

const sources: Source[] = [
  { name: "delicious by arduana", platform: "Instagram" },
  { name: "ulusalrarasi-mutfagi", platform: "Instagram" },
  { name: "minicakes", platform: "Instagram" },
  { name: "traceoats", platform: "Instagram" },
  { name: "tinamakan", platform: "Instagram" },
  { name: "golden balance", platform: "Instagram" },
  { name: "kuhaj i peci", platform: "YouTube" },
];

function PlatformIcon({ platform }: { platform: Source["platform"] }) {
  return platform === "Instagram" ? (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10 9.5v5l4.5-2.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function AboutPage() {
  return (
    <>
      <section className={styles.intro}>
        <div className={`container ${styles.introInner}`}>
          <div className={styles.introText}>
            <p className="kicker">About me</p>
            <h1>A love for cooking, shared around the table.</h1>
            <p className={styles.lead}>
              I like to mix things up. Bosnian recipes sit next to Turkish sweets, Arabic spices, Asian cuisine and healthy bowls share a plate with very indulgent cakes.
              This is where I keep it all.
            </p>
          </div>
          <div className={`arch ${styles.introArch}`}>
            <Image
              src="/images/table-spread.jpg"
              alt="A spread of baked goods, dishes, and tea on a table"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 460px"
              className={styles.photo}
            />
          </div>
        </div>
      </section>

      <section className={styles.band}>
        <div className={`container ${styles.disclaimer}`}>
          <p className="kicker">A quick, honest note</p>
          <h2>I am not a professional cook.</h2>
          <p>
            I have no formal cooking training and no real cooking experience outside my own kitchen.
            Cooking is my hobby, and my favourite way to play. I am just a girl who loves messing with
            ingredients, tasting everything along the way, and making people around me happy with what
            I make.
          </p>
        </div>
      </section>

      <section className={`section ${styles.started}`}>
        <div className={`container ${styles.startedInner}`}>
          <div className={styles.startedText}>
            <p className="kicker">How it started</p>
            <h2>A little notebook, one recipe at a time</h2>
            <p>
              Before this blog, it all started with a small spiral notebook, filled by hand with all the tried and best dishes that I kept on repeat. These og recipes are the ones I always go back to.
              <br /> <br />
              You have a chance to take a glance in that precious treasure of mine. 
            </p>              
          </div>
          <BookPreview />
        </div>
      </section>

      <section className={`section ${styles.inspired}`}>
        <div className="container">
          <div className="section-head">
            <p className="kicker">Inspired by</p>
            <h2>Where my ideas come from</h2>
            <p>
              The people and pages I learn from, experiment with, and recreate recipes from.
            </p>
          </div>

          <h3 className={styles.groupTitle}>At the table with me</h3>
          <div className={styles.peopleGrid}>
            {people.map((person, index) => (
              <div key={person.name} className={styles.personCard}>
                <span className={`${styles.badge} ${index % 2 ? styles.badgeGold : ""}`} aria-hidden="true">
                  {person.name.replace("My ", "").charAt(0).toUpperCase()}
                </span>
                <h4>{person.name}</h4>
                <p>{person.line}</p>
              </div>
            ))}
          </div>

          <h3 className={styles.groupTitle}>Pages I love to learn from</h3>
          <div className={styles.sourceGrid}>
            {sources.map((source, index) => {
              const inner = (
                <>
                  <span className={`${styles.badge} ${index % 2 ? "" : styles.badgeGold}`} aria-hidden="true">
                    {source.name.charAt(0).toUpperCase()}
                  </span>
                  <span className={styles.sourceText}>
                    <span className={styles.sourceName}>{source.name}</span>
                    <span className={styles.platform}>
                      <PlatformIcon platform={source.platform} />
                      {source.platform}
                    </span>
                  </span>
                </>
              );
              return source.href ? (
                <a
                  key={source.name}
                  href={source.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.sourceCard} ${styles.link}`}
                >
                  {inner}
                </a>
              ) : (
                <div key={source.name} className={styles.sourceCard}>
                  {inner}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
