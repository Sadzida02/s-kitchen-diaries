import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/recipes";
import styles from "./CategoryRing.module.css";

// All categories as equal circles that slowly orbit a centre. Each one opens
// the recipes page filtered by that category.
export default function CategoryRing() {
  const count = categories.length;

  return (
    <div className={styles.stage}>
      <div className={styles.centre}>
        <h2>Sweet or salty?</h2>
        <p>Pick a circle and see what is cooking.</p>
      </div>

      <div className={styles.ring}>
        {categories.map((category, index) => (
          <div
            key={category.slug}
            className={styles.slot}
            style={{ ["--angle" as string]: `${(360 / count) * index}deg` }}
          >
            <Link
              href={`/recipes?category=${category.slug}`}
              aria-label={category.title}
              className={`${styles.tile} ${index % 2 ? styles.gold : styles.lilac}`}
            >
              <span className={styles.badge}>
                <span className={styles.circle}>
                  <span className={styles.photoWrap}>
                    <Image
                      src={category.image}
                      alt={category.alt}
                      fill
                      sizes="200px"
                      className={styles.photo}
                    />
                  </span>
                </span>
                {/* the name curves around the bottom of the photo */}
                <svg className={styles.label} viewBox="0 0 140 140" aria-hidden="true">
                  <defs>
                    <path id={`arc-${category.slug}`} d="M 9 70 A 61 61 0 0 0 131 70" />
                  </defs>
                  <text>
                    <textPath href={`#arc-${category.slug}`} startOffset="50%" textAnchor="middle">
                      {category.title}
                    </textPath>
                  </text>
                </svg>
              </span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
