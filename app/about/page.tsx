import type { Metadata } from "next";
import Image from "next/image";
import BookPreview from "@/components/BookPreview";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About me",
  description: "Why this kitchen exists, and an honest note about what I am and am not.",
};

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
              Before this blog there was a small spiral notebook, filled by hand with the dishes I
              cook, the little drawings that go with them, and the notes I never want to forget.
            </p>
            <p>Turn the pages and have a look.</p>
          </div>
          <BookPreview />
        </div>
      </section>
    </>
  );
}
