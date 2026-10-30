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
        <Link href="/recipes" className="btn btn-outline">
          Browse all recipes
        </Link>
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
              className={`${styles.tile} ${index % 2 ? styles.gold : styles.lilac}`}
            >
              <span className={styles.circle}>
                <span className={styles.photoWrap}>
                  <Image
                    src={category.image}
                    alt={category.alt}
                    fill
                    sizes="170px"
                    className={styles.photo}
                  />
                </span>
              </span>
              <span className={styles.title}>{category.title}</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
