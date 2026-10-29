import type { Metadata } from "next";
import Image from "next/image";
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
              I like to mix things up. Bosnian recipes sit next to Turkish sweets, Arabic spices
              meet my own strange ideas, and healthy bowls share a plate with very indulgent cakes.
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

      <section className="section">
        <div className={`container ${styles.disclaimer}`}>
          <p className="kicker">A quick, honest note</p>
          <h2>I am not a professional cook.</h2>
          <p>
            I have no formal cooking training and no real cooking experience outside my own kitchen.
            Cooking is my hobby, and my favourite way to play. I am just a girl who loves messing with
            ingredients, tasting everything along the way, and making people around me happy with what
            I make.
          </p>
          <p lang="bs" className={styles.bosnian}>
            Nisam profesionalna kuharica i nemam formalno kuharsko obrazovanje. Kuhanje je moj hobi i
            moj omiljeni način da se igram. Ja sam samo djevojka koja voli da eksperimentiše sa
            namirnicama, proba sve usput i gleda kako se ljudi osmijehuju kad jedu ono što sam
            pripremila.
          </p>
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.story}`}>
          <div className="section-head">
            <p className="kicker">My story</p>
            <h2>Why I started writing it down</h2>
          </div>
          <div className={styles.storyText}>
            <p>
              This blog started as a way to keep track of what I cooked, what worked, and what
              went a little sideways. It turned into a diary of the table: sweet plates, savoury
              plates, and the people who sat around them.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
