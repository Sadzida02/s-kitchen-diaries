import Image from "next/image";
import styles from "./HeroCollage.module.css";

// Photos for the collage. They fill the six capsules in order: the tall one on
// the far left, the inner one next to it, the long horizontal capsule above
// the heading, the one below it, the inner one on the right and the tall one
// on the far right.
const photos = [
  { src: "/images/salty-kiflice-tray.jpg", alt: "Dark chocolate dates topped with chopped pistachios" },
  { src: "/images/sweet-dates.jpg", alt: "Golden kiflice rolls on a plate" },
  { src: "/images/salty-pizza.jpg", alt: "Seared steak on a white plate with golden rice" },
  { src: "/images/salty-zeljanica2.jpg", alt: "Cinnamon rolls with a sweet glaze" },
  { src: "/images/sweet-umm-ali.jpg", alt: "Baked Umm Ali with a golden top and dark berries" },
  { src: "/images/salty-avo-toast.jpg", alt: "Fruit pastries arranged on a plate" },
];

// the CSS classes (see HeroCollage.module.css) that place each capsule, and
// which photo above each one shows. The two horizontal capsules (s4 and s5)
// are gone, so photos 3 and 4 are not used.
const SLOTS = [
  { slot: "s1", photo: 0 },
  { slot: "s2", photo: 1 },
  { slot: "s7", photo: 4 },
  { slot: "s8", photo: 5 },
];

// The photos sit in a grid around the middle, where the heading goes. Each
// slot has its own position: tall capsules at the sides and one long
// horizontal capsule above and below the heading. Every capsule floats
// gently, each on its own timing.
export default function HeroCollage({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.grid}>
      {SLOTS.map(({ slot, photo: n }, i) => {
        const photo = photos[n];
        return (
          <div
            key={slot}
            className={`${styles.slot} ${styles[slot]}`}
            style={{ ["--i" as string]: i }}
          >
            <div className={styles.tile}>
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                priority
                sizes="(max-width: 900px) 90vw, 30vw"
                className={styles.photo}
              />
            </div>
          </div>
        );
      })}

      <div className={styles.center}>{children}</div>
    </div>
  );
}
