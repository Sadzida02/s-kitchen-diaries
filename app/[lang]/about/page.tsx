import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import BookPreview from "@/components/BookPreview";
import AutoRow from "@/components/AutoRow";
import ChefBubble from "@/components/ChefBubble";
import DishViewer from "@/components/DishViewer";
import { getDictionary } from "@/lib/dictionaries";
import { isLocale } from "@/lib/i18n";
import { rich } from "@/lib/rich";
import styles from "./about.module.css";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang).about;
  return { title: t.metaTitle, description: t.metaDescription };
}

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

// where each dish is on the photo (the names come from the dictionary, in the same order)
const dishAreas = [
  [{ left: 13, top: 30, width: 28, height: 35 }],
  [{ left: 37, top: 26, width: 33, height: 25 }],
  [{ left: 30, top: 51, width: 41, height: 27 }],
  [{ left: 69, top: 40, width: 22, height: 16 }],
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

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang).about;
  // the recipe of each dish in the list (same order as the names)
  const dishSlugs = ["kimbap", "carsko", "kalcone", "mrkva-salata"];
  const dishes = t.intro.dishes.map((name, index) => ({ name, slug: dishSlugs[index], areas: dishAreas[index] }));
  // rows of accounts that slide across the whole width of the screen, outside the page column
  const ribbon = (rows: Source[][], extra: string) => (
    <div className={`${styles.ribbon} ${extra}`}>
      {rows.map(
        (row, rowIndex) => (
          <AutoRow key={rowIndex} className={styles.ribbonRow} speed={[26, 22, 30][rowIndex % 3]}>
            {[0, 1].map((copy) =>
              row.map((source, index) => {
                const hidden = copy === 1;
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
                    key={`${copy}-${source.name}`}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.sourceCard} ${styles.link}`}
                    aria-hidden={hidden || undefined}
                    tabIndex={hidden ? -1 : undefined}
                  >
                    {inner}
                  </a>
                ) : (
                  <div
                    key={`${copy}-${source.name}`}
                    className={styles.sourceCard}
                    aria-hidden={hidden || undefined}
                  >
                    {inner}
                  </div>
                );
              }),
            )}
          </AutoRow>
        ),
      )}
    </div>
  );

  return (
    <>
      <section className={styles.intro}>
        <DishViewer
          lang={lang}
          src="/images/table-spread.jpg"
          alt={t.intro.alt}
          dishes={dishes}
          bubble
        >
          <p className="kicker">{t.intro.kicker}</p>
          <h1>{t.intro.title}</h1>
          <p className={styles.lead}>{t.intro.lead}</p>
        </DishViewer>
      </section>

      <section className={styles.band}>
        <div className={`container ${styles.disclaimerRow}`}>
          <ChefBubble
            src="/images/chef/chef-whisk.webp"
            alt={t.disclaimer.chefAlt}
            width={530}
            height={720}
            sizes="(max-width: 900px) 240px, 360px"
            imageClassName={styles.chef}
            buttonLabel={t.disclaimer.chefButton}
            bubble={t.disclaimer.chefBubble}
          />
          <div className={styles.disclaimer}>
          <span className={styles.alert} aria-hidden="true">
              <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <path d="M12 5v9" />
                <path d="M12 19h.01" />
              </svg>
            </span>
            <p className="kicker">{t.disclaimer.kicker}</p>
            <h2>{t.disclaimer.title}</h2>
            <p>
              {t.disclaimer.p1}
              <br />
              <br />
              {t.disclaimer.p2}
            </p>
          </div>
        </div>
      </section>

      <section className={`section ${styles.started}`}>
        <div className={`container ${styles.startedInner}`}>
          <div className={styles.startedText}>
            <p className="kicker">{t.started.kicker}</p>
            <h2>{t.started.title}</h2>
            <p>
              {t.started.p1} {t.started.p2}
            </p>
          </div>
          <BookPreview lang={lang} />
          <div className={`${styles.startedText} ${styles.peopleSide}`}>
            <p className="kicker">{t.started.inspiredKicker}</p>
            <h2>{t.started.inspiredTitle}</h2>
            <p>{rich(t.started.inspiredText, { strong: styles.aunt })}</p>
          </div>
        </div>
      </section>

      <section className={`section ${styles.inspired}`}>
        <div className="container">
          <div className="section-head">
            <p className="kicker">{t.inspired.kicker}</p>
            <h2>{t.inspired.title}</h2>
            <p>{t.inspired.text}</p>
          </div>

        </div>

        {/* two rows on wide screens, three on phones */}
        {ribbon([sources.slice(0, Math.ceil(sources.length / 2)), sources.slice(Math.ceil(sources.length / 2))], styles.ribbonWide)}
        {ribbon([sources.slice(0, 5), sources.slice(5, 10), sources.slice(10)], styles.ribbonNarrow)}
      </section>
    </>
  );
}
