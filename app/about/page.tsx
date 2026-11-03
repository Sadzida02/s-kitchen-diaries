import type { Metadata } from "next";
import Image from "next/image";
import BookPreview from "@/components/BookPreview";
import DishViewer from "@/components/DishViewer";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About me",
  description: "Why this kitchen exists, and an honest note about what I am and am not.",
};

type Source = {
  name: string;
  platform: "Instagram" | "YouTube";
  // Instagram only: the account name from instagram.com/<handle>. The card
  // then links to that profile on its own.
  handle?: string;
  // Or paste any full link here (needed for YouTube). It wins over `handle`.
  href?: string;
  // The profile photo: save it in public/images/profiles/ and put the path
  // here. Without it the card shows the first letter of the name.
  image?: string;
};

function linkFor(source: Source) {
  if (source.href) return source.href;
  if (source.handle && source.platform === "Instagram") {
    return `https://www.instagram.com/${source.handle}/`;
  }
  return undefined;
}

const dishes = [
  { name: "Kimbap", areas: [{ left: 13, top: 30, width: 28, height: 35 }] },
  { name: "Baked veggies and chicken", areas: [{ left: 37, top: 26, width: 33, height: 25 }] },
  { name: "Kalcone", areas: [{ left: 30, top: 51, width: 41, height: 27 }] },
  { name: "Carrot salad", areas: [{ left: 69, top: 40, width: 22, height: 16 }] },
];


const sources: Source[] = [
  { name: "deliciousbyarduana", platform: "Instagram", handle: "deliciousbyarduana"},
  { name: "ulusalrarasi_mutfagi", platform: "Instagram", handle: "uluslararasi_mutfagi" },
  { name: "minicakes.ba", platform: "Instagram", handle: "minicakes.ba"},
  { name: "Eslimah", platform: "Instagram", handle:"eslimah"},
  { name: "tracesoats", platform: "Instagram", handle:"tracesoats"},
  { name: "zallibhai", platform: "Instagram", handle:"zallibhai"},
  { name: "tinamakan", platform: "Instagram", handle:"tinamakan"},
  { name: "The Golden Balance", platform: "YouTube", href: "https://www.youtube.com/@thegoldenbalance", image: "/images/profiles/thegoldenbalance.jpg" },
  { name: "Fitgreenmind", platform: "YouTube", href: "https://www.youtube.com/@Fitgreenmind", image: "/images/profiles/fitgreenmind.jpg" },
  { name: "kuhaj i peci", platform: "YouTube", href: "https://www.youtube.com/@kuhajipeci", image: "/images/profiles/kuhajipeci.jpg" },
  { name: "Moja mala kuhinja", platform: "YouTube", href: "https://www.youtube.com/@mojamalakuhinja", image: "/images/profiles/mojamalakuhinja.jpg" },
  { name: "planD플랜디", platform: "YouTube", href: "https://www.youtube.com/@plan_d", image: "/images/profiles/plan_d.jpg" },
  { name: "지현꿍", platform: "YouTube", href: "https://www.youtube.com/@jhyun_u", image: "/images/profiles/jhyun_u.jpg" },
  { name: "로하Roha", platform: "YouTube", href: "https://www.youtube.com/@loveAroha", image: "/images/profiles/lovearoha.jpg" },
  { name: "Mervlog", platform: "YouTube", href: "https://www.youtube.com/@mervlogg", image: "/images/profiles/mervlogg.jpg" },
  { name: "Külpisisi", platform: "YouTube", href: "https://www.youtube.com/@kulpsisi" },
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
        <DishViewer
          src="/images/table-spread.jpg"
          alt="A table spread with kimbap, baked veggies and chicken, kalcone and carrot salad"
          dishes={dishes}
        >
          <p className="kicker">About me</p>
          <h1>A love for cooking, shared around the table.</h1>
          <p className={styles.lead}>
            I like to mix things up. Bosnian recipes sit next to Turkish sweets, Arabic spices, Asian cuisine and healthy bowls share a plate with very indulgent cakes.
            This is where I keep it all.
          </p>
        </DishViewer>
      </section>

      <section className={styles.band}>
        <div className={`container ${styles.disclaimer}`}>
          <p className="kicker">An honest disclaimer</p>
          <h2>I am not a professional cook.</h2>
          <p>
            <strong className={styles.strong}>
              I have no formal cooking training and no real cooking experience outside my own kitchen.
            </strong>{" "}
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
          <div>
          <p className="kicker">Inspired by</p>
          <h2>People around me</h2>
          <br /><br />
            <p>
              Most of my ideas come from the dear people I share my everday life with: my <strong className={styles.mom}>mom</strong>,
                <strong className={styles.aunt}> aunt</strong>, <strong className={styles.cousin}>relatives</strong> and
              my <strong className={styles.friends}>friends</strong>. I recreate
              their recipes, experiment with them, and make them my own.
            </p>
          </div>
         
        </div>
      </section>

      <section className={`section ${styles.inspired}`}>
        <div className="container">
          <div className="section-head">
            <p className="kicker">More inspiration</p>
            <h2>Where my ideas come from</h2>
            <p>
              The people and pages I learn from, experiment with, and recreate recipes from.
            </p>
          </div>

          <h3 className={styles.groupTitle}>Pages I love to learn from</h3>
          <div className={styles.sourceGrid}>
            {sources.map((source, index) => {
              const inner = (
                <>
                  <span className={`${styles.badge} ${index % 2 ? "" : styles.badgeGold}`} aria-hidden="true">
                    {source.image ? (
                      <Image src={source.image} alt="" fill sizes="56px" className={styles.badgePhoto} />
                    ) : (
                      source.name.charAt(0).toUpperCase()
                    )}
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
              const link = linkFor(source);
              return link ? (
                <a
                  key={source.name}
                  href={link}
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
